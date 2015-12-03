/* global _, d3 */

pages = [];

pages.push({
  name: 'part_1_intro_1',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('In this study, we will show you several different <b>tree layouts</b>.');
    instruct.append('p')
      .html("Each tree will be shown next to a smaller <b>subtree</b>, to the left.");
    addVis(
      main, 
      'classical', 
      'data/0_introTree.json', 
      4562, 5, 5, true, true, true
    );
    d3.select('.frame').style({ border: null });
    return addContinue(main);
  }
});

pages.push({
  name: 'part_1_intro_2',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('You need to determine <b>if the subtree exists in the larger tree</b> on the right.');
    instruct.append('p')
      .html('In this example, the subtree <b>is</b> in the larger tree to the right.');
    instruct.append('p')
      .html("Here, you can see the subtree highlighted in <span style='color: green'>green</span>.");
    addVis(
      main, 
      'classical', 
      'data/0_introTree.json', 
      4562, 5, 5, true, true, true
    );
    d3.select('.frame').style({ border: null });
    return addContinue(main);
  }
});

pages.push({
  name: 'part_1_intro_3',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('Here is an example where the subtree <b>does not exist</b> in the larger tree to the right.');
    addVis(
      main, 
      'classical', 
      'data/0_introTree.json', 
      5234, 5, 6, true, false, false
    );
    d3.select('.frame').style({ border: null });
    return addContinue(main);
  }
});

pages.push({
  name: 'part_1_intro_4',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('You should try to answer <b>quickly</b> and <b>accurately</b>.');
    instruct.append('p')
      .html('When you are ready to begin, click Continue.');
    return addContinue(main);
  }
});

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
      // width: "1500px",
      // height: "700px",
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
    var hasSubtree = pageOptions.hasSubtree;
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
  'radialTree', 
  'hcl',
];
dataPath = 'data/';

queryDatasets = [
  "0_RAF_Dot.json",
  	"1_Activation of Pro-caspase 8 Pathway.json",
    "2_ERBB2 Pathway.json",
    "3_Signaling to GPCR Subtree.json",
    "3_Signaling to GPCR Subtree2.json",
    "3_NGF Pathway.json",
    "54_DAG Pathway.json",
    "flare subtree1.json",
    // "flare subtree2.json",
    "carnivoraWithRelationships subtree.json",
    "carnivoraWithRelationships subtree2.json"
].map(function(d) {
    return "" + dataPath + d;
  });

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
      var hasSubtree = ((di+li) % 2) === 0 ? true : false;
      var answer = hasSubtree ? "Yes" : "No";
      var pageOptions;
      var pageName = "part_1_layout_" + li + "_data_" + di + "_a";
      pageOptions = {
        queryData: queryData,
        layout: layout,
        randomSeed: Math.floor((di + li) * 100), //randomSeed,
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

d3.shuffle(part_1);
// pages = pages.concat(part_1);

pages.push({
  name: 'part_1_outro',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('You have completed the first half of this study.');
    return addContinue(main);
  }
});

pages.push({
  name: 'part_2_intro_1',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('In the second half of this study, we will show you tree layouts that include <b>additional connections between nodes</b>.');
    addVis(
      main, 
      'classical', 
      "data/0_RAF_Dot.json", 
      4562, 4, 4, false, true, false
    );
    d3.select('.frame').style({ border: null });
    return addContinue(main);
  }
});

pages.push({
  name: 'part_2_intro_2',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('You will need to determine <b>if the two highlighted nodes are connected</b> by the <span style="color: red; font-weight: 700">red lines</span>.');
     instruct.append('p')
      .html('Here, the two nodes <b>are connected</b>.');
    addVis(
      main, 
      'classical', 
      "data/0_RAF_Dot.json", 
      4562, 4, 4, false, true, false
    );
    d3.select('.frame').style({ border: null });
    return addContinue(main);
  }
});

pages.push({
  name: 'part_2_intro_3',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('You should try to answer <b>quickly</b> and <b>accurately</b>.');
    instruct.append('p')
      .html('When you are ready to begin, click Continue.');
    return addContinue(main);
  }
});

var connectivityDatasets = [
  "3-Rb-E2FpathwayReactome_Dot.json",
  "HIV Infection_Dot.json",
  "2_ERBB2 Pathway2.json", 
  "flare package2.json",
  // "2_ERBB2 Pathway orginal.json",
  // "3_Signaling to GPCR Pathway.json",
  // "flare package.json",
  // "carnivoraWithRelationships.json",
].map(function(d) {
    return "" + dataPath + d;
  });

var part_2_nested = d3.range(4).map(function(_, randi) {
  return connectivityDatasets.map(function(data, di) {
    return layouts.map(function(layout, li) {
        var r = Math.sin(i++) * 1e4;
        var rand = r - Math.floor(r);
        var hasSubtree = ((di+li) % 2) === 0 ? true : false;
        var answer = hasSubtree ? "Yes" : "No";
        var pageOptions;
        var pageName = "part_2_layout_" + li + "_data_" + di + "_a";
        pageOptions = {
          queryData: data,
          layout: layout,
          // randomSeed: Math.floor((di + li) * 100), // rand * 100,
          randomSeed: randi * 100,
          pageName: pageName,
          question: "connectivity",
          correctAnswer: answer,
          hasSubtree: hasSubtree
        };
        return pageOptions;
    });
  });
});

var connectivityQuestion = function(pageOptions) {
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
    
    html = "Are the two highlighted nodes connected?";
    addHtml(main, html);
    // addVis(main, layout, queryData, randomSeed, 6, 6, true, true, true);
    var hasSubtree = pageOptions.hasSubtree;
    console.log(hasSubtree);
    
    addVis(main, layout, queryData, randomSeed, 6, 6, false, hasSubtree, false);
    
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

var part_2 = _.flatten(part_2_nested).map(function(pageOptions, i) {
  return {
    name: pageOptions.pageName,
    func: connectivityQuestion(pageOptions),
    pageOptions: pageOptions
  };
});

d3.shuffle(part_2);

pages = pages.concat(part_2);

pages.push({
  name: 'part_2_outro',
  func: function(opts) {
    var main = opts.main;
    var instruct = main.append('div').classed('row instructions', true)
      .style('margin-top', '2rem')
      .append('div').classed('col-xs-12', true)
    instruct.append('p')
      .html('You have completed the study.');
    instruct.append('p')
      .html('Thank you for your time.');
    return Promise.resolve();
  }
});

window.pages = pages;