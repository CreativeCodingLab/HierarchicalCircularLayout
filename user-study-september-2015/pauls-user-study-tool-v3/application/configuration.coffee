# coffeelint: disable=no_debugger

module.exports = ->
  pages = []

  continue_button = ["Continue"]
  
  addVis = (main, layout, data, treeOnly) ->
    v = main.selectAll('.row.vis').data(Array(1))
    v.enter().append('div').classed('row vis', true)
      .append('div').classed('col-xs-12', true)
      .append('div').classed('frame', true)
      .style width: "100%", height: "70vh", border: "1px solid #ccc"
      .call (frame) ->
        window[layout](data, frame, treeOnly)
  
  addContinue = (main) ->
    c = main.append('div').classed('row', true)
      .append('div').classed('col-xs-12', true)
      .append('button').classed('btn btn-secondary', true)
      .text('continue')
    return new Promise (resolve) -> 
      c.on 'click', ->
        main.html ''
        resolve {}
  
  pages.push {
    name: 'part_1_intro',
    func: (main) ->
      main.append 'h1'
        .text 'Part 1'
      return addContinue main
  }
  
  layouts = [
  	#'circlePacking',
  	#'hcl',
  	'classical',
  	'icicle',
  	'radial',
  	'radialInsideTree',
  	'treeMap'
  ];
  dataPath = 'data/';
  datasets = [
  	#"0_RAF_Dot.json",
  	"1_Activation of Pro-caspase 8 Pathway.json",
  	"2_ERBB2 Pathway.json",
  	"3_Signaling to GPCR Pathway.json",
  	"flare package.json",
  	"carnivoraWithRelationships.json",
  	#"mammalsWithRelationships.json",
  	#"1_RAF-Cascade Pathway.json",
  	#"54_DAG Pathway.json",
  	#"3_NGF Pathway.json"
  ].map (d) -> "#{dataPath}#{d}"
  
  addText = (main, text) ->
    main.append('div').classed 'row', true
      .append('div').classed 'col-xs-12', true
      .append 'p'
      .text text
      .style margin: '10px 0'
  
  part_1 = layouts.map (layout, li) ->
    datasets.map (data, di) ->
      return [
        {
          name: "part_1_#{li}_#{di}_a"
          layout: layout
          data: data
          func: (main) ->
            text = "What is the height of this tree?"
            addText main, text
            addVis main, layout, data, true
            return addContinue main
        }
        {
          name: "part_1_#{li}_#{di}_b"
          layout: layout
          data: data
          func: (main) ->
            text = "Please select the node with the highest degree."
            addText main, text
            addVis main, layout, data, true
            return addContinue main
        }
      ]
  .reduce (a, b) -> return a.concat b
  .reduce (a, b) -> return a.concat b
      
  pages = pages.concat part_1
  
  console.log pages
  
  return pages

#'//var file = "../data/1_Activation of Pro-caspase 8 Pathway.json";
#//var file = "../data/2_ERBB2 Pathway.json";
#//var file = "../data/3_Signaling to GPCR Pathway.json";
#//var file = "../data/flare package.json";
#var file = "../data/carnivoraWithRelationships.json";
#//var file = "../data/mammalsWithRelationships.json";