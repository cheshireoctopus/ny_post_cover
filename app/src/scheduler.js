import schedule from 'node-schedule'

const SCHEDULES = {
  daily: {
    dayOfWeek: new schedule.Range(0, 6),
    hour: 12,
    minute: 0,
  }
}

export default class Scheduler {
  constructor(scheduledJob) {
    this.scheduledJob = scheduledJob

    this.rule = new schedule.RecurrenceRule()
    this.rule.dayOfWeek = new schedule.Range(0, 6)
    this.rule.hour = 12
    this.rule.minute = 0
  }

  scheduleJob() {
    schedule.scheduleJob(this.rule, this.scheduledJob)
  }
}
