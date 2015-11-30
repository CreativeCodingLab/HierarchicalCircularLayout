# coffeelint: disable=no_debugger

module.exports = ->

  continue_button = ["Continue"]
  
  addVis = (main, layout, queryData, randomSeed, height, degree, treeOnly, hasSubtree, showSubtree) ->
    v = main.selectAll('.row.vis').data(Array(1))
    v.enter().append('div').classed('row vis', true)
      .append('div').classed('col-xs-12', true)
      .append('div').classed('frame', true)
      .style width: "100%", height: "70vh", border: "1px solid #ccc"
      .call (frame) ->
        window[layout](queryData, randomSeed, height, degree, frame, treeOnly, hasSubtree, showSubtree)
        
  addSubTreeQuestion = (main) ->
    
  addContinue = (main) ->
    # c = main.append('div').classed('row', true)
    c = main.insert('div', '.vis').classed('row', true)
      .append('div').classed('col-xs-12', true)
      .append('div').classed('btn-group', true)
      .append('button').classed('btn btn-secondary', true)
      .text('continue')
    return new Promise (resolve) -> 
      c.on 'click', ->
        main.html ''
        resolve {}

  
  layouts = [
  	       #'circlePacking', # not used for the study any longer
  	'classical',
  	'icicle',
  	'treeMap',
           #'radial', #This is for edge bundling only
  	'radialInsideTree',
  # 	'ballon',
    'hcl'
  ];
  dataPath = 'data/';
  queryDatasets = [
  	"0_RAF_Dot.json",
  	"1_Activation of Pro-caspase 8 Pathway.json",
  	"2_ERBB2 Pathway.json",
  	"3_Signaling to GPCR Pathway.json",
  	"flare package.json",
  	#"carnivoraWithRelationships.json",
  	#"mammalsWithRelationships.json",
  	#"1_RAF-Cascade Pathway.json",
  	#"54_DAG Pathway.json",
  	#"3_NGF Pathway.json"
  ].map (d) -> "#{dataPath}#{d}"
  
  seed = 1000;
  randomList = [1021,1311,2522,3422];
  
  addHtml = (main, html) ->
    main.append('div').classed 'row', true
      .append('div').classed 'col-xs-12', true
      .append 'p'
      .html html
      .style margin: '10px 0'
  
  part_1_nested = queryDatasets.map (data, di) ->
    layouts.map (layout, li) ->
      randomList.map (randomSeed, si) ->
        return [
          {
            name: "part_1_layout_#{li}_data_#{di}_seed_#{si}_a"
            func: (main) ->
              startTime = new Date().getTime()
              console.info "data", data
              console.info "layout", layout
              console.info "randomSeed", randomSeed
              
              html = "How many times does the subtree on the right appear in the tree on the left?"
              addHtml main, html
              # addVis main, layout, queryDatasets[1], randomSeed, 6, 6, true, true, true
              addVis main, layout, data, randomSeed, 6, 6, true, true, true
              return addContinue main
          }
        ]

  part_1 = _.flatten part_1_nested
  
  pages = []
  
  pages.push {
    name: 'part_1_intro',
    func: (main) ->
      main.append 'h1'
        .text 'Part 1'
      return addContinue main
  }
      
  pages = pages.concat part_1
  
  console.log pages
  
  return pages

#'//var file = "../data/1_Activation of Pro-caspase 8 Pathway.json";
#//var file = "../data/2_ERBB2 Pathway.json";
#//var file = "../data/3_Signaling to GPCR Pathway.json";
#//var file = "../data/flare package.json";
#var file = "../data/carnivoraWithRelationships.json";
#//var file = "../data/mammalsWithRelationships.json";