var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;


function color(d) {
  var ccc = count%100;
  var minSat = 60;
  var maxSat = 140;
  var step = (maxSat-minSat)/maxDepth;
  var sat = Math.round(maxSat-d.depth*step)+ccc;
  //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth);
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    : "#0000f0"; // leaf node
}
function getBranchingAngle(radius3) {
  return Math.pow(radius3,0.7);
 } 

function getRadius(d) {
//  console.log("scaleCircle = "+scaleCircle);
return d._children ? scaleCircle*Math.pow(d.childCount1, 0.7)// collapsed package
      : d.children ? scaleCircle*Math.pow(d.childCount1, 0.7) // expanded package
      : scaleCircle/2;
     // : 1; // leaf node
}


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
        childCount2(level + 1, d);
        d.idDFS = nodeDFSCount++;   // this set DFS id for nodes
    });

};

d3.select(self.frameElement).style("height", diameter + "px");

/*
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
  
}*/


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
