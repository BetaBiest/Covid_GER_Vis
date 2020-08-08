function script() {
  const svg_temp = document.querySelector('#map').getSVGDocument().querySelector('svg');
  const svg = d3.select(svg_temp);
  const width = svg.attr('width');
  const height = svg.attr('height');

  const states = svg.selectAll('#Bundesländer');
  const slider = d3.select('#slider');
  const label = d3.select('#slider-label');
  
  const formatTime = d3.timeFormat("%d %b");
  
  function setup(data) {
    const dateRange = d3.extent(data, d => d.date);
    const numOfDays = (dateRange[1] - dateRange[0]) / 86400000;

    slider
      .attr('min', 0)
      .attr('max', numOfDays - 1)
      .attr('value', 0)
      .attr('step', 1)
      .on('input', function getResDate() {
        var day = new Date(dateRange[0].getTime() + this.value * 86400000);
        
        label
          .datum(day)
          .text(formatTime(day));
        states.selectAll('path')
          .style('fill', (d, i) => {
            var obj = d.values.find(x => x.date >= day);
            var index = d.values.indexOf(obj);
            return colorScale(d.values[index].cases);
          })
      });

    const nestedData = d3.nest()
      .key(d => d.state)
      .entries(data);

    const max = 60000;



    // *** Colorlegend ***
    const numOfColors = 9;
    const colors = d3['schemeReds'][numOfColors];

    const colorScale = d3.scaleQuantize()
      .domain([0, max])
      .range(colors);
    
    const stepSize = Math.floor(max / numOfColors);
    const clObjects = [];
    for (let i = 0; i < numOfColors; i++) {
      let o = {};
      o.value = i*stepSize;
      o.color = colors[i];
      clObjects.push(o);
    }

    const cl = svg.append('g')
      .attr('id', 'Colorlegend')
      .attr('transform', `translate(${width - 80}, ${height - 410})`);
    const ticks = cl.selectAll('g').data(clObjects).enter()
      .append('g')
      .classed('tick', true)
      .attr('transform', (d, i) => `translate(${0}, ${i*20})`);
    ticks.append('rect')
      .attr('width', 20).attr('height', 20)
      .attr('fill', d => d.color);
    ticks.append('text')
      .text(d => `> ${d.value}`)
      .attr('x', 24)
      .attr('y', 16);


    
    // *** Append data and set initial color ***
    states.selectAll('path')
      .data(nestedData, function(d) { return d ? d.key : this.id })
      .style('fill', (d, i) => {
        return colorScale(d.values[d.values.length - 1].cases);
      });
  }
  
  function changeDay() {
  
  }

  d3.csv("rki_slim_cum.csv", function(d) {
    return {
      date: new Date(+d.Refdatum),
      state: d.Bundesland,
      cases: +d.AnzahlFall,
      deaths: +d.AnzahlTodesfall,
      recovered: +d.AnzahlGenesen
    };
  }).then(data => {
    setup(data);
  })
}