import dotenv from 'dotenv'
import twilio from 'twilio'

dotenv.config()

const {
  ACCOUNT_SID,
  AUTH_TOKEN,
  TWILIO_NUMBER,
  RECIPIENT_NUMBER
} = process.env

const twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN)

const sendCover = coverUrl => {
  twilioClient.messages.create({
    to: RECIPIENT_NUMBER,
    from: TWILIO_NUMBER,
    mediaUrl: coverUrl,
  }, (err, message) => {
    if (message) console.log('MESSAGE: ', message)
    if (err) console.log('ERROR: ', err)
  })
}

export default sendCover
