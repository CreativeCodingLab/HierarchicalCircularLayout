/* global _, d3 */

var addContinue, addHtml, addVis, continue_button, dataPath, layouts, pages, 
part_1, part_1_nested, queryDatasets, randomList, seed, subtreeQuestion;
continue_button = ["Continue"];
addVis = function(main, layout, queryData, randomSeed, height, degree, treeOnly, hasSubtree, showSubtree) {
  var v;
  v = main.selectAll('.row.vis').data(Array(1));
  return v.enter()
    .append('div').classed('row vis', true)
    .append('div').classed('col-xs-12', true)
    .append('div').classed('frame', true)
    .style({
      width: "100%",
      height: "70vh",
      border: "1px solid #ccc"
    }).call(function(frame) {
      return window[layout](queryData, randomSeed, height, degree, frame, treeOnly, hasSubtree, showSubtree);
    });
};
subtreeQuestion = function(pageOptions) {
  return function(parentOptions) {
    var buttons, choices, confirm, html, layout, main, queryData, randomSeed, startTime, userId, userStartTime;
    main = parentOptions.main, userId = parentOptions.userId, userStartTime = parentOptions.userStartTime;
    pageOptions.userId = userId;
    pageOptions.userStartTime = userStartTime;
    queryData = pageOptions.queryData, layout = pageOptions.layout, randomSeed = pageOptions.randomSeed;
    buttons = ["Yes", "No"];
    startTime = new Date().getTime();
    
    console.info("Data: %s", queryData);
    console.info("Layout: %s", layout);
    console.info("Seed: %s", randomSeed);
    
    html = "Is the subtree on the left in the tree on the right?";
    addHtml(main, html);
    // addVis(main, layout, queryData, randomSeed, 6, 6, true, true, true);
    var hasSubtree = pageOptions.hasSubtree
    console.log(hasSubtree);
    addVis(main, layout, queryData, randomSeed, 6, 6, true, hasSubtree, false);
    
    choices = main.insert('div', '.vis').classed('row', true)
      .append('div').classed('col-xs-12', true)
      .append('div').classed('btn-group', true)
      .attr({
        'data-toggle': 'buttons'
      }).selectAll('label').data(buttons);
      
    choices.enter()
      .append('label').classed('btn btn-lg btn-secondary', true)
      .call(function(label) {
        label.append('input').attr({
          type: 'radio',
          name: 'options',
          autocomplete: 'off',
          id: function(d, i) {
            return "option" + i;
          }
        });
        label.append(function(d) {
          return document.createTextNode(d);
        });
      });
      
    confirm = main
      .insert('div', '.vis').classed('row', true)
      .append('div').classed('col-xs-12', true)
      .append('button').classed('btn btn-lg btn-secondary', true)
      .style({
        'margin-bottom': '0.5rem'
      }).attr({
        disabled: true
      }).text('Confirm selection');
      
    choices.on('click', function() {
        confirm.attr({
          disabled: null
        });
      });
      
    return new Promise(function(resolve) {
      return confirm.on('click', function() {
        var data, response, time, timeTaken;
        time = new Date().getTime();
        timeTaken = time - startTime;
        // console.info("Time: %o", timeTaken);
        response = choices.filter(function() {
          return d3.select(this).classed("active");
        }).datum();
        // console.info("Response: %o", response);
        data = Object.assign({}, pageOptions, {
          response: response,
          timeTaken: timeTaken
        });
        // console.info("Data: %o", data);
        main.html('');
        return resolve(data);
      });
    });
  };
};
addContinue = function(main) {
  var c;
  c = main
    .insert('div', '.vis').classed('row', true)
    .append('div').classed('col-xs-12', true)
    .append('div').classed('btn-group', true)
    .append('button').classed('btn btn-lg btn-secondary', true)
    .text('Continue');
    
  return new Promise(function(resolve) {
    return c.on('click', function() {
      main.html('');
      return resolve({});
    });
  });
};
layouts = [
  'ballon',
  'classical', 
  'icicle', 
  'treeMap', 
  'radialInsideTree', 
  'hcl',
];
dataPath = 'data/';
queryDatasets = [
  "0_RAF_Dot.json", 
  "1_Activation of Pro-caspase 8 Pathway.json", 
  "2_ERBB2 Pathway.json", 
  "3_Signaling to GPCR Pathway.json", 
  "flare package.json",
  "1_RAF-Cascade Pathway.json",
  "54_DAG Pathway.json",
  "3_NGF Pathway.json"
].map(function(d) {
    return "" + dataPath + d;
  });
seed = 1000;

addHtml = function(main, html) {
  return main.append('div')
    .classed('row', true)
    .append('div')
    .classed('col-xs-12', true)
    .append('p')
    .html(html).style({
      margin: '10px 0'
    });
};

var i = 0;
part_1_nested = queryDatasets.map(function(queryData, di) {
  return layouts.map(function(layout, li) {
      var r = Math.sin(i++) * 1e4;
      var rand = r - Math.floor(r);
      // var answer = (rand < 0.5) ? "Yes" : "No";
      var hasSubtree = ((di+li) % 2) === 0 ? true : false;
      var answer = hasSubtree ? "Yes" : "No";
      // console.log(di, li, di + li, answer);
      var pageOptions;
      var pageName = "part_1_layout_" + li + "_data_" + di + "_a";
      pageOptions = {
        queryData: queryData,
        layout: layout,
        randomSeed: rand * 100, //randomSeed,
        pageName: pageName,
        question: "subtree",
        correctAnswer: answer,
        hasSubtree: hasSubtree
      };
      return pageOptions;
  });
});

part_1 = _.flatten(part_1_nested).map(function(pageOptions, i) {
  return {
    name: pageOptions.pageName,
    func: subtreeQuestion(pageOptions),
    pageOptions: pageOptions
  };
});

pages = [];

var nodes = [];
var root = {};

pages.push({
  name: 'part_1_intro',
  func: function(opts) {
    var main = opts.main;
    // main.append('h1').text('Part 1');
    
    generateRandomTree(4,4);
    
    debugger
    
    var instruct = main.append('div').classed('row', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-6 col-xs-offset-3', true)
      .append('div').classed('page-header', true);
    instruct.append('h1').text('Finding Subtrees');
    var vis = main.append('div').classed('vis', true)
      .style({ height: '40vh' })
    classical(root, vis);

    return addContinue(main);
  }
});

window.pages = pages = pages.concat(part_1);



function classical(root, container) {
  // fit visualization to container
  var diameter = parseInt(container.style('height'), 10),
  radius = diameter / 2,
  innerRadius = radius - 120;

  var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });
 
  // var g1 = svg.append('g');
  // var link = g1.append("g").selectAll(".link");
  // var node = g1.append("g").selectAll(".node");
  // var bundle = d3.layout.bundle();

  var maxDepth=0, numLeaf=0;

  var treeOnly = false;

  // d3.json(file, function(error, classes) {
  var svg = container.append('svg')
      .attr("width", diameter)
      .attr("height", diameter+300).append('g');
      
     var tree = d3.layout.tree().size([diameter,diameter]);
      // var nodes = tree(packageHierarchy(classes));
      var nodes = tree(root);
      nodes.forEach(function(d) { 
          if (d.depth>maxDepth)
              maxDepth = d.depth;
          if (!d.children)
              numLeaf++;
      });
      var sub_y = nodes[1].y;
      nodes.forEach(function(d) { 
          d.y = d.y-sub_y+20;
      }); 
      
     var _line = d3.svg.line()
      .interpolate("bundle")
      .tension(0.97)
      .x(function(d) { return d.x })
      .y(function(d) { return d.y })

    
       svg.append("g").selectAll(".node").data(nodes).enter()
          .append("circle")
          .attr({
              r: function(d) { 
                  if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                      return diameter*2/numLeaf;
                  return diameter*0.5/numLeaf; },
              cx: function(d) { return d.x },
              cy: function(d) { return d.y }
          })
      // .style("fill", function(d) { 
      //     if (d.depth==0)
      //         return "#fff";// Disable root node
      //     // return color(d); 
      // })
       .style("stroke", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name]|| listSelected3[d.name] || d.depth<=1)
                  return "#000";
      })
       .style("stroke-width",  function(d){ 
        if (d.depth<=1) return 2 ;
           else return 1.5 ; })
        ;
   var node = svg.append("g").selectAll(".node");
     var link = svg.append("g").selectAll(".link");
     
  // });
}