'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCHEDULES = {
  daily: {
    dayOfWeek: new _nodeSchedule2.default.Range(0, 6),
    hour: 12,
    minute: 0
  }
};

var Scheduler = function () {
  function Scheduler(scheduledJob) {
    _classCallCheck(this, Scheduler);

    this.scheduledJob = scheduledJob;

    this.rule = new _nodeSchedule2.default.RecurrenceRule();
    this.rule.dayOfWeek = new _nodeSchedule2.default.Range(0, 6);
    this.rule.hour = 12;
    this.rule.minute = 0;
  }

  _createClass(Scheduler, [{
    key: 'scheduleJob',
    value: function scheduleJob() {
      _nodeSchedule2.default.scheduleJob(this.rule, this.scheduledJob);
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;