var diameter = 750,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var svg = d3.select("#tree-container").append("svg");
 
var g1 = svg.append('g');
var link = g1.append("g").selectAll(".link"),
    node = g1.append("g").selectAll(".node");
var bundle = d3.layout.bundle();

var line;

var nodes1;
var links;
var maxDepth=0, numLeaf=0;

var linkTree;
var linkTree_selection;

//d3.json("../../data/1_Activation of Pro-caspase 8_Dot.json", function(error, classes) {
d3.json("../../data/3-Rb-E2FpathwayReactome_Dot.json", function(error, classes) {
//d3.json("../../data/52_ERBB2_Dot.json", function(error, classes) {
///d3.json("../../data/3_Signaling to GPCR_Dot.json", function(error, classes) {
//d3.json("../../data/carnivoraWithRelationships.json", function(error, classes) {
//d3.json("../../data/mammalsWithRelationships.json", function(error, classes) {
//d3.json("readme-flare-imports.json", function(error, classes) {

svg = d3.select("#tree-container").append("svg")
    .attr("width", diameter)
    .attr("height", diameter+300).append('g');
    
   var tree = d3.layout.tree().size([diameter-100,diameter]);
    nodes1 = tree(packageHierarchy(classes));
    nodes1.forEach(function(d) { 
        if (d.depth>maxDepth)
            maxDepth = d.depth;
        if (!d.children)
            numLeaf++;
    });



  
   
   /// Hierarchical links
    linkTree = d3.layout.tree().links(nodes1);
    linkTree_selection = svg.selectAll(".linkTree").data(linkTree).enter(); 
    linkTree_selection.append("line")
      .attr("class", "linkTree")
      .attr("stroke", function(d) { 
            if (d.source.name=="")
                return "#ff0000";
            else
                return color(d.source);
        })
      .attr("stroke-width", function(d) { 
            if (d.source.name=="")
                return 0;           // remove root link
            else
                return 0.6;
        })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return Math.round(d.source.y); })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return Math.round(d.target.y); });


   links = packageImports(nodes1);

   // debugger
    g1 = svg.append('g');
    link = g1.append("g").selectAll(".link"),
    node = g1.append("g").selectAll(".node");

   var _line = d3.svg.line()
    .interpolate("bundle")
    .tension(0.9)
    .x(function(d) { return d.x })
    .y(function(d) { return d.y })

  link = link
      .data(bundle(links))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        return _line(d)
      })
      .style({"stroke": "#a00",
        "stroke-width": "1px"})

     g1.append("g").selectAll(".node").data(nodes1).enter()
        .append("circle")
        .attr({
            r: diameter*0.4/numLeaf,
            cx: function(d) { return d.x },
            cy: function(d) { return d.y }
        })
     .style({"fill": function(d) { 
        if (d.depth==0)
            return "#ffffff";// Disable root node

        return color(d); }
    });

        
});



// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });

  return imports;
}


function color(d) {
  var minSat = 50;
  var maxSat = 200;
  var step = (maxSat-minSat)/maxDepth;
  var sat = Math.round(maxSat-d.depth*step);
 // if (d==nodes[currentNode])
 //   return "#ff0000";
  
  //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth+" step="+step);
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    : "#0000f0"; // leaf node
}


