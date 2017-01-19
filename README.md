# NYPost Cover + SMS

Covers from the world's most respected news institution delivered, via SMS, bright and early every morning.

## Setup

Run `npm install` at project root.

Create a `.env` file at project root containing:
```
ACCOUNT_SID='<TWILIO_ACCOUNT_SID>'
AUTH_TOKEN='<TWILIO_AUTH_TOKEN>'
TWILIO_NUMBER='<TWILIO_PHONE_NUMBER>'
RECIPIENT_NUMBER='<RECIPIENT_PHONE_NUMBER>'
PORT=`<PORT>`
APP_URL='<APPLICATION_URL>'
```
Run `npm run build` to transpile `app/index.js` to `app/build.js`.
