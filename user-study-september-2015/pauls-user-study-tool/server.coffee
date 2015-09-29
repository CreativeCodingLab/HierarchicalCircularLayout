express = require 'express'
app = express()
server = require('http').createServer(app)
path = require 'path'
bodyParser = require 'body-parser'
fs = require 'fs'
serveIndex = require 'serve-index'

browserify = require 'browserify-middleware'
coffeeify = require 'coffeeify'

browserify.settings 'extensions', ['.coffee']
browserify.settings 'transform', [coffeeify]
browserify.settings 'grep', /\.coffee$|\.js$/
browserify.settings 'minify', false
browserify.settings 'debug', true

app.use express.static path.resolve(__dirname, 'static/images')
app.use express.static path.resolve(__dirname, 'static')
app.use '/output', serveIndex path.resolve __dirname, 'static', 'output'

yearMonthDay = do ->
  d = new Date()
  "#{d.getFullYear()}-#{d.getMonth()}-#{d.getDay()}"

outputFile = do ->
  path.resolve __dirname, 'static', 'output', "output-#{yearMonthDay}.txt"

writeData = (data) ->
  string = "#{JSON.stringify(data)},\n"
  fs.appendFile outputFile, string, (err) ->
    if (err) then throw err

app.use '/postData', bodyParser.json(), (request, response) ->
  console.log request.body
  writeData request.body
  response.end()

app.get '/application', browserify('./application/main.coffee')

port = process.env.PORT || 8080
ip = process.env.IP || '0.0.0.0'

server.listen port, ->
  console.log('Server listening at port %d', port)
