var width, height,
  treemap,
  svg, cluster,
  maxDepth, numLeaf, link, bundle, links, treeOnly, root;

function treeMap(queryData, randomSeed, heightTree, degreeTree, container, treeOnly, hasSubtree, showSubtree_) {
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

  treemap = d3.layout.treemap()
      .padding(6)
      .size([width-queryH*1.2, height])
      .value(function(d) { return 1; });

  svg = container.append("svg")
//  svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height+200)
      .append("g")
      .attr("transform", "translate(-.5,-.5)");

  g1 = svg.append('g')
    .attr("transform", "translate(" + 0 + "," + (height-queryH)/2 + ")");
  
  g2 = svg.append('g')
    .attr("transform", "translate(" + queryH*1.2 + "," + 0 + ")");
  
      
  cluster = d3.layout.cluster()
      .size([360, 360])
      .sort(null)
      .value(function(d) { return 1; });

  maxDepth=0, numLeaf=0;
  link = svg.selectAll(".link");
  bundle = d3.layout.bundle();
  


  if (queryData){
      d3.json(queryData, function(error, classes) {
        
        qnodes = cluster.nodes(packageHierarchy(classes));

        if (!treeOnly){  //randommize the tree
          // Edge bundling links  
          qlinks = packageImports(qnodes);

           // swapBranches for study2
          swapBranches(hasSubtree);
        }

        //qnodes.splice(0, 1);  // remove the first element (which is created by the reading process)
        qnodes.forEach(function(d) {
          if (d.depth == 0){
            qroot = d;
          } 
          if (d.depth>qmaxDepth){
              qmaxDepth = d.depth;
          }
        });    
        
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


        if (treeOnly)
          main();
        
        // Draw query tree nodes ************************************************************* 
        var qtreemap = d3.layout.treemap()
        .padding(6)
        .size([queryH, queryH])
        .value(function(d) { return 1; });


        var cell = g1.data([qroot]).selectAll("g")
          .data(qtreemap.nodes)
          .enter().append("g")
          .attr("class", "cell")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          var listHighlighted =[] ;

        cell.append("rect")
          .attr("width", function(d) { return d.dx; })
          .attr("height", function(d) { return d.dy; })
          .style("stroke", function(d) { 
            if (d.name.indexOf("ddd ")>-1 || d.name.indexOf("eee ")>-1)
              listHighlighted.push(d);
            return "#fff"; })
          .style("stroke-width", function(d) { return 0.5; })
          .style("fill", function(d) { 
             return colorQ(d); 
        });




         
        if (!treeOnly){   // Draw Edge bunding     
          svg.selectAll(".hightlightedNode")
              .data(listHighlighted)
              .enter().append("rect")
          .attr("class", "hightlightedNode")
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; })
          
          .attr("width", function(d) { return d.dx; })
          .attr("height", function(d) { return d.dy; })
          .style("stroke", function(d) { 
            return "#000"; })
          .style("stroke-width", function(d) { return 1; })
          .style("fill", function(d) { 
             return colorQ(d); 
          }); 
        
          var line = d3.svg.line()
          .interpolate("bundle")
          .tension(0.97)
          .x(function(d) { return d.x+d.dx / 2; })
          .y(function(d) { return d.y+d.dy / 2; });
                
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
    

  function main() {
    nodes.forEach(function(d) { 
        if (d.depth>maxDepth)
            maxDepth = d.depth;
        if (!d.children)
            numLeaf++;
        if (d.depth==0)
          root =d;  
    });
    var cell = g2.data([root]).selectAll("g")
      .data(treemap.nodes)
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    cell.append("rect")
      .attr("width", function(d) { return d.dx; })
      .attr("height", function(d) { return d.dy; })
      //.style("fill", function(d) { return d.children ? color(d.name) : null; })
      .style("stroke", function(d) { return "#fff"; })
      .style("stroke-width", function(d) { return 0.5; })
      .style("fill", function(d) { 
         return color(d); 
    });

     /* 
    if (!treeOnly){
      var nodes2 = [];
      for (var i=0; i<nodes.length;i++){
        var nod = nodes[i];
        nod.x = nod.x ;
        nod.y = nod.y;
        nodes2.push(nod);
      }

      links = packageImports(nodes2);
      var _line = d3.svg.line()
      .interpolate("bundle")
      .tension(0.98)
      .x(function(d) { return d.x +d.dx / 2})
      .y(function(d) { return d.y +d.dy / 2})


      link = link
          .data(bundle(links))
        .enter().append("path")
          .attr("class", "link")
          .attr("d", function(d) {
            return _line(d)
          })
    }  */  
  }
}