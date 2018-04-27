import dotenv from 'dotenv'
import cheerio from 'cheerio'
import request from 'request'
import express from 'express'
import bodyParser from 'body-parser'
import Scheduler from './scheduler.js'
import sendCover from './messenger.js'

dotenv.config()

const URL = 'http://nypost.com/'
const { APP_URL } = process.env

const app = express()

app.use(express.static(__dirname + './../public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.sendFile('index.html', { root: __dirname + '/public' }))

app.get('/test', (req, res) => {
    fetchCover().then(cover => {
        sendCover(cover)
        res.send(`<img src="${cover}">`)
    })
})

app.get('/cover', (req, res) => {
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

app.listen(process.env.PORT, () => {
    console.log(`The magic is going down at ${process.env.PORT}`)
})

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

const scheduledJob = () => fetchCover().then(cover => sendCover(cover))
const scheduler = new Scheduler(scheduledJob)

// keep herkou awake - pings the app every 5 minutes
setInterval(() => {
    request(APP_URL, (error, response, body) => {
        console.log('ding ding - wake up')
    })
}, 300000)
