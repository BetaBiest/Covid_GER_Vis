import * as React from "react";
import { render } from "react-dom";
import { Titel } from "./titel";

interface IProps {}
export const App = (props: IProps) => {
  return (
    <>
      <Titel text="My React App" />
    </>
  );
};
