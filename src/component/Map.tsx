import { geoMercator, geoPath, map, select, Selection } from "d3";
import {
  Feature,
  FeatureCollection,
  GeoJsonObject,
  GeoJsonProperties,
  MultiLineString,
} from "geojson";
import { Component, createRef, RefObject } from "react";
import { feature, mesh } from "topojson";
import {
  Topology,
  GeometryObject,
  Objects,
  Point,
} from "topojson-specification";
import { zoom, ZoomBehavior, zoomTransform } from "d3-zoom";
import { Entry } from "webpack";

function isFeatureCollection(value: any): value is FeatureCollection {
  return (value as FeatureCollection).type == "FeatureCollection";
}
// TODO rethink props
interface IProps {
  geoData: Topology;
  width: number; // optional
  height: number; // optional
  id: string;
  // data: File;
  // dataGetter: Function;
  // onklick: Function;
}
// TODO rethink state
interface IState {
  zoomTransform: null;
  dataGetter?: Function;
}
export class Map extends Component<IProps, IState> {
  counties: JSX.Element[];
  statesBorder: JSX.Element;
  DOMRefs: Record<string, RefObject<any>>;
  D3svg: Selection<any, null, null, undefined>;
  z: ZoomBehavior<Element, unknown>;

  static defaultProps: Partial<IProps> = {
    // TODO rather calculate default values
    width: 500,
    height: 800,
    id: "",
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      zoomTransform: null,
    };

    // *** defining refs ***
    this.DOMRefs = {};
    this.DOMRefs.svg = createRef();
    this.D3svg = select(this.DOMRefs.svg.current);

    // *** create pathprojection ***
    const projection = geoMercator()
      .center([10.5, 51.25])
      .scale(3400)
      .translate([this.props.width / 2, this.props.height / 2]);
    const path = geoPath().projection(projection);

    // *** create stateborders ***
    const Dstates = this.props.geoData.objects.states as GeometryObject<{}>;
    let DstatesBorder = path(
      mesh(this.props.geoData, Dstates, function (a, b) {
        return a !== b;
      })
    );
    if (!DstatesBorder) {
      DstatesBorder = "";
    }
    this.statesBorder = <path key="statesborder" d={DstatesBorder} />;

    // *** create counties ***
    const Dcounties = feature(
      this.props.geoData,
      this.props.geoData.objects.counties
    );
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
        [this.props.width, this.props.height],
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

  render(): JSX.Element {
    // TODO add datadependencie for color
    return (
      <svg
        id={this.props.id}
        ref={this.DOMRefs.svg}
        width={this.props.width}
        height={this.props.height}
      >
        <g className="container">
          <g id="counties">{this.counties}</g>
          <g id="states-border">{this.statesBorder}</g>
        </g>
      </svg>
    );
  }
}
