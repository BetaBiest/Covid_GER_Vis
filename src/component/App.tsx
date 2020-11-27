import * as React from "react";
import { render } from "react-dom";
import { Titel } from "./titel";
import { germany } from "../data/germany";

interface IProps {}
export const App = (props: IProps) => {
  return (
    <>
      <Titel text="My React App" />
    </>
  );
};
