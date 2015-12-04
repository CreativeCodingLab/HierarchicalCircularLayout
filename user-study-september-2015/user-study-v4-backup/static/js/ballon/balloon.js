d3.layout.balloon = function() {
  var hierarchy = d3.layout.hierarchy().sort(null),
      size = [1, 1],
      gapper = d3_layout_balloonGap;

  function balloon(d, i) {
    var Pi = Math.PI;
        TwoPi = 2 * Pi,
        Orientation = Pi,
        scaleF = 1, // scaling factor in between the two walks
        nodes = hierarchy.call(this, d, i),
        root = nodes[0];

    function firstWalk(node) {
      var children = node.children,
          layout = node._balloon,
          gap = node.parent ? gapper(node) : 0; // compute gap (0 if root)

      if (children && (n = children.length)) {
        // stuff that inner nodes need to do
        
        var n,
            child,
            childLayout,
            i;

        // walk the tree recursively
        i = -1;
        while (++i < n) firstWalk(children[i]);

        // at this stage all children have their 
        // inner and outer x, y and r values calculated

        // compute the max child radius and the sum of child radii
        var childOutR,
            maxChildOutR = 0,
            sumOfChildOutRs = 0;
        i = -1;
        while (++i < n) {
          childOutR = children[i]._balloon.outR;
          maxChildOutR = Math.max(childOutR, maxChildOutR);
          sumOfChildOutRs += childOutR;
        }

        // determine the circle's inner radius
        var inR;
        if (sumOfChildOutRs < Pi * maxChildOutR) {
          // case 2
          inR = maxChildOutR + (maxChildOutR/Pi);
        } else {
          // case 1
          inR = (sumOfChildOutRs / Pi) + maxChildOutR;
        }
        
        var inC, 
            gapAngle;
        inC = (TwoPi * inR) + gap; // extend circumference by gap
        inR = inC / TwoPi; // recalculate radius
        gapAngle = gap/inR; // calculate gap's arc angle

        // loop through children again, calculating their halfsectors
        // using the now calculated innerR
        var childAlpha, 
            sumOfAlphas = 0;
        i = -1;
        while (++i < n) { 
          childLayout = children[i]._balloon;
          childAlpha = Math.atan(childLayout.outR/inR);
          childLayout.alpha = childAlpha; 
          sumOfAlphas += childAlpha; 
        }

        var freeArc = (2 * (Pi - sumOfAlphas - gapAngle)) / n;

        // loop through children again, calculating their positions
        // and adjusting the bounding box
        var theta = gapAngle - (freeArc / 2),
            lastAlpha = 0,
            x = 0, y = 0,
            xMin = Infinity, yMin = Infinity,
            xMax = -Infinity, yMax = -Infinity;
        i = -1;
        while (++i < n) { 
          childLayout = children[i]._balloon;
          childAlpha = childLayout.alpha;
          theta += lastAlpha + childAlpha + freeArc;
          childLayout.relX = x = inR * Math.cos(theta);
          childLayout.relY = y = inR * Math.sin(theta);
          childLayout.theta = theta;
          lastAlpha = childAlpha;

          // adjust bounding box
          childOutR = childLayout.outR;
          xMin = Math.min(x - childOutR, xMin);
          yMin = Math.min(y - childOutR, yMin);
          xMax = Math.max(x + childOutR, xMax);
          yMax = Math.max(y + childOutR, yMax);
        }

        // calculate outer circle center
        var outX = (xMin + xMax) / 2;
        var outY = (yMin + yMax) / 2;

        // loop through children (again), adjust outer radius
        var outR = 0,
            dX, dY;
        i = -1;
        while (++i < n) { 
          childLayout = children[i]._balloon;
          childOutR = childLayout.outR;
          childLayout.relX = dX = childLayout.relX - outX; 
          childLayout.relY = dY = childLayout.relY - outY; 
          outR = Math.max(
              Math.sqrt((dX * dX) + (dY * dY)) + childOutR, outR);
        }

        // assign calculated layout stuff for next walk
        layout.inR = inR;
        layout.outR = outR;
        layout.outX = outX;
        layout.outY = outY;
      } else {
        // stuff that leaf nodes need to do
        layout.outR = node.value || 10;
      }
    }

    function secondWalk(node, offX, offY, theta) {
      var children = node.children,
          layout = node._balloon,
          centerX, centerY,
          sinTheta = Math.sin(theta),
          cosTheta = Math.cos(theta),
          x, y, _x, _y;

      // set radius
     // if (!node.children)
     //     node.r =16;
     // else  
        node.r = layout.outR * scaleF;
        if (node.r<1) node.r=1;

      // transform the outer circle center and
      // set center coords to the outer circle's center
      _x = layout.relX * scaleF;
      _y = layout.relY * scaleF;
      x = (_x * cosTheta) - (_y * sinTheta);
      y = (_x * sinTheta) + (_y * cosTheta);
      node.x = centerX = x + offX;
      node.y = centerY = y + offY;


      // transform the inner circle center and
      // set link coords to the inner circle's center
      theta += layout.theta + Orientation;
      sinTheta = Math.sin(theta);
      cosTheta = Math.cos(theta);
      _x = -layout.outX * scaleF; 
      _y = -layout.outY * scaleF;
      x = (_x * cosTheta) - (_y * sinTheta);
      y = (_x * sinTheta) + (_y * cosTheta);
      node.lx = centerX + x;
      node.ly = centerY + y;

      if (children && (n = children.length)) {
        // inner node stuff
        var n,
            i;

        // walk the tree recursively, 
        // translating and rotating child nodes
        i = -1;
        while (++i < n) secondWalk(children[i], centerX, centerY, theta);
      }
      
// Tuan code **********************
      if (node.parent){
     //   node.x += (node.parent.x - node.x)*0.1
     //   node.y += (node.parent.y - node.y)*0.1
      }
    }

    // Initialize temporary layout variables
    d3_layout_treeVisitAfter(root, function(node) {
      node._balloon = {
        inR: 0,
        outR: 0,
        outX: 0,
        outY: 0,
        relX: 0,
        relY: 0,
        theta: 0
      };
    });

    // Compute the layout
    
    firstWalk(root, 0);

    // calculate scaling factor
    scaleF = Math.min(size[0], size[1]) / (root._balloon.outR * 2); 

    secondWalk(root, 0, 0, 0);

    // Clear temporary layout variables
    d3_layout_treeVisitAfter(root, function(node) {
      delete node._balloon;
    });

    return nodes;
  }

  balloon.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return balloon;
  };

  balloon.gap = function(x) {
    if (!arguments.length) return gapper;
    gapper = d3.functor(x);
    return balloon;
  };

  return d3_layout_hierarchyRebind(balloon, hierarchy);
};

function d3_layout_balloonGap(d) {
  return 0;
}
