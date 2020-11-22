import "./style";
import * as React from "react";
import { render } from "react-dom";
import { App } from "./component/App";



const reactContainer = document.getElementById("app");

render(<App />, reactContainer);
