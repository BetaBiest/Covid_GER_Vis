import "./style";
import * as React from "react";
import { render } from "react-dom";
import { App } from "./component/App";
import { csv } from "d3";

const reactContainer = document.getElementById("app");

render(<App />, reactContainer);
