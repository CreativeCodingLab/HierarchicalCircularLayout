var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;

var queryH, queryW;
var minSat = 50;
var maxSat = 230;
  
var seed1 = 1111;
function random() {
    var x = Math.sin(seed1++) * 1000;
    return Math.floor((x-Math.floor(x))*1000);
}

var nodes = [];
var links = [];
var maxDepth=0, numLeaf=0;

var qnodes, qlinkTree, qroot, qmaxDepth=1;
var qlinks =[];
var showSubtree;


  // Add color legend
 var listSelected1 = {}
 var listSelected2 = {}
 var listSelected3 = {}
  
  /*
// RAF
  //listSelected1["flare.ERK activation.ERK2 activation"] = 1;
  //listSelected2["flare.MEK activation.RAF phosphorylates MEK"] = 1;
  listSelected3["flare.MEK activation"] = 1;


  // Ativation of Pro-Caspase 8 
  //listSelected1["flare.Apoptotic factor-mediated response.SMAC-mediated apoptotic response.SMAC-mediated dissociation of IAP:caspase complexes"] = 1;;
  //listSelected2["flare.Release of apoptotic factors from the mitochondria"] = 1;
  listSelected3["flare.Apoptotic factor-mediated response.Cytochrome c-mediated apoptotic response.Formation of apoptosome"]=1;
  
  //ERBB2
  //listSelected1["flare.PI3K events in ERBB2 signaling.PIP3 activates AKT signaling"] = 1;
  //listSelected2["flare.SHC1 events in ERBB2 signaling.RAF/MAP kinase cascade.ERK activation.ERK1 activation"] = 1;
  listSelected3["flare.GRB2 events in ERBB2 signaling"] = 1;
  
  // GPCR
  //listSelected1["Signaling by GPCR.Opioid Signalling.G-protein mediated events.PLC beta mediated events.Ca-dependent events.CaM pathway"] = 1;
  //listSelected2["Signaling by GPCR.GPCR downstream signaling.G alpha (q) signalling events.Effects of PIP2 hydrolysis"] = 1;
  //listSelected1["flare.Signaling by GPCR.Opioid Signalling.G-protein mediated events.PLC beta mediated events.Ca-dependent events.CaM pathway"] = 1;;
  //listSelected2["flare.Signaling by GPCR.GPCR downstream signaling.G alpha (q) signalling events.Effects of PIP2 hydrolysis"] = 1;
  listSelected3["Signaling by GPCR.GPCR downstream signaling.G alpha (q) signalling events"] = 1;
  
  // Flare
  //listSelected1["flare.query.methods"] = 1;
  //listSelected2["flare.vis.operator.layout"] = 1;
  listSelected3["flare.vis.operator.layout"] = 1;
  
  
  // Carnivora
  //listSelected1["carnivora.0.0.0.0.0.0.0.0.0.0.0"] = 1;
  //listSelected2["carnivora.0.0.0.1.0.0.0"] = 1;
  listSelected3["carnivora.0.0.0.0.0.0.1.0.0"] = 1;*/
  

function drawColorLegend() {
      var xx = width-100;
      var y1 = 5;
      var y2 = 18;
      var rr = 5;

      svg.append("line")
        .attr("class", "nodeLegend")
        .attr("x1", xx-20)
        .attr("y1", y1)
        .attr("x2", xx)
        .attr("y2", y1)
        .style("stroke", "#880088");

      svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y1)
        .attr("r", rr)
        .style("fill", "#880088");
      
      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y1+1)
        .text("Source node")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .style("text-anchor", "left")
        .style("fill", "#880088");
   
      svg.append("line")
        .attr("class", "nodeLegend")
        .attr("x1", xx-20)
        .attr("y1", y2)
        .attr("x2", xx)
        .attr("y2", y2)
        .style("stroke", "#008800");
          
      svg.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", width-100)
        .attr("cy", y2)
        .attr("r", rr)
        .style("fill", "#008800");  

      svg.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y2+1)
        .text("Target node")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .style("text-anchor", "left")
        .style("fill", "#008800");  
}

function removeColorLegend() {
 svg.selectAll(".nodeLegend").remove();
}

function color(d) {
  //console.log(d.name+" "+d.depth+" maxDepth="+maxDepth);
  var step = (maxSat-minSat)/maxDepth;
  var sat = Math.round(maxSat-d.depth*step);
  
  if (showSubtree && d.name.indexOf("query tree")>-1){
   return d.children ? "rgb("+sat+", "+maxSat+", "+sat+")" // expanded package
    : "#8383BB"; 
  }
  else if (d.name.indexOf("found subtree by scanning")>-1){
    return d.children ? "rgb("+maxSat+", "+0+", "+0+")" // expanded package
    : "#8383BB"; 
  }    
  else if (listSelected1[d.name])
    return "#77ff77";
  else if (listSelected2[d.name])
    return "#ffff66";
  else if (listSelected3[d.name])
    return "#ffaaff";
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    // : "#77f"; // leaf node
    : "#8383BB";
}

function colorQ(d) {
  var step = (maxSat-minSat)/qmaxDepth;
  var sat = Math.round(maxSat-d.depth*step);
  

  if (showSubtree && (d.name.indexOf("bbb ")>-1 || d.name.indexOf("ccc ")>-1)){
   return "#f00"; 
  }
  else if (d.name.indexOf("ddd ")>-1){
   return "#ff0"; 
  }
  else if (d.name.indexOf("eee ")>-1){
   return "#0f0"; 
  }
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    // : "#66b"; // leaf node
    : "#8383BB";
}

function colorFaded(d) {
  var step = (maxSat-minSat)/maxDepth;
  var sat = Math.round(maxSat-d.depth*step);
 
  //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth+" step="+step);
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    : "#aaaacc"; // leaf node
}


function getBranchingAngle1(radius3, numChild) {
  if (numChild<=2){
    return Math.pow(radius3,2);
  }  
  else
    return Math.pow(radius3,0.9);
 } 



function generateRandomTree(treeHeight,degree) {
    root = {};
    root.name = "root";
    root.depth = 0;
    root.children = createChildren(root.depth);
    nodes.push(root);
    

    function createChildren(depth) {
      var children = [];
      var rand =random()%degree+1;
      var numSubtree =0;
      for (var i=0; i<rand; i++){
        var node1 = {};
        node1.name = ""+seed1;
        node1.depth = depth+1;
        var rand2 =random()%degree;
        //console.log("rand2="+rand2+"  "+node1.depth+" treeHeight="+treeHeight);
        var rand3 =random()%4;
        if (((rand2<degree/2 && node1.depth<treeHeight-rand3)
            || (node1.depth<treeHeight-rand3 && i>=rand-1 && numSubtree<1)) && numSubtree<(degree)/2){
        //  if (node1.depth<treeHeight ){
        
          node1.children = createChildren(node1.depth);
          numSubtree++;
        }


        children.push(node1);
        nodes.push(node1);
      }
       
      return children;
    }  
  }

function swapBranches(hasSubtree) {
  var b =  random()%qnodes.length;
  while (qnodes[b].depth>=3 || qnodes[b].depth<1 || !qnodes[b].children){
    b =  random()%qnodes.length;
  }


  var c =  random()%qnodes.length;   
  while (qnodes[c].depth>=3 || qnodes[c].depth<1 || !qnodes[c].children || 
    getFirstLevelParent(qnodes[b])==getFirstLevelParent(qnodes[c])
    || qnodes[b].parent== qnodes[c].parent){
    c =  random()%qnodes.length;
  }

  function getFirstLevelParent(n1){
    if (n1.depth==0){
      return undefined;
    }
    else if (n1.depth==1){
      return n1;
    }
    else {
      return getFirstLevelParent(n1.parent);
    }  
  }

  function getChildIndex(n1){
    var index =-1;
    for (var i=0; i<n1.parent.children.length;i++){
      if (n1.parent.children[i]==n1)
        index = i;
    }
    return index;
  }
  
  var parentB = qnodes[b].parent;
  var parentC = qnodes[c].parent;
  var indexB = getChildIndex(qnodes[b]);
  var indexC = getChildIndex(qnodes[c]);
  
  parentB.children.splice(indexB,1);
  parentC.children.push(qnodes[b]);
  qnodes[b].parent = parentC;
  
  parentC.children.splice(indexC,1);
  parentB.children.push(qnodes[c]);  
  qnodes[c].parent = parentB;
  

  var leafNodes = qnodes.filter(function(d){
    if (!d.children)
      return d
  });
  
 // if show subtree or connectivity
  var d =  random()%leafNodes.length;
  var e =  -1;
  if (hasSubtree){
    var maxConnected = 0;
    for (var i=0; i<leafNodes.length;i++){
      var connectedNames = getConnectedList(i);
      if (connectedNames.count>maxConnected){
        maxConnected = connectedNames.count;
      }   
    }

    var minConnect;
    if (maxConnected<3)
      minConnect = maxConnected;
    else
      minConnect =3;

    while (getConnectedList(d).count<minConnect){
      d =  random()%leafNodes.length;
    }

   // console.log(maxConnected+" "+minConnect+" getConnectedList(d).count="+getConnectedList(d).count);
    var connectedList = getConnectedList(d);
    function getConnectedList(n1){
      var list = {};
      list.count = 0;
      for (var i=0; i<leafNodes[n1].imports.length;i++){
        if (!list[leafNodes[n1].imports[i]]){
          list[leafNodes[n1].imports[i]] = 1;   
          list.count++;
        }
      }
      for (var i=0; i<leafNodes.length;i++){
        for (var j=0; j<leafNodes[i].imports.length;j++){
          if (leafNodes[i].imports[j] == leafNodes[n1].name && !list[leafNodes[i].name]){
            list.count++;
            list[leafNodes[i].name] = 1;   
          }
            
        }
      }
      return list;
    }  

   
    var farDis = 0;
    var farId = -1;
    for (var i=0; i<leafNodes.length;i++){
      if (connectedList[leafNodes[i].name]){
        var numHops = d3_layout_numberOfHops(leafNodes[d], leafNodes[i])
        if (numHops>farDis){
          farDis = numHops;
          farId = i;
        }
        e = farId;
      }   
    }
  }
  else{
    d = random()%leafNodes.length;
    e = random()%leafNodes.length;
    
    while (d==e || isConnected(d,e) || leafNodes[d].imports.length<1 || leafNodes[e].imports.length<1
      || leafNodes[d].imports.length>3 || leafNodes[e].imports.length>3){   
       d = random()%leafNodes.length;
       e = random()%leafNodes.length;
    }
    
    function isConnected(n1, n2){
      var connectedNames = {};
      for (var i=0; i<leafNodes[n1].imports.length;i++){
        connectedNames[leafNodes[n1].imports[i]] = 1;   
      }
      if (connectedNames[leafNodes[n2].name])
          return true;

      connectedNames = {};
      for (var i=0; i<leafNodes[n2].imports.length;i++){
        connectedNames[leafNodes[n2].imports[i]] = 1;   
      }
      if (connectedNames[leafNodes[n1].name])
          return true;  
      return false;  
    }              
  }  

  qnodes[b].name = "bbb "+qnodes[b].name;
  qnodes[c].name = "ccc "+qnodes[c].name;
  leafNodes[d].name = "ddd "+leafNodes[d].name;
  leafNodes[e].name = "eee "+leafNodes[e].name;

  function d3_layout_bundleAncestors(node) {
    var ancestors = [],
        parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }

  function d3_layout_numberOfHops(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a),
        bNodes = d3_layout_bundleAncestors(b),
        aNode = aNodes.pop(),
        bNode = bNodes.pop(),
        sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    //return sharedNode;
    return aNodes.length+bNodes.length+1;
  }

  var numberOfHops = d3_layout_numberOfHops(leafNodes[d], leafNodes[e]);  
  window.numberOfHops = numberOfHops;
  return numberOfHops;
}


/// Make a subttree for Study 1
function makeSubtree() {
  var a =  random()%nodes.length;
  //var dif = maxDepth-qmaxDepth;
  //if (dif<2)
  //  dif = 2;
  while (nodes[a].depth>=3 || nodes[a].depth<0){
    a =  random()%nodes.length;
  }
  
  if (!nodes[a].children)
    nodes[a].children = [];
  nodes[a].childCount1++;
  var node2 = copyNode(qroot,nodes[a].depth, "query tree");
  
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
  // Testing the existence of another tree generated by radomization
  /*
  var a2 =  random()%nodes.length;
  if (!nodes[a2].children)
    nodes[a2].children = [];
  nodes[a2].childCount1++;
  var node3 = copyNode(qroot,nodes[a2].depth, "test tree");
  nodes[a2].children.push(node3);*/

  // count leaf nodes of randomized tree

  function countLeafnodes(n) {
    if(n.children){
      var count = 0;
      n.children.forEach(function(d) {
        count += countLeafnodes(d);
      });
      return count;
    }
    else
      return 1;
  };
  window.numberOfLeafNodes = countLeafnodes(root);
  console.log("NumLeafs ="+window.numberOfLeafNodes);
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

function childDepth1(n) {
    if(n.children && n.children.length > 0) {
      n.maxDepth = 0;
      n.children.forEach(function(d) {
        var childrenDeep = childDepth1(d);
        if (childrenDeep>n.maxDepth)
          n.maxDepth = childrenDeep;
      });
    }
    else{
       n.maxDepth = n.depth;
    }
    return n.maxDepth;
};



function childCount2(level, n) {
    var arr = [];
    if(n.children && n.children.length > 0) {
      n.children.forEach(function(d) {
        arr.push(d);
      });
    }
    arr.sort(function(a,b) { return (a.maxDepth*100+a.childCount1) - (b.maxDepth*100+b.childCount1) } );
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

}


// Toggle children on click.
function click(d) {

}

