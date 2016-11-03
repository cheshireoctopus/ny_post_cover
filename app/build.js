'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _twilio = require('twilio');

var _twilio2 = _interopRequireDefault(_twilio);

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

_dotenv2['default'].config();

var URL = 'http://nypost.com/covers/';
var _process$env = process.env;
var ACCOUNT_SID = _process$env.ACCOUNT_SID;
var AUTH_TOKEN = _process$env.AUTH_TOKEN;
var TWILIO_NUMBER = _process$env.TWILIO_NUMBER;
var RECIPIENT_NUMBER = _process$env.RECIPIENT_NUMBER;

var twilioClient = (0, _twilio2['default'])(ACCOUNT_SID, AUTH_TOKEN);
var app = (0, _express2['default'])();

app.use(_express2['default']['static'](__dirname + '/public'));
app.get('/', function (req, res) {
    return res.sendFile('index.html', { root: __dirname + '/public' });
});
app.listen(process.env.PORT);

var sendMMS = function sendMMS(coverUrl) {
    twilioClient.messages.create({
        to: RECIPIENT_NUMBER,
        from: TWILIO_NUMBER,
        mediaUrl: coverUrl
    }, function (err, message) {
        if (message) console.log(message);
        if (err) console.log(err);
    });
};

var getCovers = function getCovers() {
    return (0, _request2['default'])(URL, function (error, response, html) {
        var $ = _cheerio2['default'].load(html);
        var covers = [];

        $('.featured-cover .entry-thumbnail.front source').each(function (i, element) {
            return covers.push($(element).attr('srcset'));
        });

        sendMMS(covers[0]);
    });
};

// set reoccurring job every mon, tues, wed, thur, fri @ 0800
var rule = new _nodeSchedule2['default'].RecurrenceRule();
rule.dayOfWeek = new _nodeSchedule2['default'].Range(1, 5);
rule.hour = 8;
rule.minute = 0;

// kicks off job
_nodeSchedule2['default'].scheduleJob(rule, function () {
    return getCovers();
});

// keep herkou awake
setInterval(function () {
    (0, _request2['default'])('https://obscure-oasis-13928.herokuapp.com/', function (error, response, body) {
        console.log('ding ding - wake up');
    });
}, 300000);
