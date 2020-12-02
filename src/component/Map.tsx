import { geoMercator, geoPath, map, select } from "d3";
import { Component, createRef, ReactNode, RefObject } from "react";
import { feature, mesh } from "topojson";
import { Topology, GeometryObject } from "topojson-specification";
import { zoom, ZoomBehavior } from "d3-zoom";
import { isFeatureCollection } from "../typeguard/isFeatureCollection";

const defaultWidth = 500;
const defaultHeight = 800;

// TODO rethink props
interface IProps {
  /**geoData: sourcdata in format .topojson | type Topology */
  geoData: Topology;
  /**areas?: names of objects to be drawn as areas*/
  areas?: Array<string>;
  /**meshes?: names of objects to be drawn as a mesh*/
  meshes?: Array<string>;
  width?: number;
  height?: number;
  /**id?: of the svg */
  id?: string;
  /**onclick?: callback called when clicked on areas */
  onclick?: (evént: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onenter?: (evént: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onleave?: (evént: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
}
// TODO rethink state
interface IState {
  dataGetter?: Function;
}
/**Map draws paths to given geoData
 * @param {Topology} geoData source to be drawn
 * @param {Array<string>} areas specify names of objects to be drawn as area
 * @param {Array<string>} meshes specify names of objects to be drawn as mesh
 * @param {number} width set width for the map
 * @param {number} height set height for the map
 */
export class Map extends Component<IProps, IState> {
  svgRef: RefObject<any>;
  z: ZoomBehavior<Element, unknown>;
  JSXmeshes: ReactNode[];
  JSXareas: ReactNode[];

  constructor(props: IProps) {
    super(props);
    this.state = {};

    const {
      geoData,
      areas = [],
      meshes = [],
      width = defaultWidth,
      height = defaultHeight,
      onclick = () => {},
      onenter = () => {},
      onleave = () => {},
    } = props;

    // *** defining refs ***
    this.svgRef = createRef();

    // *** create pathprojection ***
    const projection = geoMercator()
      .center([10.5, 51.25])
      .scale(3400)
      .translate([width / 2, height / 2]);
    const path = geoPath().projection(projection);

    // TODO mesh and polygons should be drawn dependet on arguments

    // *** create meshes ***
    this.JSXmeshes = [];
    for (let key of meshes) {
      if (!geoData.objects[key]) {
        throw Error(
          `GeometrieCollection {${key}} does not exist on Topology.objects`
        );
      }
      let p = path(
        mesh(geoData, geoData.objects[key] as GeometryObject<{}>, (a, b) => {
          return a !== b;
        })
      );
      this.JSXmeshes.push(<path key={key} id={key} d={p ? p : ""} />);
    }

    // *** create areas ***
    this.JSXareas = [];
    for (let key of areas) {
      if (!geoData.objects[key]) {
        throw Error(
          `GeometrieCollection {${key}} does not exist on Topology.objects`
        );
      }
      let Dareas = feature(geoData, geoData.objects[key]);
      if (isFeatureCollection(Dareas)) {
        this.JSXareas.push(
          map(Dareas.features, (d, i) => {
            let p = path(d);

            let name = "";
            if (d.properties && d.properties.name) {
              name = d.properties.name;
              if (d.properties.districtType) {
                name = `${d.properties.districtType}_${name}`;
              }
            } else {
              name = `${name}_${i}`;
            }

            return (
              <path
                id={name}
                key={name}
                className={key}
                d={p ? p : ""}
                onClick={onclick}
                onMouseEnter={onenter}
                onMouseLeave={onleave}
              />
            );
          })
        );
      } else throw new Error("Not a FeatureColletion");
    }

    // *** apply zoom ***
    // TODO adjust constrain from zoom
    this.z = zoom()
      .scaleExtent([0.75, 10])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => this.zoomed.bind(this)(event));
  }

  // TODO keep stroke-width unzoomed
  zoomed(event: d3.D3ZoomEvent<Element, any>): void {
    select(this.svgRef.current)
      .select(".container")
      .attr("transform", event.transform.toString());
  }

  componentDidMount() {
    select(this.svgRef.current).call(this.z);
  }

  componentDidUpdate() {
    select(this.svgRef.current).call(this.z);
  }

  render() {
    const { id, width = defaultWidth, height = defaultHeight } = this.props;
    // TODO add datadependencie for color
    return (
      <svg id={id} ref={this.svgRef} width={width} height={height}>
        <g className="container">
          <g id="areas">{this.JSXareas}</g>
          <g id="meshes">{this.JSXmeshes}</g>
        </g>
      </svg>
    );
  }
}
