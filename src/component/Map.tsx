import { geoMercator, geoPath, map, select, Selection } from "d3";
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
  // onklick: Function;
}
// TODO rethink state
interface IState {
  dataGetter?: Function;
}
export class Map extends Component<IProps, IState> {
  counties: ReactNode[];
  statesBorder: ReactNode;
  DOMRefs: Record<string, RefObject<any>>;
  D3svg: Selection<any, null, null, undefined>;
  z: ZoomBehavior<Element, unknown>;

  constructor(props: IProps) {
    super(props);
    this.state = {};

    const { geoData, width = defaultWidth, height = defaultHeight } = props;

    // *** defining refs ***
    this.DOMRefs = {};
    this.DOMRefs.svg = createRef();
    this.D3svg = select(this.DOMRefs.svg.current);

    // *** create pathprojection ***
    const projection = geoMercator()
      .center([10.5, 51.25])
      .scale(3400)
      .translate([width / 2, height / 2]);
    const path = geoPath().projection(projection);

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

        let key: string = "";
        if (d.properties && d.properties.name) {
          key = d.properties.name;
          if (d.properties.districtType) {
            key = `${d.properties.districtType}_${key}`;
          }
        } else {
          key = `countie-${i}`;
        }

        return <path key={key} className="counties" d={p} />;
      });
    } else throw new Error("Not a FeatureColletion");

    // *** apply zoom ***
    this.z = zoom()
      .scaleExtent([0.75, 10])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => this.zoomed.bind(this)(event));
    // TODO adjust constrain from zoom
  }

  zoomed(event: d3.D3ZoomEvent<Element, any>): void {
    select(this.DOMRefs.svg.current)
      .select(".container")
      .attr("transform", event.transform.toString());
  }

  componentDidMount() {
    select(this.DOMRefs.svg.current).call(this.z);
  }

  componentDidUpdate() {
    select(this.DOMRefs.svg.current).call(this.z);
  }

  render() {
    const { id, width = defaultWidth, height = defaultHeight } = this.props;
    // TODO add datadependencie for color
    return (
      <svg id={id} ref={this.DOMRefs.svg} width={width} height={height}>
        <g className="container">
          <g id="counties">{this.counties}</g>
          <g id="states-border">{this.statesBorder}</g>
        </g>
      </svg>
    );
  }
}
