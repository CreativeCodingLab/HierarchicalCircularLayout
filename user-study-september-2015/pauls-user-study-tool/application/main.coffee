# coffeelint: disable=no_debugger

postData = (data) ->
  d3.xhr("postData")
    .header("Content-Type", "application/json")
    .post JSON.stringify data
    # .post JSON.stringify { test: "it works" }

config = require('./configuration')()

console.log 'User Study application started.'

baseHash = "user_#{new Date().getTime()}"
userStartTime = new Date().getTime()

console.log baseHash

hash = window.location.hash.substring(1) || baseHash

console.log hash

initialize = ->
  d3.select("html").selectAll("body").data([1])
    .enter().append("body")
    .append("div").classed("container", true)
    .append("div").classed("row", true)
    .append("main").classed("col-xs-10 col-xs-offset-1", true)

showRows = ["text", "options", "images"]

addText = (row) ->
  # row.style height: "100px"
  col = row.selectAll(".col-xs-12").data (d) -> [d]
  col.enter().append("div").classed("col-xs-12", true)
    .style
      display: "flex"
      "align-items": "center"
      height: "100px"
  col.html (d) -> "#{d.value}"

addButtons = (row) ->
  col = row.selectAll("div").data (d) -> [d]
  col.enter().append("div").classed("col-xs-7", true)

  buttons = col.selectAll("button").data (d) -> d.value
  buttons.exit().remove()
  buttons.enter().append("button").classed("btn", true)
    .style(
      "min-width": "10%"
      "background-color": "white"
      "border-color": "#aaa"
      "border": "1px solid #aaa"
    )
  buttons.text (d) -> d
  
addRow = (page, startTime) ->
  return (d) ->
    row = d3.select this
  
    row.selectAll("div").remove()
  
    if d.key is "text" then row.call addText
  
    #if d.key is "options"
      #row.call addButtons
        #.selectAll "button"
        #.on "click", (d) ->
          #obj =
            #page: page
            #response: d
            #time: new Date()
            #userHash: page.userHash || hash
            #responseTime: new Date().getTime() - startTime
            #userStartTime: userStartTime
          #resolve obj
  
    if d.key is "images"
      # row.style "height": "500px"
      images = d.value
      numImages = images.length
      colWidth = Math.floor 12 / images.length
      # colWidth = colWidth
      imageColumns = row.selectAll(".image").data (d) -> d.value
      imageColumns.exit().remove()
      imageColumns.enter().append("div")
        .style
          "height": "#{window.innerHeight * .7}px" # "500px"
          "margin-top": "100px"
        .append("img")
        # .classed("center-block img-responsive", true)
        .classed("center-block", true)
        .style
          "max-height": "100%"
          "max-width": "100%"
      imageColumns
        .attr("class", "col-xs-#{colWidth} image") # Override old classes!
        .select("img")
        .attr "src", (d) -> d
            
updatePage = (page) ->
  return new Promise (resolve) ->
    startTime = new Date().getTime()
    console.log "Page: %o", page
    rowData = d3.entries(page).filter (d) -> showRows.indexOf(d.key) > -1
    rows = d3.select("main").selectAll(".row").data(rowData)
    rows.enter().append("div").classed("row", true)
      .style
        display: "flex"
        "align-items": "center"
    rows.exit().remove()
    rows.each addRow(page, startTime)
    rows.each (d) ->
      if d.key is "options"
        d3.select(this).call addButtons
          .selectAll "button"
          .on "click", (d) ->
            obj =
              page: page
              response: d
              time: new Date()
              userHash: page.userHash || hash
              responseTime: new Date().getTime() - startTime
              userStartTime: userStartTime
            resolve obj
    if page.pageHook? then page.pageHook(page)


do initialize

flatten = (array) ->
  array.reduce (last, current) ->
    last.concat current

recursiveFlatten = (array) ->
  if array.every((d) -> d.constructor is Array)
    return recursiveFlatten flatten array
  else
    return array

getTaskBlockPages = (taskBlock) ->
  dataIds = taskBlock.dataIds
  subtreeIds = taskBlock.subtreeIds
  questionPages = taskBlock.question_pages

  combinations = taskBlock.layouts.map (layout) ->
    dataIds.map (dataId) ->
      if subtreeIds
        return subtreeIds.map (subtreeId) ->
          layout: layout, dataId: dataId, subtreeId: subtreeId
      else
        return layout: layout, dataId: dataId

  combinations = recursiveFlatten combinations

  d3.shuffle combinations

  pages = recursiveFlatten combinations.map (subtree) ->
    args = [taskBlock.image_folder].concat d3.values(subtree)
    images = taskBlock.imagesFunction.apply this, args
    questionPages.map (question) ->
      pageHook: taskBlock.pageHook
      questionName: question.questionName
      taskBlockName: taskBlock.name
      imageFolder: taskBlock.image_folder || ""
      text: question.text
      options: question.options
      layout: subtree.layout
      dataId: subtree.dataId
      subtreeId: subtree.subtreeId
      userHash: hash
      # images: taskBlock.imagesFunction.apply this, d3.values subtree
      images: images

  intro = taskBlock.intro_pages || []

  return intro.concat pages

taskPages = do ->
  # d3.shuffle config.task_blocks
  recursiveFlatten config.task_blocks.map getTaskBlockPages

intro = config.study_intro_pages || []

pages = intro.concat taskPages
  .concat config.study_outro_pages

pages.reduce (previous, current) ->
  previous.then ->
    updatePage current
      .then (resultData) ->
        console.log "Result %o", resultData
        postData resultData
, Promise.resolve()
