# coffeelint: disable=no_debugger

postData = (data) ->
  d3.xhr("postData")
    .header("Content-Type", "application/json")
    .post JSON.stringify data

# pages = require('./configuration')()

console.log 'User Study application started.'

baseHash = "user_#{new Date().getTime()}"
userStartTime = new Date().getTime()

userId = window.location.hash.substring(1) || baseHash

body = d3.select("html").selectAll("body").data([1])
body.enter().append("body")

main = body.append("div").classed("container-fluid", true)
  .append("div").classed("row", true)
  .append("main").classed("col-xs-12", true)

updatePage = (page) ->
  return new Promise (resolve) ->
    startTime = new Date().getTime()
    console.group "Page: %o", page.name
    opts = { main, userId, userStartTime }
    page.func(opts)
      .then (d) -> resolve(d)

pages.reduce (previous, current) ->
  previous.then ->
    updatePage current
      .then (resultData) ->
        console.info "Result %o", resultData
        console.groupEnd()
        postData resultData
, Promise.resolve()
