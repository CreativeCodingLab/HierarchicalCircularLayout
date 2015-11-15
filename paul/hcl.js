/* global d3, Rx */

var stream = Rx.Observable;
  
var treeData = stream.fromCallback(d3.json)("flare.json")
  .map(function(a) { return a[1]; })
  
treeData
  .subscribe(function(root) { 
    var nodes = tree.nodes(root);
  
    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
  
    node.append("circle")
        .attr("r", 4.5);
  
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

function setupTree() {
  var disFactor = 2;
  var minY = height*100;   // used to compute the best scale for the input tree
  newNodes = treeLayout(root).map(function(d,i) {
    if (d.depth==0){
       d.treeX = 700; 
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
        child.treeRC = rC;

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
    scaleRate = height/(height-minY);

    return d;
  });
    
}  