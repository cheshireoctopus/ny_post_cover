require 'dotenv/load'
require 'sinatra'
require 'open-uri'
require 'nokogiri'
require 'twilio-ruby'

ACCOUNT_SID = ENV['ACCOUNT_SID']
AUTH_TOKEN = ENV['AUTH_TOKEN']
TWILIO_NUMBER = ENV['TWILIO_NUMBER']
RECIPIENT_NUMBER = ENV['RECIPIENT_NUMBER']

get '/' do
  client = Twilio::REST::Client.new(ACCOUNT_SID, AUTH_TOKEN)
  doc = Nokogiri::HTML(open("https://nypost.com/covers/"))

  @cover_url = doc.css('source')[0]['data-srcset'].split().first

  message = client.messages.create(
    from: TWILIO_NUMBER,
    to: RECIPIENT_NUMBER,
    media_url: @cover_url
  )

  erb :index
end
