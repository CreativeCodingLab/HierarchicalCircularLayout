var diameter, radius, innerRadius,
    cluster,
    bundle,
    line,
    svg,
    g1,g2
    link, node,
    maxDepth;

var numLeaf =0;

function radialInsideTree(queryData, randomSeed, heightTree, degreeTree, container, treeOnly, hasSubtree, showSubtree_) {
  showSubtree = showSubtree_;
  seed1 = randomSeed;
  nodes = [];
  links = [];
  generateRandomTree(heightTree,degreeTree); 
  nodes.forEach(function(child) { 
    if (child.depth>maxDepth){
        maxDepth = child.depth;
    }
  });        
  linkTree = d3.layout.tree().links(nodes);



  // fit visualization to container
  var width =  parseInt(container.style('width'), 10);
  var height =  parseInt(container.style('height'), 10);
  queryH = width*0.3;
  radius = Math.min(height/2, (width-queryH) / 2);
  
  cluster = d3.layout.cluster()
      .size([360, radius*0.8])
      .sort(null)
      .value(function(d) { return d.size; });

  bundle = d3.layout.bundle();

  line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(0.9)
      .radius(function(d) { return d.y; })
      .angle(function(d) { return d.x / 180 * Math.PI; });

  svg = container.append('svg')
      .attr("width", width)
      .attr("height", height);
  g2 = svg.append('g')
      .attr("transform", "translate(" + (queryH/2) + "," + height/2 + ")");;
  
  g1 = svg.append('g')
    .attr("transform", "translate(" + (queryH+(width-queryH)/2) + "," + height/2 + ")");
  
  
  link = g1.append("g").selectAll(".linkTree"),
  node = g1.append("g").selectAll(".node");

  
  if (queryData){
      d3.json(queryData, function(error, classes) {
        var qcluster = d3.layout.cluster()
          .size([360, queryH*0.4])
          .sort(null)
          .value(function(d) { return d.size; });

        qnodes = qcluster.nodes(packageHierarchy(classes));

        //qnodes.splice(0, 1);  // remove the first element (which is created by the reading process)
        qnodes.forEach(function(d) {
          if (d.depth == 0){
            qroot = d;
          } 
        });  
        
        qnodes.forEach(function(child) { 
          if (child.depth>qmaxDepth){
              qmaxDepth = child.depth;
          }
        });    
        
        var a =  random()%nodes.length;
        var dif = maxDepth-qmaxDepth;
        if (dif<3)
          dif = 3;
        while (nodes[a].depth>=dif || nodes[a].depth<1){
          a =  random()%nodes.length;
        }
        
        if (hasSubtree){
          if (!nodes[a].children)
            nodes[a].children = [];
          nodes[a].childCount1++;
          var node2 = copyNode(qroot,nodes[a].depth, "query tree");
          //node2.name = "query";
          //console.log("a="+a);
          
          function copyNode(n1, depth, subname){
            var n2 = {};
            n2.name = subname+n1.name;
            n2.depth = depth+1;
            
            if (n1.children){
              n2.children =[];
              for (var i=0;i<n1.children.length;i++){
                var child1 = n1.children[i];
                var child2 = copyNode(child1, depth+1,subname);
                n2.children.push(child2);
              }
            }
            nodes.push(n2);
            return n2;
          }
          nodes[a].children.push(node2);
        }

        // Testing the existence of another tree generated by radomization
        /*
        var a2 =  random()%nodes.length;
        if (!nodes[a2].children)
          nodes[a2].children = [];
        nodes[a2].childCount1++;
        var node3 = copyNode(qroot,nodes[a2].depth, "test tree");
        nodes[a2].children.push(node3);*/

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

      
      // Hierarchical links ********************************************

     
      var qdiagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
    
      g2.selectAll(".qlinkTree")
        .data(qcluster.links(qnodes))
        .enter().append("svg:path")
        .attr("class", "qlinkTree")
        .attr("d", qdiagonal)
        .attr("fill", "none")
        .attr("stroke", function(d) { 
            return color(d.source);
          })
        .style("stroke-width",  1);

      // Draw query tree nodes *************************************************************  
      var node5 = g2.selectAll("g.qnode")
        .data(qnodes)
        .enter().append("svg:g")
        .attr("class",  function(d) { return d.children ? "node" : "leaf node"; })
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

      node5.append("circle")
        .attr("r", 4)
        .style("stroke",  function(d) { if (d.depth<=0) return "#000" ; })
        .style("stroke-width",  4)
        .style("fill", function(d) { return colorQ(d);}); 

    main();
    });
  } 
  else
    main();
 
  function main() {
    nodes = cluster.nodes(root);
    
    
    maxDepth = 0;
    numLeaf =0;
    nodes.forEach(function(d) { 
        if (d.depth>maxDepth)
            maxDepth = d.depth;
        if (!d.children)
            numLeaf++;
        if (d.depth==0)
          root =d;  
    });

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
    
    var link4 = g1.selectAll(".linkTree")
        .data(cluster.links(nodes))
        .enter().append("svg:path")
        .attr("class", "linkTree")
        .attr("d", diagonal)
        .attr("fill", "none")
        .attr("stroke", function(d) { 
              if (d.source.name=="")
                  return "#ff0000";
              else
                  return color(d.source);
          })
        .style("stroke-width",  1);

    var node4 = g1.selectAll("g.node2")
        .data(nodes)
        .enter().append("svg:g")
        .attr("class",  function(d) { return d.children ? "node" : "leaf node"; })
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

    node4.append("circle")
        .attr("r", radius/numLeaf)
        .style("stroke",  function(d) { if (d.depth<=0) return "#000" ; })
        .style("stroke-width",  4)
        .style("fill", function(d) { return color(d);});   

  }
}