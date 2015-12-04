# coffeelint: disable=no_debugger

postData = (data) ->
  d3.xhr("postData")
    .header("Content-Type", "application/json")
    .post JSON.stringify data

pages = require('./configuration')()

console.log 'User Study application started.'

baseHash = "user_#{new Date().getTime()}"
userStartTime = new Date().getTime()

hash = window.location.hash.substring(1) || baseHash

body = d3.select("html").selectAll("body").data([1])
body.enter().append("body")

main = body.append("div").classed("container", true)
  .append("div").classed("row", true)
  .append("main").classed("col-xs-10 col-xs-offset-1", true)

updatePage = (page) ->
  return new Promise (resolve) ->
    startTime = new Date().getTime()
    console.log "Page: %o", page.name
    page.func(main).then resolve

pages.reduce (previous, current) ->
  previous.then ->
    updatePage current
      .then (resultData) ->
        console.log "Result %o", resultData
        postData resultData
, Promise.resolve()
