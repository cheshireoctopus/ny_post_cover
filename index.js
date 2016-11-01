require('dotenv').config();
import cheerio from 'cheerio'
import request from 'request'
import twilio from 'twilio'

const URL = 'http://nypost.com/covers/'
const { ACCOUNT_SID, AUTH_TOKEN, TWILIO_TEST_NUMBER, TEST_RECIPIENT } = process.env

const sendTxt = (covers) => {
    //require the Twilio module and create a REST client
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN)
    const body = covers.join(' ')

    client.messages.create({
        to: TEST_RECIPIENT,
        from: TWILIO_TEST_NUMBER,
        body,
    }, (err, message) => {
    	if (message) console.log(message)
    	if (err) console.log(err)
    })
}

request(URL, (error, response, html) => {
    const $ = cheerio.load(html)
    let covers = []

    $('.featured-cover .entry-thumbnail.front source').each((i, element) => {
    	covers.push($(element).attr('srcset'))
    })

    sendTxt([covers[0], covers[2]])
})
