

  

function ballon(queryData, randomSeed, heightTree, degreeTree, container, treeOnly, hasSubtree, showSubtree_) {
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
  
  // fit visualization to container
  width = parseInt(container.style('width'), 10);
  height = parseInt(container.style('height'), 10);
  queryH = width*0.3;
  if (!treeOnly)
    queryH =height;
  radius = Math.min(height/2, (width-queryH) / 2);
  
  svg = container.append('svg')
      .attr("width", width)
      .attr("height", height);
  


  
  var bundle = d3.layout.bundle();  

  var vis2 = svg
    .append("g")
      .attr("transform", "translate(" + (queryH+radius) + "," + (height/2) + ")");

    var vis1 = svg
    .append("g")
      .attr("transform", "translate(" + queryH/2 + "," + (height/2) + ")");
      
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
          d.size=1000;
          d.externalImports=[];
          d.externalLinkCount =0;
        });  
        
        qnodes.forEach(function(child) { 
          if (child.depth>qmaxDepth){
              qmaxDepth = child.depth;
          }
          child.y += height*0.04;
        });    



        if (!treeOnly){  //randommize the tree
          // Edge bundling links  
          qlinks = packageImports(qnodes);

           // swapBranches for study2
          swapBranches(hasSubtree);
        }
       /// Make a subttree for Study 1
        if (hasSubtree && nodes.length>0)
          makeSubtree(); 


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

        
         
        
         
        if (treeOnly){
           main();
        }  

      // Draw query tree nodes *************************************************************  
      // Draw the query tree after all
      var qtree = d3.layout.balloon()
        .size([queryH*0.9, queryH*0.9])
        .value(function(d) { return d.size; })
        .gap(function(d) { return d.externalLinkCount * 20; });

        
       qnodes = qtree.nodes(qroot); 
       
       var qnode = vis1.selectAll("g.qnode")
          .data(qnodes)
        .enter().append("g")
          .attr("class", "qnode");
       
      qnode.append("circle")
          .attr("class","qnode")
          .attr("r", function(d) { return d.r; })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr("fill", function(d) { 
            return colorQ(d); })
          .style("stroke", function(d) { 
                    return "#fff";
           })        
          .style("stroke-width", function(d) { 
           return 0.5;            
        });

        if (!treeOnly){   // Draw Edge bunding     
          var line = d3.svg.line()
          .interpolate("bundle")
          .tension(0.97)
          .x(function(d) { return d.x; })
          .y(function(d) { return d.y; });
          
         
          vis1.selectAll("path.link").remove();
          vis1.selectAll("path.link")
            .data(bundle(qlinks))
            .enter().append("path")
            .attr("class", "link")
            .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("d", line);   
        }    

    });
  } 


  function main() {  
    nodes.forEach(function(d) { 
      if (d.depth>maxDepth)
          maxDepth = d.depth;
      if (!d.children)
          numLeaf++;
      if (d.depth==0)
        root =d;  
      d.size=1000;
      d.externalImports=[];
      d.externalLinkCount =0;
    });

     var tree = d3.layout.balloon()
      .size([height*0.9, height*0.9])
      .value(function(d) { return d.size; })
      .gap(function(d) { return d.externalLinkCount * 20; });


      nodes = tree.nodes(root); 

      var node = vis2.selectAll("g.node")
          .data(nodes)
        .enter().append("g")
          .attr("class", function(d) { return d.children ? "node" : "leaf node"; });
        
        nodes.forEach(function(d) { 
            if (!d.children)
                numLeaf++;         
        });

      node.append("circle")
          .attr("r", function(d) { return d.r; })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr("fill", function(d) { 
            return color(d); })
          .style("stroke", function(d) { 
            if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                    return "#000";
            else
                    return "#fff"      
          })        
          .style("stroke-width", function(d) { 
            if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                    return 1;    
            else 
                return 0.5;            
        });

    }
}