# NY Post Cover via SMS

## Setup:

1. Install dependencies

Assuming you have Ruby installed:

```
bundle install
```

2. Create an `.env` file at project root containing:

```
ACCOUNT_SID=<ACCOUNT_SID_HERE>
AUTH_TOKEN=<AUTH_TOKEN_HERE>
TWILIO_NUMBER=<TWILIO_NUMBER_HERE>
RECIPIENT_NUMBER=<RECIPIENT_NUMBER_HERE>
```

Where `ACCOUNT_SID`, `AUTH_TOKEN`, and `TWILIO_NUMBER` can be found within Twilio's settings.

3. Start the application with `ruby app.rb`
