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
    // .insert('div', '.vis').classed('row', true)
    .append('div').classed('row', true)
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
    
    var instruct = main.append('div').classed('row', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-6 col-xs-offset-3', true)
      .append('div').classed('page-header', true);
      
    instruct.append('h1').text('Finding Subtrees');
    
    var vis = main.append('div')
      .classed('vis', true)
      .style({ height: '40vh' });

    return addContinue(main);
  }
});

pages = pages.concat(part_1);

window.pages = pages;
