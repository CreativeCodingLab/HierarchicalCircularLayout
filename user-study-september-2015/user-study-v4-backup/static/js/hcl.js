var nodeDFSCount = 0;

var treeLayout = d3.layout.tree().size([ width, height ]);
var scaleCircle = 1;  // The scale to update node size, defined by sliderScale.js
var scaleCircleQ = 1;  // The scale to update node size, defined by sliderScale.js
var scaleRate;
var scaleRateQ;   // For the query tree
var scaleRadius = 0.75;  // The scale betweeb parent and children nodes, defined by sliderRadius.js
var disFactor = 2;  // Distance from the center of the parent.
  
var maxDepth=1;
var setIntervalFunction;

// Random number generator

var nodes, links, linkTree, root;




function hcl(queryData, randomSeed, height, degree, container, treeOnly, hasSubtree, showSubtree_) { //showSubtree==true --> Color the query tree in hcl
  showSubtree = showSubtree_;
  seed1 = randomSeed;
  nodes = [];
  links = [];
  generateRandomTree(height,degree); 

  nodes.forEach(function(child) { 
    if (child.depth>maxDepth){
        maxDepth = child.depth;
    }
  });  
  nodes.forEach(function(d) {
      if (d.depth == 0){
        root = d;
      } 
    });   

  treeLayout.sort(comparator); 
    function comparator(a, b) {
     return b.order2 - a.order2;
  }   

  linkTree = d3.layout.tree().links(nodes);


  var bundle = d3.layout.bundle();

  var lineBundle = d3.svg.line()
        .interpolate("bundle")
        .tension(0.97)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

  var width = parseInt(container.style('width'), 10);
  var height = parseInt(container.style('height'), 10);
  queryH = width*0.3;
  queryW = width*0.3;
  if (!treeOnly){
    queryH = height;
    queryW = width;
  }
  console.log("queryH="+queryH+"  width="+width+"  height="+height);  
  var svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

  var relationship_selection = svg.selectAll(".link");
  var linkTree_selection = svg.selectAll(".link"),
      node_selection = svg.selectAll(".node1"); // Empty selection at first
    
  var nodeEnter;
  var time = 0;
 

  var i = 0,
      duration = 750,
      rootSearch;
  var treeSearch;
  var diagonal;
    
  if (queryData){
      d3.json(queryData, function(error, classes) {
        var cluster = d3.layout.cluster()
          .size([360, innerRadius])
          .sort(null)
          .value(function(d) { return d.size; });

        qnodes = cluster.nodes(packageHierarchy(classes));

        //qnodes.splice(0, 1);  // remove the first element (which is created by the reading process)
        qnodes.forEach(function(d) {
          if (d.depth == 0){
            qroot = d;
          } 
        }); 
        qnodes = cluster.nodes(qroot);
 
        
         
        
         if (!treeOnly){  //randommize the tree
          // Edge bundling links  
          qlinks = packageImports(qnodes);
           // swapBranches for study2
          swapBranches(hasSubtree);
        }
        qnodes.forEach(function(child) { 
          var childDepth = computeDepth(child);
          if (childDepth>qmaxDepth){
              qmaxDepth = childDepth;
          }
        });
           
        function computeDepth(n1){
          if (!n1.parent)
            return 0;
          else
            return computeDepth(n1.parent)+1;
        } 


        childDepth1(qroot); 
        count1 = childCount1(0, qroot); 
        count2 = childCount2(0, qroot);  // DFS id of nodes are also set in this function
        scaleCircleQ =1;
        setupTreeQ(qroot, queryH,queryW);
        scaleCircleQ = scaleRateQ;
        setupTreeQ(qroot, queryH,queryW);
        qlinkTree = d3.layout.tree().links(qnodes);

        var a =  random()%nodes.length;
        var dif = maxDepth-qmaxDepth;
        if (dif<3)
          dif = 3;
        while (nodes[a].depth>=dif || nodes[a].depth<1){
          a =  random()%nodes.length;
        }

        /// Make a subttree for Study 1 
        if (hasSubtree && nodes.length>0)
          makeSubtree();
        
        


        
        // Check if there is a subtree in the generated tree
        nodes.forEach(function(child) {
          if (isSimilar(child,qroot)){
            if (child.name.indexOf("query tree")<0)
              child.name = "found subtree by scanning"+ child.name;
          }  
          function isSimilar(n1,n2){
            if (!n1.children && !n2.children){
              return true;
            }
            else if (n1.children && !n2.children){
              return false;
            }
            else if (!n1.children && n2.children){
              return false;
            }
            else {  // when both have children
              if (n1.children.length!= n2.children.length){
                return false;
              }
              else{
                var result = true;
                for (var i=0; i<n1.children.length; i++){
                  result = result && isSimilar(n1.children[i], n2.children[i]) 
                }
                return result;
              }
            }
          }  
        });  
        
         
        draw_qTree();   // draw the query tree or the 
        

        if (treeOnly)   // draw the search (big tree) for the first study
          main();
        else{
          svg.selectAll("path.link").remove();
          relationship_selection 
            .data(bundle(qlinks))
            .enter().append("path")
            .attr("class", "link")
            .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("d", lineBundle);   
        }
     });
   } 
  

  // Define the layout ********************************************
  function main(){   

    //Assign id to each node, root id = 0
    nodes.forEach(function(d,i) {
      d.id =i;
    });
    nodes.reverse();

    childDepth1(root); 
    count1 = childCount1(0, root); 
    count2 = childCount2(0, root);  // DFS id of nodes are also set in this function
    root.idDFS = nodeDFSCount++; 
    root.order1 =0;

    scaleCircle =1;
    setupTree(root,  height, width);
    scaleCircle = scaleRate;
    setupTree(root, height, width);

    
    drawNodeAndLink();
    //update();

    
 }// End of main() ********************************************************************************


function setupTree(rootTree, h, w) {
  var minY = 10000;   // used to compute the best scale for the input tree
  var minX = 10000;   // used to compute the best scale for the input tree
  var maxX = 0;   // used to compute the best scale for the input tree
  treeLayout(rootTree).map(function(d,i) {
    if (d.depth==0){
       d.treeX = w/2+queryH/2.7; 
       d.treeY = h-getRadius(rootTree)-10;
       d.treeR = getRadius(rootTree);
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
        child.treeR = getRadius(child);
      
        
        // find scales
        if (child.treeY-rC<minY) {
          minY = child.treeY-rC;
        };
        if (child.treeX<minX) {
          minX = child.treeX;
        };
        if (child.treeX>maxX) {
          maxX = child.treeX;
        };
        begin +=additional;
      });
    }
    var mid = queryH+(width-queryH)/2;
    var disX1 = maxX-mid;
    var disX2 = mid -minX;
    var disX = Math.max(disX1, disX2);
    var scaleX = ((width-queryH)*0.7)/disX;
    var scaleY = h/(h-minY);
    scaleRate = Math.min(scaleX, scaleY);
    return d;
  });
}  

function setupTreeQ(rootTree, h, w) {
  var minY = 10000;   // used to compute the best scale for the input tree
  treeLayout(rootTree).map(function(d,i) {
    if (d.depth==0){
       d.treeX = queryW/2; 
       d.treeY = height-getRadiusQ(rootTree)-10;
       d.treeR = getRadiusQ(rootTree);
       d.alpha = -Math.PI/2; 
    }
    if (d.children){
      var totalRadius = 0;
      var totalAngle = Math.PI*1.2;
      var numChild =  d.children.length;
      d.children.forEach(function(child) {
        totalRadius+=getBranchingAngle1(getRadiusQ(child), numChild);
      });  

      var begin=d.alpha-totalAngle/2;
      d.children.forEach(function(child,i2) {
        xC =  d.treeX;
        yC =  d.treeY;
        rC = getRadiusQ(d)+getRadiusQ(child)/disFactor;
        child.treeRC = rC;

        var additional = totalAngle*getBranchingAngle1(getRadiusQ(child), numChild)/totalRadius;
        child.alpha = begin+additional/2;
        child.treeX = xC+rC*Math.cos(child.alpha); 
        child.treeY = yC+rC*Math.sin(child.alpha); 
        child.treeR = getRadiusQ(child);
      
        
        // find scales
        if (child.treeY<minY) {
          minY = child.treeY;
        };
        begin +=additional;
      });
    }
    scaleRateQ = queryH/(height-minY);
    return d;
  });
}  


function getRadius(d) {
return d._children ? scaleCircle*Math.pow(d.childCount1, scaleRadius)// collapsed package
      : d.children ? scaleCircle*Math.pow(d.childCount1, scaleRadius) // expanded package
      : scaleCircle;
}

function getRadiusQ(d) {    
return d._children ? scaleCircleQ*Math.pow(d.childCount1, scaleRadius)// collapsed package
      : d.children ? scaleCircleQ*Math.pow(d.childCount1, scaleRadius) // expanded package
      : (d.name.indexOf("ddd ") >-1)? 1.5*scaleCircleQ
      : (d.name.indexOf("eee ") >-1)? 1.5*scaleCircleQ
      : scaleCircleQ;
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
    .style("fill" , color)
    .attr("r", function(d) { return d.treeR; })
    .attr("cx", function(d) { return d.treeX; })
    .attr("cy", function(d) { return d.treeY; })
    .style("stroke", function(d) { 
        if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                return "#000";
      })        
      .style("stroke-width", function(d) { 
        if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name] )
                return 1;        
    }); 

}

function draw_qTree() {
// Update links of hierarchy.
  svg.selectAll(".nodeQ").remove();
  node_selectionQ = svg.selectAll(".nodeQ").data(qnodes);
  nodeEnterQ = node_selectionQ.enter().append("g")
    .attr("class", "nodeQ")
    .on("click", click);
  

  // Draw nodes *****************************************************
  nodeEnterQ.append("circle")
    .attr("class", "nodeQ")
    .attr("r", function(d) { return d.treeR; })
    .attr("cx", function(d) { return d.treeX; })
    .attr("cy", function(d) { return d.treeY; })
    .style("fill" , colorQ)
    .style("stroke", function(d) { 
      if (d.name.indexOf("ddd ")>-1 || d.name.indexOf("eee ")>-1)
         return "#000"; 
      else  
        return "#fff";
      })        
      .style("stroke-width", function(d) { 
        if (d.name.indexOf("ddd ")>-1 || d.name.indexOf("eee ")>-1)
         return 1; 
        else  
                return 0.5;        
    }); 

   nodeEnterQ.on('mouseover', mouseovered)
      .on("mouseout", mouseouted);


  qnodes.forEach(function(d){
    d.x = d.treeX;
    d.y = d.treeY;
  });    

     
}



function isAChildOf(node1, node2) {
  if (!node2.children) return false;
  for (var i=0; i<node2.children.length;i++){
    if (node1==node2.children[i])
      return true;
  } 
  return false;
}





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
    /*
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
      .style("font-weight", "bold");*/
   } 
   console.log("node name="+d.name);
  }

  function mouseouted(d) {
    svg.selectAll("path.link")
        .classed("link--faded", false)
        .classed("link--target", false)
        .classed("link--source", false);

    d3.selectAll(".node1")
        .attr("r", function(d){ return d.treeR; })
        .style("fill" , color)
        .style("fill-opacity", 1);

    svg.selectAll(".nodeTextBrushing").remove();    
  }  
}




