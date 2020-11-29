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
  geoData: Topology;
  width?: number;
  height?: number;
  id?: string;
  // data: File;
  // dataGetter: Function;
  onclick?: (evént: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onenter?: (evént: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onleave?: (evént: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
}
// TODO rethink state
interface IState {
  dataGetter?: Function;
}
// TODO add documentation
export class Map extends Component<IProps, IState> {
  counties: ReactNode[];
  statesBorder: ReactNode;
  svgRef: RefObject<any>;
  z: ZoomBehavior<Element, unknown>;

  constructor(props: IProps) {
    super(props);
    this.state = {};

    const {
      geoData,
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

    // *** create stateborders ***
    const Dstates = geoData.objects.states as GeometryObject<{}>;
    let DstatesBorder = path(
      mesh(geoData, Dstates, function (a, b) {
        return a !== b;
      })
    );
    if (!DstatesBorder) {
      DstatesBorder = "";
    }
    this.statesBorder = <path key="statesborder" d={DstatesBorder} />;

    // *** create counties ***
    const Dcounties = feature(geoData, geoData.objects.counties);
    if (isFeatureCollection(Dcounties)) {
      this.counties = map(Dcounties.features, (d, i) => {
        let p = path(d);
        // path must be string not undefined
        if (!p) {
          p = "";
        }

        let key = "";
        if (d.properties && d.properties.name) {
          key = d.properties.name;
          if (d.properties.districtType) {
            key = `${d.properties.districtType}_${key}`;
          }
        } else {
          key = `countie-${i}`; // TODO find dynamic way
        }

        return (
          <path
            id={key}
            key={key}
            className="counties"
            d={p}
            onClick={onclick}
            onMouseEnter={onenter}
            onMouseLeave={onleave}
          />
        );
      });
    } else throw new Error("Not a FeatureColletion");

    // *** apply zoom ***
    // TODO adjust constrain from zoom
    // TODO keep stroke-width unzoomed
    this.z = zoom()
      .scaleExtent([0.75, 10])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => this.zoomed.bind(this)(event));
  }

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
          <g id="counties">{this.counties}</g>
          <g id="states-border">{this.statesBorder}</g>
        </g>
      </svg>
    );
  }
}
