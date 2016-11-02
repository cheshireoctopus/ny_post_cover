import dotenv from 'dotenv'
import cheerio from 'cheerio'
import request from 'request'
import twilio from 'twilio'
import schedule from 'node-schedule'
import express from 'express'

dotenv.config()

const URL = 'http://nypost.com/covers/'
const { ACCOUNT_SID, AUTH_TOKEN, TWILIO_NUMBER, RECIPIENT_NUMBER } = process.env
const twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN)
const app = express()

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.send('index.html')


})

const sendMMS = (coverUrl) => {
    twilioClient.messages.create({
        to: RECIPIENT_NUMBER,
        from: TWILIO_NUMBER,
        mediaUrl: coverUrl,
    }, (err, message) => {
        if (message) console.log(message)
        if (err) console.log(err)
    })
}

const getCovers = () => request(URL, (error, response, html) => {
    const $ = cheerio.load(html)
    let covers = []

    $('.featured-cover .entry-thumbnail.front source').each((i, element) => {
        covers.push($(element).attr('srcset'))
    })

    sendMMS(covers[0])
})

// set reoccurring job every mon, tues, wed, thur, fri @ 0800
const rule = new schedule.RecurrenceRule()
rule.dayOfWeek = new schedule.Range(1, 5)
rule.hour = 8
rule.minute = 0

// kicks off job
schedule.scheduleJob(rule, () => getCovers())

app.listen(process.env.PORT, () => {
    console.log(`shit is doing down on ${process.env.PORT}`)

    // test msg
    twilioClient.messages.create({
        to: RECIPIENT_NUMBER,
        from: TWILIO_NUMBER,
        body: 'server is up and running',
    }, (err, message) => {
        if (message) console.log(message)
        if (err) console.log(err)
    })
})
