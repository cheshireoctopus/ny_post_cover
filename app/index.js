import dotenv from 'dotenv'
import cheerio from 'cheerio'
import request from 'request'
import twilio from 'twilio'
import schedule from 'node-schedule'
import express from 'express'
import bodyParser from 'body-parser'

dotenv.config()

const URL = 'http://nypost.com/'
const { ACCOUNT_SID, AUTH_TOKEN, TWILIO_NUMBER, RECIPIENT_NUMBER, APP_URL } = process.env
const twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN)
const app = express()

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.sendFile('index.html', { root: __dirname + '/public' }))

app.get('/test', (req, res) => {
    fetchCover().then(cover => {
        sendCover(cover)
        res.send(`<img src="${cover}">`)
    })
})

app.get('/fetch', (req, res) => {
    fetchCover().then(url => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify({ url }))
    })
})

app.post('/sms', (req, res) => {
    const body = req.body.Body.toLowerCase()
    const twiml = new twilio.TwimlResponse()

    if (body === 'today\'s cover' || body === 'todays cover' || body === 'today cover') {
        return fetchCover()
            .then(cover => {
                twiml.message(function() {
                  this.media(cover);
                });
                res.writeHead(200, {'Content-Type': 'text/xml'})
                res.end(twiml.toString())
            })
    } else {
        twiml.message(`Hello from NY Post Covers. To fetch the cover of the day, respond with "today's cover"`)
        res.writeHead(200, {'Content-Type': 'text/xml'})
        res.end(twiml.toString())
    }
})

app.listen(process.env.PORT)

const sendCover = (coverUrl) => {
    twilioClient.messages.create({
        to: RECIPIENT_NUMBER,
        from: TWILIO_NUMBER,
        mediaUrl: coverUrl,
    }, (err, message) => {
        if (message) console.log('MESSAGE: ', message)
        if (err) console.log('ERROR: ', err)
    })
}

const fetchCover = () => {
    return new Promise((resolve, reject) => {
        request(URL, (error, response, html) => {
            const $ = cheerio.load(html)
            const cover = $('#home-page-top-right-sidebar picture source').attr('data-srcset')

            if (cover) {
                const imgUrl = cover.split(' ')[0]
                resolve(imgUrl)
            } else {
                resolve('An error occurred fetching this morning\'s cover.')
            }
        })
    })
}

// set reoccurring job every mon, tues, wed, thur, fri, sat @ 1200 UTC
const rule = new schedule.RecurrenceRule()
rule.dayOfWeek = new schedule.Range(0, 6)
rule.hour = 12
rule.minute = 0

// kick off job
schedule.scheduleJob(rule, () => {
    fetchCover().then(cover => sendCover(cover))
})

// keep herkou awake - pings the app every 5 minutes
setInterval(() => {
    request(APP_URL, (error, response, body) => {
        console.log('ding ding - wake up')
    })
}, 300000)
