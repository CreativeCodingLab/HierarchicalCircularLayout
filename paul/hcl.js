/* global d3, Rx */

var stream = Rx.Observable;

var scaleCircle = 1;
var scaleRadius = 0.8; 
var maxDepth=1;
  
var treeData = stream.fromCallback(d3.json)("flare.json")
  .map(function(a) { return a[1]; })
  
var nodeDFSCount = 0;
  
treeData
  .subscribe(function(root) { 
    
    var treeLayout = d3.layout.tree();
    
    treeLayout.sort(function(a, b) {
      if (typeof b.order2 == 'undefined') throw 'no order2';
      return b.order2 - a.order2;
    });
    
    var hierarchy = d3.layout.hierarchy();
    
    // This sets a depth value for each node
    hierarchy(root);
    
    // Find the maximum descendant node depth for each node
    setMaxDepth(root);

    childCount(root); 
    // childCount1(0, root); 
    childCount2(0, root);
    
    setupTree(200, treeLayout, root);
    
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
    .size([360, diameter / 2 - 120])
   
var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", "500")
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var setupTree = function(height, treeLayout, root) {
  var disFactor = 2;
  var minY = height*100;
  treeLayout(root).map(function(d) {
    if (d.depth==0){
       d.treeX = 100; 
       d.treeY = height-getRadius(root)/1;
       d.alpha = -Math.PI/2; 
    }
    if (d.children){
      var totalRadius = 0;
      var totalAngle = Math.PI*1.2;
      var numChild =  d.children.length;
      d.children.forEach(function(child) {
        totalRadius+=getBranchingAngle1(getRadius(child), numChild);
      });  

      var begin=d.alpha-totalAngle/2;
      d.children.forEach(function(child,i2) {
        xC =  d.treeX;
        yC =  d.treeY;
        rC = getRadius(d)+getRadius(child)/disFactor;

        var additional = totalAngle*getBranchingAngle1(getRadius(child), numChild)/totalRadius;
        child.alpha = begin+additional/2;
        child.treeX = xC+rC*Math.cos(child.alpha); 
        child.treeY = yC+rC*Math.sin(child.alpha); 
        
        if (child.treeY-rC<minY) {
          minY = child.treeY-rC;
        };
        if (child.depth>maxDepth){
          maxDepth = child.depth;
        }
        begin +=additional;
      });
    }

    return d;
  });
    
}  

function childCount2(level, n) {
    var arr = n.children || [];
    arr.sort(function(a,b) { 
      if (!a.maxDepth) console.error('no maxDepth');
      if (typeof a.childCount1 == 'undefined') throw 'no childCount1';
      return (a.maxDepth*100+a.childCount1) - (b.maxDepth*100+b.childCount1) } 
    );
    var arr2 = [];
    arr.forEach(function(d, i) {
        d.order1 = i;
        arr2.splice(arr2.length/2, 0, d);
    });
    arr2.forEach(function(d, i) {
        d.order2 = i;
        childCount2(level + 1, d);
        d.idDFS = nodeDFSCount++;   // this set DFS id for nodes
    });

};

function childCount(node) {
    count = 0;
    var children = node.children;
    if(children && children.length > 0) {
      count += children.length;
      children.forEach(function(d) {
        count += childCount(d);
      });
      // n.children.map(function(child) {
      //   return childCount(++level, chil)
      // })
      return node.childCount1 = count;
    }
    else {
       return node.childCount1 = 0;
    }
};

function childCount1(level, n) {
    count = 0;
    if(n.children && n.children.length > 0) {
      count += n.children.length;
      n.children.forEach(function(d) {
        count += childCount1(level + 1, d);
      });
      // n.children.map(function(child) {
      //   return childCount(++level, chil)
      // })
      return n.childCount1 = count;
    }
    else {
       return n.childCount1 = 0;
    }
};

// The height of a node is the number of edges 
// on the longest path from the node to a leaf.

function setMaxDepth(node) {
  var children = node.children
  if (children && children.length > 0) {
    var depths = children.map(setMaxDepth);
    return node.maxDepth = Math.max.apply(null, depths);
  } else {
    if (typeof node.depth == 'undefined') throw "no depth";
    return node.maxDepth = node.depth;
  }
}

function getRadius(d) {
  return d.children ? Math.pow(d.childCount1, scaleRadius) : 1;
}

function getBranchingAngle1(radius3, numChild) {
  if (numChild<=2){
    return Math.pow(radius3,2);
  }  
  else
    return Math.pow(radius3,0.9);
 } 
 
var isUndefined = function(d) { return typeof d === 'undefined'; };