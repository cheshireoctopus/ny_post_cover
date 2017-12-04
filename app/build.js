'use strict';

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

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

var URL = 'http://nypost.com/';
var _process$env = process.env,
    ACCOUNT_SID = _process$env.ACCOUNT_SID,
    AUTH_TOKEN = _process$env.AUTH_TOKEN,
    TWILIO_NUMBER = _process$env.TWILIO_NUMBER,
    RECIPIENT_NUMBER = _process$env.RECIPIENT_NUMBER,
    APP_URL = _process$env.APP_URL;

var twilioClient = (0, _twilio2.default)(ACCOUNT_SID, AUTH_TOKEN);
var app = (0, _express2.default)();

app.use(_express2.default.static(__dirname + '/public'));
app.use(_bodyParser2.default.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    return res.sendFile('index.html', { root: __dirname + '/public' });
});

app.get('/test', function (req, res) {
    fetchCover().then(function (cover) {
        sendCover(cover);
        res.send('<img src="' + cover + '">');
    });
});

app.get('/cover', function (req, res) {
    fetchCover().then(function (url) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ url: url }));
    });
});

app.post('/sms', function (req, res) {
    var body = req.body.Body.toLowerCase();
    var twiml = new _twilio2.default.TwimlResponse();

    if (body === 'today\'s cover' || body === 'todays cover' || body === 'today cover') {
        return fetchCover().then(function (cover) {
            twiml.message(function () {
                this.media(cover);
            });
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        });
    } else {
        twiml.message('Hello from NY Post Covers. To fetch the cover of the day, respond with "today\'s cover"');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    }
});

app.listen(process.env.PORT);

var sendCover = function sendCover(coverUrl) {
    twilioClient.messages.create({
        to: RECIPIENT_NUMBER,
        from: TWILIO_NUMBER,
        mediaUrl: coverUrl
    }, function (err, message) {
        if (message) console.log('MESSAGE: ', message);
        if (err) console.log('ERROR: ', err);
    });
};

var fetchCover = function fetchCover() {
    return new Promise(function (resolve, reject) {
        (0, _request2.default)(URL, function (error, response, html) {
            var $ = _cheerio2.default.load(html);
            var cover = $('#home-page-top-right-sidebar picture source').attr('data-srcset');

            if (cover) {
                var imgUrl = cover.split(' ')[0];
                resolve(imgUrl);
            } else {
                resolve('An error occurred fetching this morning\'s cover.');
            }
        });
    });
};

// set reoccurring job every mon, tues, wed, thur, fri, sat @ 1200 UTC
var rule = new _nodeSchedule2.default.RecurrenceRule();
rule.dayOfWeek = new _nodeSchedule2.default.Range(0, 6);
rule.hour = 12;
rule.minute = 0;

// kick off job
_nodeSchedule2.default.scheduleJob(rule, function () {
    fetchCover().then(function (cover) {
        return sendCover(cover);
    });
});

// keep herkou awake - pings the app every 5 minutes
setInterval(function () {
    (0, _request2.default)(APP_URL, function (error, response, body) {
        console.log('ding ding - wake up');
    });
}, 300000);
