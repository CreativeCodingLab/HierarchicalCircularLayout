// Generated by CoffeeScript 1.10.0
(function() {
  var app, bodyParser, browserify, coffeeify, express, fs, ip, outputFile, path, port, serveIndex, server, writeData, yearMonthDay;

  express = require('express');

  app = express();

  server = require('http').createServer(app);

  path = require('path');

  bodyParser = require('body-parser');

  fs = require('fs');

  serveIndex = require('serve-index');

  browserify = require('browserify-middleware');

  coffeeify = require('coffeeify');

  browserify.settings('extensions', ['.coffee']);

  browserify.settings('transform', [coffeeify]);

  browserify.settings('grep', /\.coffee$|\.js$/);

  browserify.settings('minify', false);

  browserify.settings('debug', true);

  app.use(express["static"](path.resolve(__dirname, 'static/images')));

  app.use(express["static"](path.resolve(__dirname, 'static')));

  app.use('/output', serveIndex(path.resolve(__dirname, 'static', 'output')));

  yearMonthDay = (function() {
    var d;
    d = new Date();
    return (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDay());
  })();

  outputFile = (function() {
    return path.resolve(__dirname, 'static', 'output', "output-" + yearMonthDay + ".txt");
  })();

  console.log(outputFile);

  writeData = function(data) {
    var string;
    string = (JSON.stringify(data)) + ",\n";
    return fs.appendFile(outputFile, string, function(err) {
      if (err) {
        console.error("there was an error trying to write to the file");
        throw err;
      }
    });
  };

  app.use('/postData', bodyParser.json(), function(request, response) {
    console.log(request.body);
    writeData(request.body);
    return response.end();
  });

  app.get('/application', browserify('./application/main.coffee'));

  port = process.argv[2] || process.env.PORT || 8080;

  ip = process.env.IP || '0.0.0.0';

  server.listen(port, function() {
    return console.log('Server listening at port %d', port);
  });

}).call(this);
