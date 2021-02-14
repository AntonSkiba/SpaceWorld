import React, { Component } from "react";
import "./Graph.css";

import ContextMenu from "./ContextMenu/ContextMenu";
import ShapeDialog from "./ShapeDialog/ShapeDialog";
import Vertex from "./Vertex/Vertex";

/**
 * Основной компонент графа
 */

class Graph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            menu: {
                show: false,
                top: 0,
                left: 0,
                width: 250,
                height: 400,
            },

            // структура графа, состоит из вершин
            structure: [
                {
                    position: {
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                    },
                    size: 100,
                    text: {
                        caption: "World",
                        style: {
                            fontWeight: "bold",
                            fontSize: "20px",
                            color: "white",
                            background: "rgb(11, 25, 73)",
                        },
                    },
                },
            ],

            loadedShape: null,
        };

        this._onLoadShape = this._onLoadShape.bind(this);
        this._shapeDialogClosed = this._shapeDialogClosed.bind(this);
    }

    _onLoadShape(e) {
        this._toggleContextMenu.call(this, false, e);
        this.setState({
            loadedShape: e.target.files[0],
        });
    }

    _toggleContextMenu(show, e) {
        e?.preventDefault();

        if (!this.state.loadedShape) {
            this.setState({
                menu: {
                    ...this.state.menu,
                    show,
                    top: (e && e.clientY) || this.state.menu.top,
                    left: (e && e.clientX) || this.state.menu.left,
                },
            });
        }
    }

    _shapeDialogClosed(state, config, e) {
        if (state === "save") {
			this._createVertex(config);
		} else if (state === "update") {
			this._updateVertex(config);
        } else {
            this._toggleContextMenu.call(this, true, e);
		}
		
		this.openedIdx = null;

        this.setState({
            loadedShape: null,
        });
    }

    _createVertex(config) {
        const vertex = {
            config,
            position: {
                x: this.state.menu.left + this.state.menu.width / 2,
                y: this.state.menu.top + 20,
            },
            size: 80,
            status: "new",
        };

        this.setState({
            structure: [...this.state.structure, vertex],
        });
	}

	_updateVertex(config) {
		// прописываем исключительно новые опции, чтобы не было лагов с огромными моделями
        this.state.structure[this.openedIdx].config.name = config.name;
        this.state.structure[this.openedIdx].config.screenshot = config.screenshot;
        this.state.structure[this.openedIdx].config.settings = config.settings;
        this.state.structure[this.openedIdx].status = 'update';

		this.setState({
            structure: [...this.state.structure],
        });
	}

	_changeVertex(idx, vertex) {
		this.state.structure[idx] = {
			...this.state.structure[idx],
			...vertex
		};

		this.setState({
            structure: [...this.state.structure],
        });
	}

	_openShape(idx) {
		if (idx) {
			this.setState({
				loadedShape: this.state.structure[idx],
			});
			
			this.openedIdx = idx;
		}
	}

    render() {
		// анимация, либо от открываемой вершины, либо от кнопки добавления файла
		const point = this.state.loadedShape && this.state.loadedShape.position || {
			x: this.state.menu.left + this.state.menu.width / 2,
			y: this.state.menu.top + 20,
		};

        const shapeDialogAnimation = {
            point, 
            time: 200,
        };

        const contextMenuAnimation = {
            time: 200,
        };

        const structure = this.state.structure.map((vertex, idx) => (
			<Vertex
				{...vertex}
				key={"vertex_" + idx}
				changeVertex={this._changeVertex.bind(this, idx)}
				openShape={this._openShape.bind(this, idx)}/>
        ));

        return (
            <div
                className="graph"
                onContextMenu={this._toggleContextMenu.bind(this, true)}
            >
                {this.state.menu.show && (
                    <ContextMenu
                        animation={contextMenuAnimation}
                        top={this.state.menu.top}
                        left={this.state.menu.left}
                        width={this.state.menu.width}
                        height={this.state.menu.height}
                        onLoadShape={this._onLoadShape}
                        onClose={this._toggleContextMenu.bind(this, false)}
                    />
                )}
                {this.state.loadedShape && (
                    <ShapeDialog
                        animation={shapeDialogAnimation}
                        shape={this.state.loadedShape}
                        onClose={this._shapeDialogClosed}
                    />
                )}

                {structure}
            </div>
        );
    }
}

export default Graph;
