/* global d3, Rx */

var stream = Rx.Observable;

var scaleRadius = 0.8; 
var SCALE_RADIUS = 0.8;
var maxDepth=1;
  
var treeData = stream.fromCallback(d3.json)("flare.json")
  .map(function(a) { return a[1]; });
  
treeData
  .subscribe(function(root) { 
    
    var treeLayout = d3.layout.hierarchy();
    
    // Set a depth value for each node
    treeLayout(root);
    
    // Find the maximum descendant node depth for each node
    setMaxDepth(root);

    // Count the descendants of each node
    descendants(root);
    
    // Recursively sort children
    orderChildren(root);
    
    treeLayout.sort(function(a, b) {
      if (typeof b.order == 'undefined') throw 'no order';
      return b.order - a.order;
    });
    
    var _nodes = treeLayout(root);
    
    setupTree(200, treeLayout, root, _nodes);
    
    var nodes = tree.nodes(root);
  
    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
          // return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; 
          return "translate(" + d.treeX + "," + d.treeY + ")";
        });
  
    node.append("circle")
        .attr("r", 2);
  
  });

var diameter = 500;

var tree = d3.layout.tree()
    .size([360, diameter / 2 - 120]);

var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", "500")
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    
var TOTAL_ANGLE = Math.PI * 1.2;

var setupTree = function(height, treeLayout, root, nodes) {
  var disFactor = 2;
  nodes.map(function(d) {
    if (d.depth === 0) {
       d.treeX = 0; 
       d.treeY = 0;
       d.alpha = 0;
    }
    if (d.children){
      var totalAngle = TOTAL_ANGLE;
      var numChild =  d.children.length;
      
      var totalRadius = d.children.map(function(child) {
        var radius = getRadius(child);
        return getBranchingAngle1(radius, numChild);
      }).reduce(function(a, b) { return a + b; });

      var begin=d.alpha-totalAngle/2;
      d.children.forEach(function(child) {
        var xC =  d.treeX;
        var yC =  d.treeY;
        var rC = getRadius(d)+getRadius(child)/disFactor;

        var additional = totalAngle*getBranchingAngle1(getRadius(child), numChild)/totalRadius;
        child.alpha = begin+additional/2;
        child.treeX = xC+rC*Math.cos(child.alpha); 
        child.treeY = yC+rC*Math.sin(child.alpha); 

        begin +=additional;
      });
    }
  });
};

function orderChildren(n) {
    var arr = n.children || [];
    // Sort small to large
    arr.sort(function(a,b) { 
      if (isUndefined(a.maxDepth)) throw 'no maxDepth';
      if (isUndefined(a.numDescendants)) throw 'no numDescendants';
      return (a.maxDepth + a.numDescendants) - (b.maxDepth + b.numDescendants); 
    });
    var arr2 = [];
    arr.forEach(function(d) {
        arr2.splice(arr2.length/2, 0, d);
    });
    arr2.forEach(function(d, i) {
        d.order = i;
        orderChildren(d);
    });
}

function descendants(node) {
  var children = node.children;
  if (children && children.length > 0) {
    var ds = children
      .map(function(child) {
        return descendants(child);
      })
      .reduce(function(a,b) { 
        return a + b; 
      });
    return node.numDescendants = ds + children.length;
  } else {
    return node.numDescendants = 0;
  }
}

// The height of a node is the number of edges 
// on the longest path from the node to a leaf.

function setMaxDepth(node) {
  var children = node.children;
  if (children && children.length > 0) {
    var depths = children.map(setMaxDepth);
    return node.maxDepth = Math.max.apply(null, depths);
  } else {
    if (typeof node.depth == 'undefined') throw "no depth";
    return node.maxDepth = node.depth;
  }
}

function getRadius(d) {
  return d.children ? Math.pow(d.numDescendants, SCALE_RADIUS) : 1;
}

function getBranchingAngle1(radius, numChild) {
  if (numChild <= 2) return Math.pow(radius,2);
  return Math.pow(radius,0.9);
} 
 
var isUndefined = function(d) { return typeof d === 'undefined'; };