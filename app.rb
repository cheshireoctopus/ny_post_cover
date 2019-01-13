require 'dotenv/load'
require 'sinatra'
require 'open-uri'
require 'nokogiri'
require 'twilio-ruby'
require 'rufus-scheduler'

ACCOUNT_SID = ENV['ACCOUNT_SID']
AUTH_TOKEN = ENV['AUTH_TOKEN']
TWILIO_NUMBER = ENV['TWILIO_NUMBER']
RECIPIENT_NUMBER = ENV['RECIPIENT_NUMBER']

get '/' do
  @cover_url = scrape_the_post
  sms_the_cover(@cover_url)

  erb :index
end

def scrape_the_post
  doc = Nokogiri::HTML(open("https://nypost.com/covers/"))
  doc.css('source')[0]['data-srcset'].split().first
end

def sms_the_cover(cover_url)
  client = Twilio::REST::Client.new(ACCOUNT_SID, AUTH_TOKEN)

  message = client.messages.create(
    from: TWILIO_NUMBER,
    to: RECIPIENT_NUMBER,
    media_url: cover_url
  )
end

scheduler = Rufus::Scheduler.new

scheduler.cron('0 8 * * *') do
  @cover_url = scrape_the_post
  sms_the_cover(@cover_url)
end
