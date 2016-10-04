var diameter, radius, innerRadius,
    cluster,
    bundle,
    line,
    svg,
    g1,g2
    link, node,
    maxDepth;

var numLeaf =0;

function radialTree(queryData, randomSeed, heightTree, degreeTree, container, treeOnly, hasSubtree, showSubtree_) {
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
  if (!treeOnly)
    queryH = height;
 
  radius = Math.min(height/2, (width-queryH) / 2);
  if (!treeOnly)
    radius = height/2;
  
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
        });  
        qnodes = qcluster.nodes(qroot);

        
        qnodes.forEach(function(child) { 
          if (child.depth>qmaxDepth){
              qmaxDepth = child.depth;
          }
        });    
        
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

      

      if (treeOnly){
        main();

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
      }  
      else{
        drawMirrorTree();
      }


    });
  } 
 
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



  function drawMirrorTree(){
    nodes =  qnodes;

    var a = [];
    qnodes.forEach(function(d) {
      if (!d.children)
        a.push(d);
    });

    a.sort(function (a, b) {
      if (a.x < b.x) {
        return 1;
      }
      else if (a.x > b.x) {
        return -1;
      }
      else 
        return 0;
    });  

    var gapX = (radius)/(a.length+1);
    for (var i=0;i<a.length;i++){
      a[i].x = i*gapX;
    }

    // compute a balance tree
    var balance = false;
    qnodes.forEach(function(d) {
      if (!d.children){
         d.fromLeaf = 0;       
      }     
      if (d.depth==0)
        qroot = d;   
    });

    while (!balance){
      balance = true;     
      qnodes.forEach(function(d) {
        if (d.children){
          var isAllChildrenComputed = true;
          var sum = 0;
          var num = 0;
          fLeaf = -100;
          for (var i=0; i<d.children.length;i++){
              var nod = d.children[i];
              if (nod.children && !nod.numLeaf){
                  isAllChildrenComputed = false;
              }  
              if (!nod.children){
                num++;
                sum += nod.x;
                if (fLeaf<0)
                 fLeaf = 0;
              }  
              else{
                if (nod.fromLeaf>fLeaf)
                   fLeaf = nod.fromLeaf;
                num+=nod.numLeaf;
                sum += nod.x*nod.numLeaf;
              }  
             
          }
          if (d.children && isAllChildrenComputed){
              if (!d.numLeaf){
                d.numLeaf = num;
                d.x = sum/d.numLeaf;
                d.fromLeaf = fLeaf+1;
              //  console.log(d.x+" "+d.name+"  "+d.fromLeaf);
              }
          }
          else {
              balance = false;
          }
        }

      }); 
    }

    var maxX = 0;

    qnodes.forEach(function(d) {
      if (d.x>maxX)
        maxX = d.x;
    }); 
    qnodes.forEach(function(d) {
      d.y = maxX;
    }); 

    maxDepth = qroot.fromLeaf;
    var numLevelFromLeaf = qroot.fromLeaf;
    var gap = radius*0.6/(numLevelFromLeaf);

    qnodes.forEach(function(d) { 
      d.r2 = radius*0.6+d.fromLeaf*gap*0.6;
      if (d.children)
        d.r2 = radius*0.6+(d.fromLeaf-0.6)*gap*0.6;

      var start = 2*Math.PI*(d.x/(d.y+maxX/qroot.numLeaf));
      var xx1 = (radius*0.6-d.fromLeaf*gap)*Math.cos(start);
      var yy1 = (radius*0.6-d.fromLeaf*gap)*Math.sin(start);
      var xx2 = (d.r2)*Math.cos(start);
      var yy2 = (d.r2)*Math.sin(start);
      d.x = xx1;
      d.y = yy1; 
      d.x2 = xx2;
      d.y2 = yy2;  
    });
    qroot.x = 0;
    qroot.y = 0;
    
    var nodes2 = qnodes;
    
    links = qlinks;
    var nodeEnter = g2.selectAll("g.node").data(qnodes)
      .enter().append("circle")
      .attr("class",  function(d){
        if (d.name.indexOf("ddd ")>-1 || d.name.indexOf("eee ")>-1)
                  return "hightlightedNode";
            else
                "qnode";
      })
      .attr("cx", function(d) { return d.x2})
      .attr("cy", function(d) { return d.y2})
      .style("fill", function(d) { 
        return colorQ(d); })
      .attr("r", function(d) { 
        if (d.children)
          return (0)
        else 
          return 30/Math.sqrt(qnodes.length);})
      ;

      g2.selectAll(".hightlightedNode")
       .style("fill" , colorQ)
       .attr("r" , function(d) { 
                  return 45/Math.sqrt(qnodes.length); })
       .style("stroke", "#000")
       .style("stroke-width", function(d) { 
                    return 1;        
        });
      
       
    var arcMin = radius*0.6;
        
    
    var drawArc = d3.svg.arc()
        .innerRadius(function(d, i) {
          return d.r2 ;
        })
        .outerRadius(function(d, i) {
          return d.r2 + gap*0.6-0.4;
        })
        .startAngle( function(d, i) { 
          var alpha = d.numLeaf/ qroot.numLeaf;

          var start = Math.atan(d.y2/d.x2)-(alpha/2)*Math.PI*2-Math.PI/2;
          if (-d.x2<0) start+=Math.PI;
            
          if (isNaN(start))
            start = 0;
          
          return start;
         })
        .endAngle(function(d, i) {
          var alpha = d.numLeaf/ (qroot.numLeaf);
          
          var result =   Math.atan(d.y2/d.x2)+(alpha/2)*Math.PI*2-Math.PI/2;
          if (-d.x2<0) result+=Math.PI;
         
          if (isNaN(result)){
             result = 0;
           }
           
          return result;   
        });


    // mirror tree    
    linkArcs = g2.append("g").selectAll("path")
          .data(nodes2)
          .enter().append("path")
          .attr("class", "linkArc")
          .style("fill", function(d, i) {
             return colorQ(d);
          })
          .style("stroke", function(d, i) {
            if (d.children)
              return "#eeeeee";
          
          })
          .style("stroke-width", 1)
          .style("stroke-opacity", 0.8)
          .style("fill-opacity", 1)
          .attr("d", drawArc) ; 


       var line = d3.svg.line()
        .interpolate("bundle")
        .tension(0.97)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
              
        g2.selectAll("path.link").remove();
        g2.selectAll("path.link")
          .data(bundle(qlinks))
          .enter().append("path")
          .attr("class", "link")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("d", line);     
  }


}