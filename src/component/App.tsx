import { Titel } from "./titel";
import { Map } from "./map";
import { germany } from "../data/germany";
import PPSlider from "./PPSlider";
function onK(e: React.MouseEvent<SVGPathElement, MouseEvent>) {
  console.log(e.currentTarget.getAttribute("id"));
}

interface IProps {}
export const App = (props: IProps) => {
  return (
    <>
      <Titel text="My React App" />
      <Map
        id="germany-map"
        geoData={germany}
        onclick={onK}
        meshes={["states"]}
        areas={["counties"]}
      />
      <PPSlider min={0} max={20} value={-20} runtime={5000} />
    </>
  );
};
