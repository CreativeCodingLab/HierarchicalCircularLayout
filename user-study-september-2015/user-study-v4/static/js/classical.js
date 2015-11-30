var diameter, radius, innerRadius,
  cluster,
  svg,
  g1,link,node,bundle,
  line,nodes,links,
  maxDepth,numLeaf,
  linkTree,
  linkTree_selection,
  treeOnly;
var  maxDepth=0, numLeaf=0;


var qnodes, qlinkTree, qroot, qmaxDepth=1;
var showSubtree;

function classical(queryData, randomSeed, heightTree, degreeTree, container, treeOnly, hasSubtree, showSubtree_) {
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
  
  diameter = parseInt(container.style('height'), 10),
  radius = diameter / 2;
  
  
  bundle = d3.layout.bundle();

  svg = container.append('svg')
    .attr({
      width: "100%",
      height: "100%"
    })
    
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
        var tree = d3.layout.tree().size([queryH*0.9,queryH*0.9]);
        qnodes = tree(qroot);
   
        qnodes.forEach(function(child) { 
          if (child.depth>qmaxDepth){
              qmaxDepth = child.depth;
          }
          child.y += height*0.04;
        });    
        qlinkTree = tree.links(qnodes);

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
      var qlinkTree = d3.layout.tree().links(qnodes);
        svg.selectAll(".qlinkTree").data(qlinkTree).enter() 
        .append("line")
        .attr("class", "qlinkTree")
        .attr("stroke", function(d) { 
              return colorQ(d.source);
          })
        .attr("stroke-width", function(d) { 
          if (treeOnly)
            return 1;
          else
            return 0.6;
             
          })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return Math.round(d.source.y); })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return Math.round(d.target.y); });

      // Draw query tree nodes *************************************************************  

      var qdisLeaf = computeDis(qroot);
      svg.selectAll(".qnode").data(qnodes).enter()
          .append("circle")
          .attr("class", "qnode")
          .attr({
              r: function(d) { 
                  return qdisLeaf*0.4; },
              cx: function(d) { return d.x },
              cy: function(d) { return d.y }
          })
       .style("fill", function(d) { 
          return colorQ(d); 
      })
       .style("stroke", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name]|| listSelected3[d.name] || d.depth==0)
                  return "#000";
      })
       .style("stroke-width",  function(d){ 
        if (d.depth<=1) return 2 ;
           else return 1.5 ; })

    main();
    });
  } 
  else
    main();
     
// Define the layout ********************************************
  function main(){   
    var tree = d3.layout.tree().size([(width-queryH)*0.9,height*0.9]);
    nodes = tree(root);
    nodes.forEach(function(d) { 
        if (d.depth>maxDepth)
            maxDepth = d.depth;
        if (!d.children)
            numLeaf++;
        if (d.depth==0)
          root =d;

        d.x += queryH+(width-queryH)*0.05;
        d.y += height*0.04;
    });
        /// Hierarchical links
      linkTree = d3.layout.tree().links(nodes);
      linkTree_selection = svg.selectAll(".linkTree").data(linkTree).enter(); 
      linkTree_selection.append("line")
        .attr("class", "linkTree")
        .attr("stroke", function(d) { 
              if (d.source.name=="")
                  return "#ff0000";
              else
                  return color(d.source);
          })
        .attr("stroke-width", function(d) { 
              if (d.source.name=="")
                  return 0;           // remove root link
              else{
                  if (treeOnly)
                    return 1;
                  else
                    return 0.6;
              }    
          })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return Math.round(d.source.y); })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return Math.round(d.target.y); });

      // Draw nodes *************************************************************  
      var disLeaf = computeDis(root);
      svg.selectAll(".node").data(nodes).enter()
          .append("circle")
          .attr({
              r: function(d) { 
                  if (listSelected1[d.name] || listSelected2[d.name] || listSelected3[d.name])
                      return ddisLeaf;
                  return disLeaf*0.4; },
              cx: function(d) { return d.x },
              cy: function(d) { return d.y }
          })
       .style("fill", function(d) { 
          return color(d); 
      })
       .style("stroke", function(d) { 
          if (listSelected1[d.name] || listSelected2[d.name]|| listSelected3[d.name] || d.depth==0)
                  return "#000";
      })
       .style("stroke-width",  function(d){ 
        if (d.depth<=1) return 2 ;
           else return 1.5 ; })
        ;
        //  links = packageImports(nodes);
      
     var _line = d3.svg.line()
      .interpolate("bundle")
      .tension(0.97)
      .x(function(d) { return d.x })
      .y(function(d) { return d.y })  
     
    if (!treeOnly){
      link = link
          .data(bundle(links))
        .enter().append("path")
          .attr("class", "link")
          .attr("d", function(d) {
            return _line(d)
          })
    }    
    /*    
        svg.append("text")
          .attr("class", "nodeLegend")
          .attr("x", diameter/2)
          .attr("y", diameter-50)
          .text("Reingold–Tilford Tree")
          .attr("dy", ".21em")
          .attr("font-family", "sans-serif")
          .attr("font-size", "20px")
          .style("text-anchor", "middle")
          .style("fill", "#000")
          .style("font-weight", "bold");

        var filename2 = file.split("/");
        svg.append("text")
          .attr("class", "nodeLegend")
          .attr("x", diameter/2)
          .attr("y", diameter-25)
          .text("Data: "+filename2[filename2.length-1])
          .attr("dy", ".21em")
          .attr("font-family", "sans-serif")
          .attr("font-size", "18px")
          .style("text-anchor", "middle")
          .style("fill", "#000");
          //.style("font-weight", "bold");  */
  }
  function computeDis(n1){
        if (n1.children){
          var lList = [];
          var pList = [];    // list of parent nodes
          for (var i=0;i<n1.children.length;i++){
            var child1 = n1.children[i];
            if (!child1.children)
              lList.push(child1);
            else
              pList.push(child1);            
          }
          var min1 = 100;
          var list2 =[];
          for (var j=0;j<lList.length;j++){
            list2.push(lList[j].x);
          }
          list2.sort();  
          for (var j=0;j<list2.length-1;j++){
              var dis = Math.abs(list2[j+1]-list2[j]);
              if (dis<min1)
                min1=dis;    
          }              
        
          var min2 = 100;
          for (var j=0;j<pList.length;j++){
             var dis2 = computeDis(pList[j]);
             if (dis2 && dis2<min2)
              min2=dis2;
          }  
            
          return Math.min(min1, min2);
          
        }
      }
}