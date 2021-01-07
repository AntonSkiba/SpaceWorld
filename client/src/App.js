import React, { Component } from "react";
import "./App.css";

import Graph from './Graph/Graph';

export default class App extends Component {
    render() {
        return (
          <div className="application">
            <Graph/>
          </div>
        )
    }
}
