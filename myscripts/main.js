
var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var lineBundle = d3.svg.line()
      .interpolate("bundle")
      .tension(0.98)
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

var width = 1200,
    height = 800,
    root;

/*var force = d3.layout.force()
    .linkDistance(50)
    .charge(-120)
    .gravity(.15)
    .size([width, height])
    .on("tick", tick);*/
     
var svg = d3.select("body").append("svg")
    .attr("id", "SVGmain")
    .attr("width", width)
    .attr("height", height);

var relationship_selection = svg.selectAll(".link");
var linkTree_selection = svg.selectAll(".link"),
    node_selection = svg.selectAll(".node1"); // Empty selection at first
  
var nodeEnter;
var nodes
var time = 0;
var newNodes; 


var i = 0,
    duration = 750,
    rootSearch;
var treeSearch;
var diagonal;



var treeLayout = d3.layout.tree().size([ width, height ]);
var scaleCircle = 1;  // The scale to update node size, defined by slider.js
var scaleRate;
 
var maxDepth=1;

//d3.json("data/52_ERBB2_Dot.json", function(error, classes) {
//d3.json("data/53_RAF_Dot.json", function(error, classes) {
//d3.json("data/mammalsWithRelationships.json", function(error, classes) {
  d3.json("data/carnivoraWithRelationships.json", function(error, classes) {
//  d3.json("data/readme-flare-imports.json", function(error, classes) {
  nodes = cluster.nodes(packageHierarchy(classes));
  nodes.splice(0, 1);  // remove the first element (which is created by the reading process)
  links = packageImports(nodes);
  linkTree = d3.layout.tree().links(nodes);
  tree_nodes = d3.layout.tree().nodes(classes);
  nodes.forEach(function(d) {
    if (d.depth == 1){
      root = d;
    } 
  });
  

/* force
    .nodes(nodes)
    .links(linkTree)
    .start();*/

  treeLayout.sort(comparator);
  
  function comparator(a, b) {
    return b.order2 - a.order2;
  }
  
  function nodeSize(d) {
  return d.children ? Math.sqrt(d.children.length) // expanded package
      : 1; // leaf node
  }  
  count1 = childCount1(0, root); 
  count2 = childCount2(0, root); 
  root.order1 =0;

  //Assign id to each node, root id = 0
  nodes.forEach(function(d,i) {
    d.id =i;
  });


  setupTree();
  drawNodeAndLink();
  update();
 // addSearchBox();
  setupSlider(svg);
});  



function setupTree() {
  var disFactor = 2;
  var minY = height*100;   // used to compute the best scale for the input tree
  newNodes = treeLayout(root).map(function(d,i) {
    if (d.depth==0){
       d.treeX = 600; 
       d.treeY = height-getRadius(root)/1;
       d.alpha = -Math.PI/2; 
    }
    if (d.children){
      var totalRadius = 0;
      var totalAngle = Math.PI*1;
      d.children.forEach(function(child) {
        totalRadius+=getBranchingAngle(getRadius(child));
      });  

      var begin=d.alpha-totalAngle/2;
      d.children.forEach(function(child,i2) {
        xC =  d.treeX;
        yC =  d.treeY;
        rC = getRadius(d)+getRadius(child)/disFactor;
         
        var additional = totalAngle*(getBranchingAngle(getRadius(child))/totalRadius);
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
    scaleRate= height/(height-minY);
    // console.log(" minY = "+minY +"  "+scaleRate);
   // console.log("maxDepth = "+maxDepth);
    return d;
  });
  /// Restart the force layout.
  //  force.nodes(newNodes);
  //  force.links(linkTree);
  //  force.start();
}  

function drawNodeAndLink() {
// Update links of hierarchy.
  linkTree_selection = linkTree_selection.data(linkTree, function(d) { return d.target.id; });
  linkTree_selection.exit().remove();
  linkTree_selection.enter().append("line")
      .attr("class", "linkTree");

  // Update nodes.
  svg.selectAll(".node1").remove();
  node_selection = svg.selectAll(".node1").data(nodes);
  nodeEnter = node_selection.enter().append("g")
    .attr("class", "nodeG")
    .on("click", click);
 //   .call(force.drag);
  

  // Draw nodes *****************************************************
  nodeEnter.append("circle")
    .attr("class", "node1")
    .attr("r", getRadius)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .style("fill-opacity", function(d){ 
      if (document.getElementById("checkbox1").checked){
        return 1;
      }
      else{
     //   console.log(d.children+"  "+d._children);
        if (d.children || d._children)
          return 0;
        else
          return 1;
      }
     })   
    .style("fill", color);
  
   nodeEnter.on('mouseover', mouseovered)
      .on("mouseout", mouseouted);
}


function update() {
    d3.selectAll(".node1").each(function(d) {
        d.x = (d.treeX ); //*event.alpha;
        d.y = d.treeY ; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", getRadius);

    linkTree_selection.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return Math.round(d.source.y); })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return Math.round(d.target.y); });

  // Draw relationship links *******************************************************
  if (document.getElementById("checkbox3").checked){ //directed
    var aa = bundle(links);
    svg.selectAll("path.link").remove();
    for (var i=0; i< aa.length;i++){
      var points =  new Array(aa[i].length);;
      for (var j=0; j< aa[i].length;j++){
        var a = new Array(2);
        a[0] = aa[i][j].treeX;
        a[1] = aa[i][j].treeY;
        points[j] = a;
      }  
      //console.log(points);
      //debugger;
      var color2 = d3.interpolateLab("#008000", "#c83a22");

      var line2 = d3.svg.line()
          .interpolate("basis");

      svg.selectAll("path"+i)
          .data(quad(sample(line2(points), 10)))
        .enter().append("path")
          .style("fill", function(d) { return color2(d.t); })
          .style("stroke", function(d) { return color2(d.t); })
          .attr("class", "link")
          .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], 0.1); });
    }
  }
  
  else {  // Update Undirected links of relationships
    var color2 = d3.interpolateLab("#008000", "#c83a22");
    svg.selectAll("path.link").remove();
    relationship_selection 
        .data(bundle(links))
      .enter().append("path")
        .attr("class", "link")
       // .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("d", lineBundle);
  }
}






// Fisheye Lensing ************************************************
var fisheye = d3.fisheye.circular()
      .radius(200);
svg.on("mousemove", function() {
  //  force.stop();
  if (document.getElementById("checkbox2").checked)
     fisheye.focus(d3.mouse(this));
  d3.selectAll(".node1").each(function(d) { d.fisheye = fisheye(d); })
      .attr("cx", function(d) { return d.fisheye.x; })
      .attr("cy", function(d) { return Math.round(d.fisheye.y); });
     // .attr("r", function(d) { return d.fisheye.z * 8; });
  linkTree_selection.attr("x1", function(d) { return d.source.fisheye.x; })
      .attr("y1", function(d) { return Math.round(d.source.fisheye.y); })
      .attr("x2", function(d) { return d.target.fisheye.x; })
      .attr("y2", function(d) { return Math.round(d.target.fisheye.y); });
   
  node_selection
    .each(function(d) {
      d.x = d.fisheye.x; //*event.alpha;
      d.y = d.fisheye.y; //*event.alpha;
    });
  
 if (!document.getElementById("checkbox3").checked){  // no lensing on directed relationships
   svg.selectAll("path.link")
      .each(function(d) { })
      .attr("d", lineBundle); 
  }    
  var force_influence = 0.5;
  node_selection
    .each(function(d) {
      d.x += (d.treeX - d.x) * (force_influence); //*event.alpha;
      d.y += (d.treeY - d.y) * (force_influence); //*event.alpha;
    });
 
});


function mouseovered(d) {
  if (!d.children){
    node_selection
       .each(function(n) { n.target = n.source = false; });
    svg.selectAll("path.link")
      .classed("link--faded", function(l) { if (l) return true;  })
      .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
     ;
   //  debugger;
   }    
 }

function mouseouted(d) {
  svg.selectAll("path.link")
      .classed("link--faded", false)
      .classed("link--target", false)
      .classed("link--source", false);
  node_selection
      .classed("node--target", false)
      .classed("node--source", false);
}



