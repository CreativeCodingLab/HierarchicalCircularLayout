express = require 'express'
app = express()
server = (require 'http').Server app
io = require('socket.io')(server)

portfinder = require 'portfinder'

browserify = require 'browserify-middleware'
coffeeify = require 'coffeeify'

browserify.settings 'extensions', ['.coffee']
browserify.settings 'transform', [coffeeify]
browserify.settings 'grep', /\.coffee$|\.js$/

module.exports =
  express: express
  app: app
  server: server
  browserify: browserify
  io: io

  portPromise: (port) ->
    new Promise (resolve) ->
      portfinder.getPort port: port, (error, port) -> resolve port

  standardCallback: (server) ->
    ->
      a = server.address().address
      p = server.address().port
      console.log("HTTP Server listening at #{a}, port #{p}")

  listen: (port) ->
    new Promise (resolve) =>
      @portPromise(port).then (port) => @server.listen port, resolve

  listenWithCallback: (port) ->
    @listen(port).then @standardCallback @server
