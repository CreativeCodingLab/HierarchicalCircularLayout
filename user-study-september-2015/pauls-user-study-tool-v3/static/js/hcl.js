var nodeDFSCount = 0;

var treeLayout = d3.layout.tree().size([ width, height ]);
var scaleCircle = 1;  // The scale to update node size, defined by sliderScale.js
var scaleRate;
var scaleRadius = 0.7;  // The scale betweeb parent and children nodes, defined by sliderRadius.js
 
var maxDepth=1;
var setIntervalFunction;

// Random number generator
var seed1 = 1111;
function random() {
    var x = Math.sin(seed1++) * 1000;
    return Math.floor((x-Math.floor(x))*1000);
}

var nodes, links, linkTree;




function hcl(queryData, randomSeed, height, degree, container, treeOnly) {

  seed1 = randomSeed;
  nodes = [];
  links = [];
  generateRandomTree(height,degree); 

  nodes.forEach(function(child) { 
    if (child.depth>maxDepth){
        maxDepth = child.depth;
    }
  });        
  linkTree = d3.layout.tree().links(nodes);

 
// Define the layout ********************************************
var bundle = d3.layout.bundle();

var lineBundle = d3.svg.line()
      .interpolate("bundle")
      .tension(0.97)
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

var width = parseInt(container.style('width'), 10);
var height = parseInt(container.style('height'), 10);

//debugger;
/*var force = d3.layout.force()
    .linkDistance(50)
    .charge(-120)
    .gravity(.15)
    .size([width, height])
    .on("tick", tick);*/
     
var svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

var relationship_selection = svg.selectAll(".link");
var linkTree_selection = svg.selectAll(".link"),
    node_selection = svg.selectAll(".node1"); // Empty selection at first
  
var nodeEnter;
var time = 0;
var newNodes; 


var i = 0,
    duration = 750,
    rootSearch;
var treeSearch;
var diagonal;
  



  nodes.forEach(function(d) {
    if (d.depth == 0){
      root = d;
    } 
  });
  
 
  treeLayout.sort(comparator); 
  function comparator(a, b) {
    return b.order2 - a.order2;
  }


  
  childDepth1(root); 
  count1 = childCount1(0, root); 
  count2 = childCount2(0, root);  // DFS id of nodes are also set in this function
  root.idDFS = nodeDFSCount++; 
  root.order1 =0;

  //Assign id to each node, root id = 0
  nodes.forEach(function(d,i) {
    d.id =i;
  });
  nodes.reverse();

  scaleCircle =1;
  setupTree();
  scaleCircle = scaleRate;
  setupTree();
  drawNodeAndLink();
  update();
//});  

function setupTree() {
  var disFactor = 2;
  var minY = 10000;   // used to compute the best scale for the input tree
  newNodes = treeLayout(root).map(function(d,i) {
    if (d.depth==0){
       d.treeX = width/2-10; 
       d.treeY = height-getRadius(root)-10;
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
        begin +=additional;
      });
    }
    scaleRate = height/(height-minY);
    return d;
  });
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
    .attr("id", function(d) { return d.idDFS; })
    .attr("r", getRadius)
    .attr("cx", function(d) { 
      return d.treeX; })
    .attr("cy", function(d) { return d.treeY; })
    .style("stroke", function(d) { 
        if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                return "#000";
      })        
      .style("stroke-width", function(d) { 
        if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name] )
                return 1;        
    }); 
  

/*
  nodeEnter.append("text")
    .attr("class", "nodeText")
    .attr("x", function(d) { return d.treeX; })
    .attr("y", function(d) { return d.treeY; })
    .attr("dy", ".21em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .style("text-anchor", "middle")
    .text(function(d) {   
      if (d.key=="0" || d.key=="1")
            return "";
      else 
        return d.key; });*/

   nodeEnter.on('mouseover', mouseovered)
      .on("mouseout", mouseouted);

}


function update() {
    d3.selectAll(".node1").each(function(d) {
        d.x = (d.treeX ); //*event.alpha;
        d.y = d.treeY ; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", getRadius)
      .style("fill", color);

      d3.selectAll(".nodeText")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .text(function(d) {   
          return d.name; 
      });
    linkTree_selection.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return Math.round(d.source.y); })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return Math.round(d.target.y); });

  // Draw relationship links *******************************************************
  
    
    
  

 // Update Undirected links of relationships
  svg.selectAll("path.link").remove();
  relationship_selection 
      .data(bundle(links))
    .enter().append("path")
      .attr("class", "link")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("d", lineBundle);
  
}

// Collision ***********************************************************
var currentNode=1;
function startCollisionTimer() {
  setIntervalFunction = setInterval(function () {
    console.log("currentNode**** "+currentNode);
    // Compute collision
    var results = getCollisionOfSubtree(nodes[currentNode],0);
    var sumOverlapWithGreaterDFSid=results[1];
    var sumOverlapWithSmallerDFSid=results[0];
     
    //console.log("current="+currentNode+"  Smaller = "+sumOverlapWithSmallerDFSid
    //  +"  Greater = "+sumOverlapWithGreaterDFSid);
   

    d3.selectAll(".node1").each(function(d) {
        if (d.parent && d.treeRC){
          if (d.id==currentNode){
            if (sumOverlapWithGreaterDFSid>sumOverlapWithSmallerDFSid)
              d.alpha += 0.05;
            if (sumOverlapWithGreaterDFSid<sumOverlapWithSmallerDFSid)
              d.alpha -= 0.05;
          }  
          d.treeX = d.parent.treeX+d.treeRC*Math.cos(d.alpha); 
          d.treeY = d.parent.treeY+d.treeRC*Math.sin(d.alpha); 
          d.x = d.treeX; 
          d.y = d.treeY; 
        }
      })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", getRadius)
      .style("fill", color)
      ;

    currentNode++;
    if (currentNode==nodes.length)
      currentNode=1;
    while (!nodes[currentNode].children){   // skip all leaf nodes
      currentNode++;
      if (currentNode==nodes.length)
        currentNode=1;
    }
  }, 1);
} 

function getCollisionOfSubtree(node1, deep) {
  var results = getCollisionOfNode(node1);
  if (node1.children && deep<0) {  // do not go more than 10 levels
    for (var i=0; i<node1.children.length; i++){
      var results2 = getCollisionOfSubtree(node1.children[i],deep+1)
      results[0] += results2[0];
      results[1] += results2[1];
    }
  }
  return results;
}


function getCollisionOfNode(node1) {
  var results = new Array(2);
  var x1 = node1.x; 
  var y1 = node1.y; 
  var r1 = getRadius(node1);
  var sumOverlapWithGreaterDFSid=0;
  var sumOverlapWithSmallerDFSid=0;
  for (var i=0; i<nodes.length;i++){
    if (nodes[i]==node1 || nodes[i]==node1.parent || isAChildOf(nodes[i], node1)) continue;
    var x2 = nodes[i].x; 
    var y2 = nodes[i].y; 
    var r2 = getRadius(nodes[i]); 
    var dis = (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1);
    dis = Math.sqrt(dis);
    if (dis<r1+r2){
      if (nodes[i].idDFS>node1.idDFS)
        sumOverlapWithGreaterDFSid += (r1+r2)-dis;
      else 
        sumOverlapWithSmallerDFSid += (r1+r2)-dis;
    }   
  }
  results[0] = sumOverlapWithSmallerDFSid;
  results[1] = sumOverlapWithGreaterDFSid;
  return results;
}

function isAChildOf(node1, node2) {
  if (!node2.children) return false;
  for (var i=0; i<node2.children.length;i++){
    if (node1==node2.children[i])
      return true;
  } 
  return false;
}



// Fisheye Lensing ************************************************
// var fisheye = d3.fisheye.circular()
//       .radius(200);

svg.on("mousemove", function() {
  //  force.stop();




  
   svg.selectAll("path.link")
      .each(function(d) { })
      .attr("d", lineBundle); 
  
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
      .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });
     ;
     
     d3.selectAll(".node1")
       .style("fill-opacity" , function(n) {   
        if (n.key=="0" || n.key=="1" || n.depth<1 )
          return 1;
        else{
           if (n==d)
              return 1;
            if (n.target) 
              return 1;
            else if (n.source)
              return 1;
            else
              return 0.15;
        }  
          
      });
           
  }    
  else{
    svg.append("text")
      .attr("class", "nodeTextBrushing")
      .attr("x", d.x)
      .attr("y", d.y)
      .text(""+d.name)
      .attr("dy", ".21em")
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .style("text-anchor", "middle")
      .style("fill", "#000")
      .style("font-weight", "bold");
   } 
   console.log(d.name);
  //.classed("node--target", function(n) {   return n.target; })
  //.classed("node--source", function(n) { return n.source; });  
}

function mouseouted(d) {
  svg.selectAll("path.link")
      .classed("link--faded", false)
      .classed("link--target", false)
      .classed("link--source", false);

  d3.selectAll(".node1")
      .attr("r", function(d){ 
        return getRadius(d);
       })
      .style("fill" , color)
      .style("fill-opacity", 1);

  svg.selectAll(".nodeTextBrushing").remove();  
  
  //node_selection
  //    .classed("node--target", false)
  //    .classed("node--source", false);
}  
}




