
//===============================================
var brush;
var slider;
var handle;
var xSlider;


function setupSlider(svg) {
xSlider = d3.scale.linear()
    .domain([1, 20])
    .range([10, 200])
    .clamp(true);

 brush = d3.svg.brush()
    .x(xSlider)
    .extent([0, 0])
    .on("brush", brushed);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + 30 + ")")
    .call(d3.svg.axis()
      .scale(xSlider)
      .ticks(4)
      .orient("bottom")
      .tickFormat(function(d) { return d + "°"; })
      .tickSize(0)
      .tickPadding(10))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

 slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

slider.select(".background")
    .attr("height", height);

 handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + 30 + ")")
    .attr("r", 9);

slider
    .call(brush.event)
  .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([70, 70]))
    .call(brush.event);
}

function brushed() {
  var value = brush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = xSlider.invert(d3.mouse(this)[0]);
    brush.extent([value, value]);
  }
  handle.attr("cx", xSlider(value));
  scaleCircle =value/3;
  //d3.select("body").style("background-color", d3.hsl(value*20, .8, .8));
  setupTree();
  update();
}
