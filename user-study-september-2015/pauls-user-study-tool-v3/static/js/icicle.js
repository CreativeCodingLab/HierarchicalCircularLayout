var width, height,
  svg,
  partition,
  root, nodes, links, bundle, maxDepth, numLeaf,
  treeOnly;


var qnodes, qlinkTree, qroot, qmaxDepth=1;
var showSubtree;


function icicle(queryData, randomSeed, heightTree, degreeTree, container, treeOnly, hasSubtree, showSubtree_) {
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
  width = parseInt(container.style('width'), 10);
  height = parseInt(container.style('height'), 10);
  queryH = width*0.3;
  if (!treeOnly)
    queryH = height;
  

//  svg = d3.select("body").append("svg")
  svg = container.append('svg')
    .attr("width", width+300)
    .attr("height", height);

  partition = d3.layout.partition()
    .size([(width-queryH)*0.9, height*0.9])
    .value(function(d) { return 1; });

//var nodes, links;    
  bundle = d3.layout.bundle();
  maxDepth=0, numLeaf=0;

 
  nodes.forEach(function(d) { 
        if (d.depth>maxDepth)
            maxDepth = d.depth;
        if (!d.children)
            numLeaf++;
        if (d.depth==0)
          root =d;  
    });

  if (queryData){
      d3.json(queryData, function(error, classes) {
        var cluster = d3.layout.cluster()
          .size([360, innerRadius])
          .sort(null)
          .value(function(d) { return d.size; });

        qnodes = cluster.nodes(packageHierarchy(classes));

        
        if (!treeOnly){  //randommize the tree
          // Edge bundling links  
          qlinks = packageImports(qnodes);

           // swapBranches for study2
          swapBranches(hasSubtree);
        }

        qnodes.forEach(function(d) {
          if (d.depth == 0){
            qroot = d;
          } 
        });  


         /// Make a subttree for Study 1 
        if (hasSubtree && nodes.length>0)
          makeSubtree(); 

        var tree = d3.layout.tree().size([queryH*0.9,queryH*0.9]);
        qnodes = tree(qroot);
   
        qnodes.forEach(function(child) { 
          if (child.depth>qmaxDepth){
              qmaxDepth = child.depth;
          }
          child.y += height*0.04;
        });    
        qlinkTree = tree.links(qnodes);

        


        
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



    if (treeOnly)
      main();;



    var partition2 = d3.layout.partition()
    .size([queryH*0.9, queryH*0.9])
    .value(function(d) { return 1; });

    qnodes = partition2.nodes(qroot);
    qnodes.forEach(function(d) {
      d.x = d.x+d.dx/2 + queryH*0.05;
      d.y = d.y  + height*0.05;
    });

      
      // Draw query tree nodes *************************************************************  

      svg.selectAll(".qnode")
        .data(qnodes)
        .enter().append("rect")
        .attr("class", "qnode")
        .attr("x", function(d) { 
          return d.x-d.dx/2; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.dx; })
        .attr("height", function(d) { return d.dy; })
        .style("fill", function(d) { 
          return colorQ(d); })
        .style("stroke", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name] )
                  return "#000";
          else
            return "#fff";      
        })        
        .style("stroke-width", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                  return 1;        
          else
            return 0.5;        
      });


      if (!treeOnly){   // Draw Edge bunding     
        var line = d3.svg.line()
        .interpolate("bundle")
        .tension(0.97)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
              
        svg.selectAll("path.link").remove();
        svg.selectAll("path.link")
          .data(bundle(qlinks))
          .enter().append("path")
          .attr("class", "link")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("d", line);   
      }    
      
       
    });
  } 
  

// Define the layout ********************************************
  function main(){   
    //debugger;
    nodes = partition.nodes(root);
    nodes.forEach(function(d) {
      d.x = d.x+d.dx/2 + queryH+(width-queryH)*0.075;
      d.y = d.y  + height*0.05;
    });

    svg.selectAll(".node")
        .data(nodes)
        .enter().append("rect")
        .attr("class", "node")
        .attr("x", function(d) { 
          return d.x-d.dx/2; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.dx; })
        .attr("height", function(d) { return d.dy; })
        .style("fill", function(d) { 
          return color(d); })
        .style("stroke", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name] )
                  return "#000";
          else
            return "#fff";      
        })        
        .style("stroke-width", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                  return 1;        
          else
            return 0.5;        
      });

        /*
    svg.selectAll(".label")
        .data(nodes.filter(function(d) { return d.dx > 6; }))
      .enter().append("text")
        .attr("class", "label")
        .attr("dy", ".35em")
        .attr("transform", function(d) { return "translate(" + (d.x + d.dx / 2) + "," + (d.y + d.dy / 2) + ")rotate(90)"; })
        .text(function(d) { return d.name; });*/

      if (!treeOnly){
        links = packageImports(nodes);

        var _line = d3.svg.line()
        .interpolate("bundle")
        .tension(0.97)
        .x(function(d) { return d.x })
        .y(function(d) { return d.y })

        link = svg.selectAll("path.link")
          .data(bundle(links))
        .enter().append("path")
          .attr("class", "link")
          .attr("d", function(d) {
            return _line(d)
          });
      }
  }      
}