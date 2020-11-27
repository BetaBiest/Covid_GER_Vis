import * as React from "react";
import { render } from "react-dom";
import { Titel } from "./titel";
import { Map } from "./map";
import { Topology, Objects } from "topojson-specification";
import { germany } from "../data/germany";
import { GeometryObject } from "geojson";
//const geoData = (geoData_ as unknown) as Topology; // TODO search for saver solution

interface IProps {}
export const App = (props: IProps) => {
  return (
    <>
      <Titel text="My React App" />
      <Map id="germany-map" geoData={germany} />
    </>
  );
};
