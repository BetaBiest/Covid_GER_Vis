import { Titel } from "./titel";
import { Map } from "./map";
import { germany } from "../data/germany";

interface IProps {}
export const App = (props: IProps) => {
  return (
    <>
      <Titel text="My React App" />
      <Map id="germany-map" geoData={germany} />
    </>
  );
};
