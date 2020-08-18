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


// ------ Script ------
function fillData(data) {
  console.log(data);
  var districtList = svg.selectAll('#districts > *')
    .data(data, function(d) {
      debugger;
      return this.id;
    });
  
  debugger;
}

function drawMap(geoData) {
  console.log(geoData);

  const exceptions = [
    {
      o: "Städteregion Aachen",
      n: "Stadtregion Aachen"
    },
    {
      o: "Region Hannover",
      n: "Region Hannover"
    }
  ]

  const states = topojson.feature(geoData, geoData.objects.states).features;
  const districts = topojson.feature(geoData, geoData.objects.counties).features;

  svg.append('g').attr('id', 'districts')
    .selectAll('.district').data(districts)
      .enter().append('path')
      .attr('id', d => d.properties.name)
      .attr('class', 'district')
      .attr('d', d => path(d)).on('mouseover', function() {
        let p = this.parentElement;
        p.removeChild(this);
        p.appendChild(this);
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
      cases: +d.AnzahlFall,
      deaths: +d.AnzahlTodesfall,
      recovered: +d.AnzahlGenesen
    }
  });
  const geoData = await geoDataR;
  for (let feature of geoData.objects.counties.geometries) {
    // Rename geoData propertie name to match data
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
    feature.properties.name = prefix + feature.properties.name.replace(/ /g, "_");

    let index = data.indexOf(data.find(d => { return d.lk === feature.properties.name; }));
    if (0 <= index) feature.properties.data = data.splice(index, 1)[0];
  }
  console.log(geoData);
  console.log("Data that is not used (probably for blue marked): ", data);
  drawMap(geoData);
}



script();