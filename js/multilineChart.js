class multilineChart {
  constructor(opts = {}) {
    this.selector = opts.selector ? opts.selector : '#multilineChart';
    this.margin = opts.margin ? opts.margin : { top: 40, bottom: 30, left: 50, right: 100 };
    this.xAxisFormat = opts.xAxisFormat ? opts.xAxisFormat : "%d";
    this.file = opts.file;
    this.data = null;
    this.mouseOverTimeout = null;
    this.countries = [];
    this.selectedColumns = ['Corée du Sud', 'Etats-Unis',
     'France', 'Italie', 'Royaume-Uni',
     'Suisse'];

    var container = d3.select(this.selector).node();
    if(!container){
      console.error('Error: element ' + this.selector + ' not found');
    }else{
      this.width = parseInt(d3.select(this.selector).style("width")) - this.margin.left - this.margin.right;
      this.height = 400 - this.margin.top - this.margin.bottom;

      var svg = d3
        .select("#chartDayOffset")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);

      this.g = svg.append("g").attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    }
    this.createScales();
    this.fetch();
  }

  fetch(){
    var theChart = this;
    d3.csv(this.file).then( function(data) {
      theChart.data = data;
      data.forEach(function(d) {
        d.country_day = +d.country_day;
      });

      theChart.countries = data.columns.slice(1).map(function(id) {
          return {
            id: id,
            values: data.map(function(d) {
              return {day: d.country_day, value: parseFloat(d[id])};
            })
          };
        });
      theChart.draw();
    });
  }

  addLine(){

  }

  createScales(){
    // Global variable for all data
    let data;
    var countries;

    // Scales setup
    this.xscale = d3.scaleLinear().range([0, this.width]);
    this.yscale = d3.scaleLinear().range([this.height, 0]);
    this.zscale = d3.scaleOrdinal(d3.schemeCategory10);

    // Axis setup
    this.xaxis = d3.axisBottom().scale(this.xscale);
    this.g_xaxis = this.g.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")");
    this.yaxis = d3.axisLeft().scale(this.yscale).tickFormat( d3.format("d") );
    this.g_yaxis = this.g.append("g").attr("class", "y axis");
  }

  draw() {
    //update the scales
    this.xscale.domain(d3.extent(this.data, function(d) { return d.country_day; })).nice();

    this.yscale.domain([
      d3.min(this.countries, function(c) { return d3.min(c.values, function(d) { return d.value; }); }),
      d3.max(this.countries, function(c) { return d3.max(c.values, function(d) { return d.value; }); })
    ]).nice();

    this.zscale.domain(this.countries.map(function(c) { return c.id; }));

    //render the axis
    this.g_xaxis.transition().call(this.xaxis);
    this.g_yaxis.transition().call(this.yaxis);

    // Render the chart

    /* ------------------------- ------------------------- ------------------------- ------------------------- */

    var theChart = this;

    var lineStatic = d3.line()
        .defined(function(d){ return !isNaN(d.value); })
        .curve(d3.curveBasis)
        .x(function(d) { return theChart.xscale(d.day); })
        .y(function(d) { return theChart.yscale(d.value); });

    var country = this.g.selectAll(".city")
      .data(this.countries)
      .enter().append("g")
      .attr("class", function(d){ return "country " + d.id});

    country.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return lineStatic(d.values.filter(function(d){ return d.value != 0;}) ); })
      .style("stroke", function(d) { return theChart.zscale(d.id); });

    country.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.filter(function(d){ return !isNaN(d.value);}).length - 1]}; })
        .attr("transform", function(d) { return "translate(" + theChart.xscale(d.value.day) + "," + theChart.yscale(d.value.value) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .attr("class", "country-label")
        .text(function(d) { return d.id; });

    this.addFatLine();

    /* ------------------------- ------------------------- ------------------------- ------------------------- */


           /*new ScrollMagic.Scene({triggerElement: "#chartDayOffset", duration: 300})
             // .setClassToggle("#animatedBarChart", "bounce")
             .addTo(controller)
             .on("enter", function(){
               addSwitzerland();
             });*/
  }

  addFatLine(){
    var theChart = this;

    var fatLine = d3.line()
      .defined(function(d){ return d.Suisse !== ''; })
      .curve(d3.curveBasis)
      .x(function(d) { return theChart.xscale(d.country_day); })
      .y(function(d) { return theChart.yscale(d.Suisse); });

    var path = this.g.append("path")
        .attr("d", fatLine( this.data.filter(function(d){ return d.Suisse != 0;})) )
        .attr("stroke", "#b80021")
        .attr("stroke-width", "4")
        .attr("fill", "none");

      var totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
          .duration(4000)
          .ease(d3.easeCubic)
          .attr("stroke-dashoffset", 1);
      }


}