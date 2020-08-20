// ------ Global Values ------
const width = 600,
  height = 800;

const slider = d3.select('#slider');
const slider_label = d3.select('#slider-label');

const formatTime = d3.timeFormat("%d %b");

const svg = d3.select('#container').append('svg')
  .attr('version', '2.0')
  .attr('xmlns', "ttp://www.w3.org/2000/svg")
  .attr('width', width)
  .attr('height', height);

const projection = d3.geoMercator()
  .center([10.5, 51.25])
  .scale(3400)
  .translate([width/2, height/2]);

const path = d3.geoPath()
  .projection(projection);

const tooltip = d3.select('#tooltip');



// #####################################

async function script() {
  const geoDataR = d3.json("https://raw.githubusercontent.com/AliceWi/TopoJSON-Germany/master/germany.json");
  const popDataR = d3.dsv(";", "data/de_einwohnerzahlen_kreise_12411-0015_slim.csv", function(d) {
    return {
      lkId: d.lkId,
      population: +d.population
    }
  });
  const data = await d3.csv("data/timeFrameByLK.csv", function(d) {
    return {
      lkId: d.IdLandkreis,
      date: new Date(+d.Refdatum),
      cases: +d.AnzahlFall,
      deaths: +d.AnzahlTodesfall,
      recovered: +d.AnzahlGenesen,
      acute: +d.acute
    }
  });
  const nestedData = d3.nest()
    .key(d => d.lkId)
    .entries(data);
  nestedData.forEach(element => {
    if (element.key.length === 4) element.key = "0" + element.key.length;
  });
  const geoData = await geoDataR;
  
  // *** Replace Berlin with subdivisions ***
  let berlin = geoData.objects.counties.geometries.find(geometrie => { return geometrie.properties.name === "Berlin" });
  let i_berlin = geoData.objects.counties.geometries.indexOf(berlin);
  geoData.objects.counties.geometries.splice(i_berlin, 1);
  for (let i = geoData.objects.berlin.geometries.length; i; --i) {
    let subdevision = geoData.objects.berlin.geometries.pop();
    let index = geoData.objects.counties.geometries.push(subdevision) - 1
    geoData.objects.counties.geometries[index].properties.districtType = "Stadtkreis";
  }
  delete geoData.objects.berlin;
  
  // *** Accommodating for "old" map ***
    // Merging LK_Göttingen
  let obj_to_merge = geoData.objects.counties.geometries.filter(g => {
    return g.id == 3152 || g.id == 3156;
  })
  for (let item of obj_to_merge) {
    geoData.objects.counties.geometries.splice(geoData.objects.counties.geometries.indexOf(item), 1);
  }
  let merged_obj = topojson.mergeArcs(geoData, obj_to_merge);
  merged_obj.properties = obj_to_merge[0].properties;
  merged_obj.id = 3159;
  geoData.objects.counties.geometries.push(merged_obj);
  

  // *** Merge data into geoData ***
  const popData = await popDataR;
  for (let feature of geoData.objects.counties.geometries) {
    let prefix = "";
    let dT = feature.properties.districtType;
    if (dT === "Stadtkreis" || dT ==="Kreisfreie Stadt") {
      prefix = "SK_";
    } else if (dT === "Landkreis" || dT === "Kreis") {
      prefix = "LK_";
    } else {
      console.log({
        0: feature.properties.name,
        1: feature.properties.districtType
      })
    }
    if (prefix) feature.properties.name = prefix + feature.properties.name.replace(/ /g, "_");
    
    let index = nestedData.indexOf(nestedData.find(d => { return d.key == feature.id; }));
    if (0 <= index) feature.properties.data = nestedData.splice(index, 1)[0].values;
    index = popData.indexOf(popData.find(d => { return d.lkId == feature.id }));
    if (0 <= index) feature.properties.population = popData.splice(index, 1)[0].population;
  }

  // *** Color legend ***
  const numOfColors = 9;
  const colors = d3['schemeReds'][numOfColors];
  const colorScale = d3.scaleQuantize()
    .domain([0,1600])
    .range(colors);

  
  // *** Fiting slider ***
  const dateRange = d3.extent(data, d => d.date);
  const numOfDays = (dateRange[1] - dateRange[0]) / 86400000;
  
  slider
    .attr('min', 0)
    .attr('max', numOfDays - 1)
    .attr('value', 0)
    .attr('step', 1)
    .on('input', function getResDate() {
      var day = new Date(dateRange[0].getTime() + this.value * 86400000);
      
      slider_label
        .datum(day)
        .text(formatTime(day));
      
      d3.select('#districts').selectAll('path')
        .style('fill', (d, i) => {
          var obj = d.properties.data.find(x => { return x.date.getTime() >= day.getTime(); });
          if (!obj) obj = d.properties.data[d.properties.data.length - 1];
          var index = d.properties.data.indexOf(obj);
          if (obj.date.getTime() != day.getTime() && index) index--;
          if (!d.properties.data[index]) debugger;
          return colorScale(d.properties.data[index].acute ? d.properties.population / d.properties.data[index].acute : 0);
        })
    });

  // *** Draw Map ***
  const states = topojson.feature(geoData, geoData.objects.states).features;
  const districts = topojson.feature(geoData, geoData.objects.counties).features;

  svg.append('g').attr('id', 'districts')
    .selectAll('.district').data(districts)
      .enter().append('path')
      .attr('id', d => d.properties.name)
      .attr('class', 'district')
      .attr('d', d => path(d))
      .on('mouseover', function() {
        let p = this.parentElement;
        p.removeChild(this);
        p.appendChild(this);
        tooltip
          .text(this.id)
          .style('display', 'block')
          .style('left', `${path.bounds(this.__data__)[1][0]}px`)
          .style('top', `${path.bounds(this.__data__)[1][1]}px`);
      })
      .on('mouseout', function() {
        tooltip
          .style('display', 'none');
      });

  svg.append('g').attr('id', 'states')
    .selectAll('.state').data(states)
      .enter().append('path')
      .attr('id', d => d.properties.name)
      .attr('class', 'state')
      .attr('d', d => path(d))
      .on('mouseover', function() {
        let p = this.parentElement;
        p.removeChild(this);
        p.appendChild(this);
      });
}



script();