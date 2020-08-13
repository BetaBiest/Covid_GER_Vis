/**
 * function map()
 * @param {Number} n Value
 * @param {Number} start1 source floor
 * @param {Number} stop1 source ceiling
 * @param {Number} start2 target floor
 * @param {Number} stop2 target ceiling
 * @returns {Number} Value between new boundaries
 */
function map(n, start1, stop1, start2, stop2) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  return newval;
}

const dataRequest = d3.dsv(',', "https://static.dwcdn.net/data/0yd2t.csv?v=1597046520000", function(d) {
  return {
      lk: d.Landkreis
  };
})

async function script() {
  const svg = d3.select(document.querySelector('#map').getSVGDocument().querySelector('svg'))
  const kreise = svg.select('#Kreise')
  const data = await dataRequest;
  for (let i of data) {
    i.lk = i.lk.replace(/ /g, "_");
    i.value = Math.floor(map(Math.random(), 0, 1, 0, 255));
  }

  var kreise_list = kreise.selectAll('g > [id]').data(data, function(d) {
    return d ? d.lk : this.id;
  });

  for (let item of kreise_list._groups[0]) {
    if (item) {
        if (item.nodeName === "g") {
          for (let ite of item.children) {
            ite.style.fill = item.__data__ ? `rgb(20,${item.__data__.value},20)` : `rgb(200,0,0)`;
          }
        } else {
          item.style.fill = item.__data__ ? `rgb(20,${item.__data__.value},20)` : `rgb(200,0,0)`;
        }
    }
  }

}