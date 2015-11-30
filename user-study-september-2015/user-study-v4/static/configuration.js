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
    buttons = [0, 1, 2, 3, 4];
    startTime = new Date().getTime();
    
    console.info("Data: %s", queryData);
    console.info("Layout: %s", layout);
    console.info("Seed: %s", randomSeed);
    
    html = "How many times does the subtree on the right appear in the tree on the left?";
    addHtml(main, html);
    addVis(main, layout, queryData, randomSeed, 6, 6, true, true, true);
    
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
      }).text('confirm selection');
      
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
    .text('continue');
    
  return new Promise(function(resolve) {
    return c.on('click', function() {
      main.html('');
      return resolve({});
    });
  });
};
layouts = ['classical', 'icicle', 'treeMap', 'radialInsideTree', 'hcl'];
dataPath = 'data/';
queryDatasets = [
  "0_RAF_Dot.json", 
  "1_Activation of Pro-caspase 8 Pathway.json", 
  "2_ERBB2 Pathway.json", 
  "3_Signaling to GPCR Pathway.json", 
  "flare package.json"].map(function(d) {
    return "" + dataPath + d;
  });
seed = 1000;
randomList = [1021, 1311, 2522, 3422];
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


part_1_nested = queryDatasets.map(function(queryData, di) {
  return layouts.map(function(layout, li) {
    return randomList.map(function(randomSeed, si) {
      var pageOptions;
      var pageName = "part_1_layout_" + li + "_data_" + di + "_seed_" + si + "_a";
      pageOptions = {
        queryData: queryData,
        layout: layout,
        randomSeed: randomSeed,
        pageName: pageName,
        question: "subtree"
      };
      return [
        {
          name: "part_1_layout_" + li + "_data_" + di + "_seed_" + si + "_a",
          func: subtreeQuestion(pageOptions)
        }
      ];
    });
  });
});

part_1 = _.flatten(part_1_nested);

pages = [];

pages.push({
  name: 'part_1_intro',
  func: function(opts) {
    var main;
    main = opts.main;
    main.append('h1').text('Part 1');
    return addContinue(main);
  }
});

window.pages = pages = pages.concat(part_1);

