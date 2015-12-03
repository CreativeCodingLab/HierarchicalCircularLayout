# coffeelint: disable=no_debugger

module.exports = ->
  pages = []

  continue_button = ["Continue"]
  
  addVis = (main, layout, queryData, randomSeed, height, degree, treeOnly, hasSubtree, showSubtree) ->
    v = main.selectAll('.row.vis').data(Array(1))
    v.enter().append('div').classed('row vis', true)
      .append('div').classed('col-xs-12', true)
      .append('div').classed('frame', true)
      .style width: "100%", height: "70vh", border: "1px solid #ccc"
      .call (frame) ->
        window[layout](queryData, randomSeed, height, degree, frame, treeOnly, hasSubtree, showSubtree)
  
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
  	       #'circlePacking', # not used for the study any longer
  	'hcl',
    'icicle',
    'treeMap',
    'ballon',
    'classical',
    'radialTree',
           #'radial', #This is for edge bundling only
  	
  	
  ];
  dataPath = 'data/';
  queryDatasets = [
  	"0_introTree.json",
    "0_RAF_Dot.json",
  	"1_Activation of Pro-caspase 8 Pathway.json",
    "2_ERBB2 Pathway.json",
    "3_Signaling to GPCR Subtree.json",
    "3_Signaling to GPCR Subtree2.json",
    "3-Rb-E2FpathwayReactome_Dot.json",
    "54_DAG Pathway.json",
    "flare subtree1.json"
      #"flare subtree2.json"
    "carnivoraWithRelationships subtree.json",
    "carnivoraWithRelationships subtree2.json",
    
    
    "0_RAF_Dot.json", #intro
    "3-Rb-E2FpathwayReactome_Dot.json",
    "HIV Infection_Dot.json",
    "2_ERBB2 Pathway orginal.json", 
    "flare package2.json",
    

    coi them
    #"3_NGF Pathway.json",   #nodes are too small on ballon layout
    #"3_Signaling to GPCR Pathway.json", #nodes are too small
    

    #"carnivoraWithRelationships.json",
    #"mammalsWithRelationships.json",

    

     
    
  ].map (d) -> "#{dataPath}#{d}"
  
  seed = 1000;
  randomList = [1021,1321,222,322];
  
  addText = (main, text) ->
    main.append('div').classed 'row', true
      .append('div').classed 'col-xs-12', true
      .append 'p'
      .text text
      .style margin: '10px 0'
  
  part_1 = layouts.map (layout, li) ->
      randomList.map (randomSeed, di) ->
        return [
          {
            name: "part_1_layout_#{li}_data_#{di}_a"
            layout: layout
            data: randomSeed
            func: (main) ->
              text = "Can you find the subtree (left) in the tree (right)?"
              addText main, text
              addVis main, layout, queryDatasets[16], randomSeed, 6, 8, false, false, false
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