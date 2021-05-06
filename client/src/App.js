import React, { Component } from "react";
import "./App.css";

import Graph from "./Graph/Graph";
import SpaceView from "./Space/View/View";

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: "graph",
        };

        this._generate = this._generate.bind(this);
    }

    _generate(graph) {
        this.setState({
            show: "space",
            graph
        });
    }

    render() {
        return (
            <div className="application">
                {this.state.show === "graph" ? (
                    <Graph onGenerate={this._generate} />
                ) : (
                    <SpaceView graph={this.state.graph}/>
                )}
            </div>
        );
    }
}
