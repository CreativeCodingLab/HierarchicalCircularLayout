var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line()
      .interpolate("bundle")
      .tension(0.98)
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

var width = 1400,
    height = 800,
    root;

var force = d3.layout.force()
    .linkDistance(50)
    .charge(-120)
    .gravity(.15)
    .size([width, height])
    .on("tick", tick);
     
var svg = d3.select("body").append("svg")
    .attr("id", "SVGmain")
    .attr("width", width)
    .attr("height", height);

var relationship_selection = svg.selectAll(".link");
var link_selection = svg.selectAll(".link"),
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
//d3.json("data/52_ERBB2_Dot.json", function(error, classes) {
//d3.json("data/53_RAF_Dot.json", function(error, classes) {
//d3.json("data/mammalsWithRelationships.json", function(error, classes) {
//  d3.json("data/carnivoraWithRelationships.json", function(error, classes) {
  
//d3.json("data/Mammals.json", function(error, classes) {
//d3.json("./3676778/data/1_Activation of Pro-caspase 8_Dot.json", function(error, classes) {
  d3.json("data/readme-flare-imports.json", function(error, classes) {
  nodes = cluster.nodes(packageHierarchy(classes));
  nodes.splice(0, 1);  // remove the first element (which is created by the reading process)
  links = packageImports(nodes);
  linkTree = d3.layout.tree().links(nodes);
  tree_nodes = d3.layout.tree().nodes(classes);
  nodes.forEach(function(d) {
    if (d.depth == 1){
      root = d;
      console.log(d.name+ " d.depth = "+d.depth);
    } 
  });

   force
       .nodes(nodes)
       .links(linkTree)
        .start();

  var tree = d3.layout.tree().size([ width, height ]);


  tree.sort(comparator);
  
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

  if (time==0){
    newNodes = tree(root)
      .map(function(d,i) {
        if (d.depth==0){
           d.treeX = 600; 
           d.treeY = height-getRadius(root)/3;
           d.alpha = -Math.PI/2; 
        }
        if (d.children){
          var totalRadius = 0;
          var totalAngle = Math.PI*1.1;
          d.children.forEach(function(child) {
            totalRadius+=getBranchingAngle(getRadius(child));
          });  
    
          var begin=d.alpha-totalAngle/2;
          d.children.forEach(function(child,i2) {
            xC =  d.treeX;
            yC =  d.treeY;
            rC = getRadius(d)+getRadius(child)/3;
             
            var additional = totalAngle*(getBranchingAngle(getRadius(child))/totalRadius);
            //console.log(begin + "    additional = "+additional);
            child.alpha = begin+additional/2;
            begin +=additional;
            
            child.treeX = xC+rC*Math.cos(child.alpha); 
            child.treeY = yC+rC*Math.sin(child.alpha); 
          });
        }
        return d;
    });
  }  
  time++;
   //Assign id to each node, root id = 0
  nodes.forEach(function(d,i) {
    d.id =i;
  });

// Restart the force layout.
  force.nodes(newNodes);
  force.links(linkTree);
  force.start();

  update();
  
//===============================================
$("#searchName").on("select2-selecting", function(e) {
    clearAll(root);
    clearAll(rootSearch);
    expandAll(rootSearch);
    updateSearch(rootSearch);

    searchField = "d.name";
    searchText = e.object.text;
    searchTree(rootSearch);
    rootSearch.children.forEach(collapseAllNotFound);
    updateSearch(rootSearch);
})

 treeSearch = d3.layout.tree()
    .size([height, width]);

 diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

  rootSearch = root;
  rootSearch.x0 = height / 2;
  rootSearch.y0 = 0;

  select2Data = [];
  select2DataCollectName(rootSearch);
  select2DataObject = [];
  select2Data.sort(function(a, b) {
            if (a > b) return 1; // sort
            if (a < b) return -1;
            return 0;
        })
        .filter(function(item, i, ar) {
            return ar.indexOf(item) === i;
        }) // remove duplicate items
        .filter(function(item, i, ar) {
            select2DataObject.push({
                "id": i,
                "text": item
            });
        });
    select2Data.sort(function(a, b) {
            if (a > b) return 1; // sort
            if (a < b) return -1;
            return 0;
        })
        .filter(function(item, i, ar) {
            return ar.indexOf(item) === i;
        }) // remove duplicate items
        .filter(function(item, i, ar) {
            select2DataObject.push({
                "id": i,
                "text": item
            });
        });
  $("#searchName").select2({
        data: select2DataObject,
        containerCssClass: "search"
  });
  rootSearch.children.forEach(collapse);
  updateSearch(rootSearch);
});





//===============================================
function hideSVG(inValue) {
  //console.log("value   "+document.getElementById("checkbox1").checked);
    /*if(d3.select("#"+inValue).style("display") == "none") {
       d3.select("#"+inValue).style("display", "block")
    }
    else {
       d3.select("#"+inValue).style("display", "none")
    }*/
    update();
 }

function update() {
  // Update links of hierarchy.
  link_selection = link_selection.data(linkTree, function(d) { return d.target.id; });
  link_selection.exit().remove();
  link_selection.enter().append("line")
      .attr("class", "linkTree");

// Update nodes.
  svg.selectAll(".node1").remove();
  node_selection = svg.selectAll(".node1").data(nodes);
  
  nodeEnter = node_selection.enter().append("g")
    .attr("class", "nodeG")
    .on("click", click)
    .call(force.drag);
  

  //console.log("***nodeEnter   "+nodeEnter);
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
  
/*
svg.append("linearGradient")                
        .attr("id", "line-gradient")            
        .attr("gradientUnits", "userSpaceOnUse")    
        .attr("x1", 0).attr("y1", 0)         
        .attr("x2", 1000).attr("y2", 1000)      
    .selectAll("stop")                      
        .data([                             
            {offset: "0%", color: "red"},       
            {offset: "100%", color: "lawngreen"}   
        ])                  
    .enter().append("stop")         
        .attr("offset", function(d) { return d.offset; })   
        .attr("stop-color", function(d) { return d.color; });  
*/
/*svg.append("line")
  .attr("x1", 100)
  .attr("x2", 1000)
  .attr("y1", 100)
  .attr("y2", 600)
  .style("stroke", "url(#line-gradient)");*/


  if (document.getElementById("checkbox2").checked){
  // Draw directed links *******************************************************
    var aa = bundle(links);
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
          .style("stroke-width", 0.1 )
          .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], 1); });
    }
  }
  else {
    // Update Undirected links of relationships.
    var color2 = d3.interpolateLab("#008000", "#c83a22");
    svg.selectAll("path.link").remove();
    relationship_selection 
        .data(bundle(links))
      .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
        .attr("d", line);
  }
//  tick();

}


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

function tick(event) {
  link_selection.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; }); 
  var force_influence = 0.9;
  node_selection
    .each(function(d) {
      d.x += (d.treeX - d.x) * (force_influence); //*event.alpha;
      d.y += (d.treeY - d.y) * (force_influence); //*event.alpha;
    });
 // circles.attr("cx", function(d) { return d.x; })
  //    .attr("cy", function(d) { return d.y; });  
  
}


// Fisheye Lensing ************************************************
var fisheye = d3.fisheye.circular()
      .radius(200);
svg.on("mousemove", function() {
  force.stop();
if (document.getElementById("checkbox2").checked)
   fisheye.focus(d3.mouse(this));
  d3.selectAll("circle").each(function(d) { d.fisheye = fisheye(d); })
    .attr("cx", function(d) { return d.fisheye.x; })
    .attr("cy", function(d) { return Math.round(d.fisheye.y); });
   // .attr("r", function(d) { return d.fisheye.z * 8; });
 link_selection.attr("x1", function(d) { return d.source.fisheye.x; })
    .attr("y1", function(d) { return Math.round(d.source.fisheye.y); })
    .attr("x2", function(d) { return d.target.fisheye.x; })
    .attr("y2", function(d) { return Math.round(d.target.fisheye.y); });
 
  var force_influence = 0.5;
  node_selection
    .each(function(d) {
      d.x = d.fisheye.x; //*event.alpha;
      d.y = d.fisheye.y; //*event.alpha;
    });
  svg.selectAll("circle.node1").attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return Math.round(d.y); });  
  svg.selectAll("path.link")
      .each(function(d) { })
      .attr("d", line);  

  node_selection
    .each(function(d) {
      d.x += (d.treeX - d.x) * (force_influence); //*event.alpha;
      d.y += (d.treeY - d.y) * (force_influence); //*event.alpha;
    });
});


function color(d) {
  var sat = 200-d.depth*25;
  return d._children ? "rgb("+sat+", "+255+", "+255+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    : "#0000f0"; // leaf node
}
function getBranchingAngle(radius3) {
  return Math.pow(radius3,0.8);
 } 

function getRadius(d) {
return d._children ? 5*Math.pow(d.childCount1, 0.75)// collapsed package
      : d.children ? 5*Math.pow(d.childCount1, 0.75) // expanded package
      : d.size ? Math.pow(d.size,0.2)/2
      : 1; // leaf node
}

// Toggle children on click.
function click(d) {
/*  if (d3.event.defaultPrevented) return; // ignore drag
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  console.log("Clicking on = "+d.name+ " d.depth = "+d.depth);
  
 update();*/
}

/*
function collide(alpha) {
  var quadtree = d3.geom.quadtree(tree_nodes);
  return function(d) {
    quadtree.visit(function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== d) && (quad.point !== d.parent) && (quad.point.parent !== d)) {
         var rb = getRadius(d) + getRadius(quad.point),
        nx1 = d.x - rb,
        nx2 = d.x + rb,
        ny1 = d.y - rb,
        ny2 = d.y + rb;

        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
          l = (l - rb) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
*/

function flatten(root) {
  var i = 0;
  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
  }
  recurse(root);
};

function childCount1(level, n) {
    count = 0;
    if(n.children && n.children.length > 0) {
      count += n.children.length;
      n.children.forEach(function(d) {
        count += childCount1(level + 1, d);
      });
      n.childCount1 = count;
    }
    else{
       n.childCount1 = 0;
    }
    return count;
};



function childCount2(level, n) {
    var arr = [];
    if(n.children && n.children.length > 0) {
      n.children.forEach(function(d) {
        childCount2(level + 1, d);
        arr.push(d);
      });
    }
    arr.sort(function(a,b) { return parseFloat(a.childCount1) - parseFloat(b.childCount1) } );
    var arr2 = [];
    arr.forEach(function(d, i) {
        d.order1 = i;
        arr2.splice(arr2.length/2,0, d);
    });
    arr2.forEach(function(d, i) {
        d.order2 = i;
    });

};

d3.select(self.frameElement).style("height", diameter + "px");

