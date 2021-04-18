require 'dotenv/load'
require 'sinatra'
require 'sinatra/reloader' if development?
require 'open-uri'
require 'net/http'
require 'nokogiri'
require 'twilio-ruby'
require 'rufus-scheduler'

ACCOUNT_SID = ENV['ACCOUNT_SID']
AUTH_TOKEN = ENV['AUTH_TOKEN']
TWILIO_NUMBER = ENV['TWILIO_NUMBER']
RECIPIENT_NUMBER = ENV['RECIPIENT_NUMBER']

get '/' do
  @cover_url = get_cover_url

  erb :index
end

get '/test' do
  cover_url = get_cover_url
  sms_cover(cover_url)

  "testing #{cover_url}"
end

def get_cover_url
  doc = Nokogiri::HTML(open("https://nypost.com/covers/"))
  doc.css('source')[0]['data-srcset'].split().first
end

def sms_cover(cover_url)
  client = Twilio::REST::Client.new(ACCOUNT_SID, AUTH_TOKEN)

  client.messages.create(
    from: TWILIO_NUMBER,
    to: RECIPIENT_NUMBER,
    media_url: cover_url
  )
end

scheduler = Rufus::Scheduler.new

scheduler.every '7m' do
  uri = URI('https://ny-post-cover.herokuapp.com/')
  Net::HTTP.get(uri)
end

scheduler.cron('0 12 * * *') do
  cover_url = get_cover_url
  sms_cover(cover_url)
end
