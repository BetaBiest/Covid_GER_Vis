// ------ Global Values ------
const width = 600,
  height = 800;

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



function drawMap(geoData) {

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
      })
      .style('fill', d => {
        if (d.properties.data)
        return d.properties.data.cases > 200 ? `rgb(200,0,0)` : `rgb(0,200,0)`;
        else return `rgb(60,60,200)`;
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


// #####################################

async function script() {
  const geoDataR = d3.json("https://raw.githubusercontent.com/AliceWi/TopoJSON-Germany/master/germany.json");
  const data = await d3.csv("data/frameByLK.csv", function(d) {
    return {
      lk: d.Landkreis.replace(/ /g, "_"),
      lkId: +d.IdLandkreis,
      cases: +d.AnzahlFall,
      deaths: +d.AnzahlTodesfall,
      recovered: +d.AnzahlGenesen
    }
  });
  const geoData = await geoDataR;
  
  
  // Replace Berlin with subdivisions
  let berlin = geoData.objects.counties.geometries.find(geometrie => { return geometrie.properties.name === "Berlin" });
  let i_berlin = geoData.objects.counties.geometries.indexOf(berlin);
  geoData.objects.counties.geometries.splice(i_berlin, 1);
  for (let i = geoData.objects.berlin.geometries.length; i; --i) {
    geoData.objects.counties.geometries[geoData.objects.counties.geometries.push(geoData.objects.berlin.geometries.pop()) - 1].properties.districtType = "Stadtkreis";
  }
  
  // Accommodating for "old" map
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
  

  // Merge data into geoData
  for (let feature of geoData.objects.counties.geometries) {
    let dT = feature.properties.districtType;
    let prefix = "";
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
    
    let index = data.indexOf(data.find(d => { return d.lkId == feature.id; }));
    if (0 <= index) feature.properties.data = data.splice(index, 1)[0];
  }
  console.log(geoData);
  console.log("Data that is not used (probably for blue marked): ", data);
  drawMap(geoData);
}



script();