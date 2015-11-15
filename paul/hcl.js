/* global d3, Rx */

var stream = Rx.Observable;
  
var treeData = stream.fromCallback(d3.json)("flare.json")
  .map(function(a) { return a[1]; })
  
treeData
  .subscribe(function(root) { 
    var nodes = tree.nodes(root),
        links = tree.links(nodes);
  
    var link = svg.selectAll(".link")
        .data(links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);
  
    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
  
    node.append("circle")
        .attr("r", 4.5);
  
    node.append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
        .text(function(d) { return d.name; });
  });

// stream.create(function(observer) {
//   d3.json(file, function(d) { observer.onNext(d); observer.onCompleted() });
// }).subscribe(function(d) { console.log(d); });

// new Promise(function(resolve) { d3.json(file, resolve); })
//   .then(function(classes) {
//     var tree = getTree(classes);
//   });

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

// d3.json("flare.json", function(error, root) {
//   if (error) throw error;

//   var nodes = tree.nodes(root),
//       links = tree.links(nodes);

//   var link = svg.selectAll(".link")
//       .data(links)
//     .enter().append("path")
//       .attr("class", "link")
//       .attr("d", diagonal);

//   var node = svg.selectAll(".node")
//       .data(nodes)
//     .enter().append("g")
//       .attr("class", "node")
//       .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

//   node.append("circle")
//       .attr("r", 4.5);

//   node.append("text")
//       .attr("dy", ".31em")
//       .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
//       .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
//       .text(function(d) { return d.name; });
// });

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
  //  console.log(" minY = "+minY +"  "+scaleRate);
   // console.log("maxDepth = "+maxDepth);
    return d;
  });
  /// Restart the force layout.
  //  force.nodes(newNodes);
  //  force.links(linkTree);
  //  force.start();

    
}  



// // Lazily construct the package hierarchy from class names.
// function packageHierarchy(classes) {
//   var map = {};
//   function find(name, data) {
//     var node = map[name], i;
//     if (!node) {
//       node = map[name] = data || {name: name, children: []};
//       if (name.length) {
//         node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
//         node.parent.children.push(node);
//         node.key = name.substring(i + 1);
//       }
//     }
//     return node;
//   }
//   classes.forEach(function(d) {
//     find(d.name, d);
//   });
//   return map[""];
// }

// // Return a list of imports for the given array of nodes.
// function packageImports(nodes) {
//   var map = {},
//       imports = [];
//   // Compute a map from name to node.
//   nodes.forEach(function(d) {
//     map[d.name] = d;
//   });
//   // For each import, construct a link from the source to target node.
//   nodes.forEach(function(d) {
//     if (d.imports) 
//       d.imports.forEach(function(i) {
//         imports.push({source: map[d.name], target: map[i]});
//     });
//   });
//   return imports;
// }


// function getTree(data) {
//   return packageHierarchy(data);
// }

// function getLinksFromNodes(nodes) {
//   return packageImports(nodes);
// }
  
// var alreadyTree = stream.fromCallback(d3.json)("flare.json")
//   .map(function(a) { return a[1]; })
  
// var flat = stream.fromCallback(d3.json)(file)
//   .map(function(a) { return a[1]; })
  