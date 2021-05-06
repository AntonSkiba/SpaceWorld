import React, { Component } from "react";
import "./Graph.css";

import ContextMenu from "./ContextMenu/ContextMenu";

import ShapeDialog from "../Shape/Dialog/Dialog";
import PlaceDialog from "../Place/Dialog/Dialog";
import WorldDialog from "../World/Dialog/Dialog";
import ClimateDialog from "../Climate/Dialog/Dialog";

import Vertex from "./Vertex/Vertex";
import Edge from "./Edge/Edge";
import Dropdown from "../Components/Buttons/Dropdown/Dropdown";

/**
 * Основной компонент графа
 */

class Graph extends Component {
    constructor(props) {
        super(props);

        this._seeds = ['Apple', 'Sunflower', 'Rose', 'Rosemary', 'Planet', 'Earth', 'December', 'October', 'May', 'June', 'September', 'January', 'August', 'Jule', 'April', 'Bun', 'Moon', 'Flower', 'Cinnamon', 'Space', 'Cat', 'World'];

        this.state = {
            name: 'graph_' + Date.now(),

            menu: {
                show: false,
                top: 0,
                left: 0,
                width: 250,
                height: 180,
            },

            // вершины графа
            vertices: {
                world: {
                    position: {
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                    },

                    link: {
                        status: true,
                        children: [],
                    },

                    size: 100,
                    config: {
                        type: 'world',
                        caption: 'World',
                        settings: {},
                        style: {
                            fontWeight: "bold",
                            fontSize: "20px",
                            color: "white",
                        },
                        seeds: {
                            planet: this._seeds[Math.floor(Math.random() * this._seeds.length)],
                            biome: this._seeds[Math.floor(Math.random() * this._seeds.length)],
                            moon: this._seeds[Math.floor(Math.random() * this._seeds.length)]
                        },
                        color: "rgb(11, 25, 73)"
                    }
                },
            },

            // стейты диалоговых окон
            place: false,
            shape: false,
            world: false
        };

        this._onLoadShape = this._onLoadShape.bind(this);
        this._onCreatePlace = this._onCreatePlace.bind(this);
        this._dialogClose = this._dialogClose.bind(this);
        this._generate = this._generate.bind(this);
        this._save = this._save.bind(this);
        this._setGraph = this._setGraph.bind(this);
    }

    componentDidMount() {
        this._setClimate();
        this._updateGraphList();
    }

    _updateGraphList() {
        fetch('/api/graph/list', {
            method: "GET"
        }).then((res) => {
            return res.json();
        }).then((info) => {
            this.setState({
                graphsList: info.list
            })
        });
    }

    _setGraph(graph) {
        this._holeAnimate();
        fetch(`/api/graph/load/${graph.key}`, {
            method: "GET"
        }).then((res) => {
            return res.json();
        }).then((vertices) => {
            this.setState({
                vertices,
                name: graph.key
            });

            this._setClimate();

            this._holeAnimate('reverse');
        });
    }

    _setClimate() {
        const root = this.state.vertices.world;
		const tree = this._getTree(root);

        fetch('/api/graph/climate', {
            method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				graph: {
                    tree
                }
			})
        }).then((result) => {
            return result.json()
        }).then(info => {
            this.setState({
                climateMap: info.image
            });
        });
    }

    _generate() {
        // закрываем окно
        this.openedKey = null;

        this.setState({
            world: false
        });

        // собираем вершины в иерархическую структуру
        const root = this.state.vertices.world;
		const tree = this._getTree(root);
        const models = this._getModels();
		const terrainSeed = root.config.seeds['planet'];
		const biomeSeed = root.config.seeds['biome'];
        const moonSeed = root.config.seeds['moon'];

		console.log("Graph tree: ", tree);

        const graph = {
			terrainSeed,
			biomeSeed,
            moonSeed,
            models,
			tree
		};

        // запускаем анимацию
        this._holeAnimate().then(() => {
            this.props.onGenerate(graph);
        });
    }

    _getModels() {
        const models = [];
        for (let key in this.state.vertices) {
            const vertex = this.state.vertices[key];
            if (vertex.link.status && vertex.config.settings.link) {
                const parentSettings = this.state.vertices[vertex.link.parent].config.settings;
                models.push({
                    scale: vertex.config.settings.scale,
                    link: vertex.config.settings.link,
                    size: vertex.config.settings.size,
                    parent: {
                        zone: parentSettings.zone.key,
                        clustering: parentSettings.clustering,
                        saturation: parentSettings.saturation,
                        chaotic: parentSettings.chaotic,
                        fullness: parentSettings.fullness,
                    }
                });
            }
        }
        
        return models;
    }

    _getTree(vertex, level = 0) {
        const params = {};
        if (vertex.config.settings.zone) {
            params.level = level;
            params.zone = vertex.config.settings.zone.key;
            params.clustering = vertex.config.settings.clustering;
            params.saturation = vertex.config.settings.saturation;
            params.chaotic = vertex.config.settings.chaotic;
            params.fullness = vertex.config.settings.fullness;
            params.name = vertex.config.name;
        } else if (vertex.config.settings.link) {
            params.link = vertex.config.settings.link;
            params.scale = vertex.config.settings.scale;
            params.size = vertex.config.settings.size;
            params.name = vertex.config.name;
        }

		const node = {
            params,
			path: vertex.config.path,
			position: vertex.position,
			parent: vertex.link.parent,
			children: vertex.link.children.map((key) => {
				return this._getTree(this.state.vertices[key], level + 1);
			})
		}

		return node;
	}

    _holeAnimate(direction = 'normal') {
        const animation = this._hole.animate({
            zIndex: [-10, 99, 999],
            transform: ['translate(0px, 0px)', `translate(${this.state.vertices.world.position.x}px, ${this.state.vertices.world.position.y}px)`],
            width: ['100%', '0px'],
            height: ['100%', '0px'],
            borderRadius: ['0', '50%', '50%']
        }, {
            direction,
            duration: 1000,
            easing: 'ease-in-out',
            fill: "both"
        });

        return animation.finished;
    }

    _onLoadShape(e) {
        this._toggleContextMenu.call(this, false, e);
        this.setState({
            shape: {
                file: e.target.files[0],
            },
        });
    }

    _onCreatePlace(e) {
        this._toggleContextMenu.call(this, false, e);
        this.setState({
            place: true,
        });
    }

    _toggleContextMenu(show, e) {
        e?.preventDefault();

        if (!this.state.shape && !this.state.place && !this.state.world && !this._climateOpen) {
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

    _dialogClose(action, config, e) {
        if (action === "save") {
            this._createVertex(config);
        } else if (action === "update") {
            this._updateVertex(config);
            this._setClimate();
        } else {
            this._toggleContextMenu.call(this, true, e);
        }

        this.openedKey = null;

        this.setState({
            loadedShape: null,
            shape: false,
            place: false,
            world: false,
            climate: false
        });
    }

    _createVertex(config) {
        const key = Date.now();
        const vertex = {
            config,

            link: {
                status: false,
                parent: null,
                children: [],
                potential: [],
            },

            position: {
                x: this.state.menu.left + this.state.menu.width / 2,
                y: this.state.menu.top + 20,
            },
            size: 80,
        };

        this._setPotentialEdges(vertex);

        this.setState({
            vertices: {
                ...this.state.vertices,
                [key]: vertex,
            },
        });
    }

    _save() {
        const structure = [];
        for (let key in this.state.vertices) {
            const vertex = this.state.vertices[key];

            structure.push({
                key,
                position: vertex.position,
                link: vertex.link,
                config: vertex.config.path || vertex.config,
                size: vertex.size
            });
        }

        fetch("/api/graph/save", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: this.state.name,
                structure
            })
        }).then((res) => {
            return res.json();
        }).then((info) => {
            console.log('Graph ' + info.name + ' saved');
            this._updateGraphList();
        });
    }

    _updateVertex(config) {
        this.state.vertices[this.openedKey].config = config;

        this.setState({
            vertices: {...this.state.vertices},
        });
    }

    _moveVertex(currentKey, position) {
        const currentVertex = this.state.vertices[currentKey];
        currentVertex.position = position;

        this._setPotentialEdges(currentVertex);

        this.setState({
            vertices: {...this.state.vertices}
        });
    }

    _setPotentialEdges(currentVertex) {
        // если текующая вершина не связана с графом
        if (!currentVertex.link.status) {
            const distance = window.innerWidth / 3;

            // очищаем старые потенциальные ребра
            currentVertex.link.potential = [];

            // проверяем все существующие узлы
            for (let potentialKey in this.state.vertices) {
                const potentialVertex = this.state.vertices[potentialKey];

                // если потенциальная вершина уже связана с графом
                // тогда проверяем расстояние между ними, если проверка проходит записываем ключ вершину в потенциальные связи
                // если вершина фигура, то потенциальная должна быть только местом, если вершина место, то потенциальная место или мир
                if (potentialVertex.link.status) {
                    const distancePassed = distance > this._distance(currentVertex, potentialVertex);
                    const vertexPassed = (currentVertex.config.type === 'shape' && potentialVertex.config.type === 'place')
                        || (currentVertex.config.type === 'place' && potentialVertex.config.type !== 'shape');

                    if (distancePassed && vertexPassed) {
                        currentVertex.link.potential.push(potentialKey);
                    }
                }
            }
        }
    }

    _distance(v1, v2) {
        return Math.sqrt(
            Math.pow(v1.position.x - v2.position.x, 2) +
                Math.pow(v1.position.y - v2.position.y, 2)
        );
    }

    _setEdge(fromKey, toKey, type) {
        if (type === 'potential') {
            const toVertex = this.state.vertices[toKey];
            const fromVertex = this.state.vertices[fromKey];
    
            // для toVertex добавляем дочерний узел
            toVertex.link.children.push(fromKey);
            
            // вершина fromVertex теперь является частью графа
            fromVertex.link.status = true;
            fromVertex.link.parent = toKey;
            fromVertex.link.potential = [];

            for (let key in this.state.vertices) {
                const vertex = this.state.vertices[key];
                this._setPotentialEdges(vertex);
            }

            this._setClimate();
        }

        this.setState({
            vertices: {...this.state.vertices}
        });
    }

    _unsetEdge(fromKey, toKey, type) {
        if (type === 'children') {
            // рекурсивно находим поддерево, которое нужно почистить
            const tree = this._getUnsetTree(fromKey, toKey);

            tree.forEach(pair => {
                const toVertex = this.state.vertices[pair.toKey];
                const fromVertex = this.state.vertices[pair.fromKey];

                // у fromVertex находим в дочерних эту вершину и удаляем
                const fromIdx = fromVertex.link.children.indexOf(pair.toKey);
                fromVertex.link.children.splice(fromIdx, 1);

                // отвязываем toVertex от графа
                toVertex.link.status = false;
                toVertex.link.parent = null;
            })

            for (let key in this.state.vertices) {
                const vertex = this.state.vertices[key];
                this._setPotentialEdges(vertex);
            }

            this._setClimate();
        }

        this.setState({
            vertices: {...this.state.vertices}
        });
    }

    _getUnsetTree(fromKey, toKey, tree = []) {
        tree.push({
            fromKey,
            toKey
        });

        const toVertex = this.state.vertices[toKey];

        while (toVertex.link.children.length) {
            const newTo = toVertex.link.children.pop();
            const newFrom = toKey;
            tree.push(...this._getUnsetTree(newFrom, newTo));
        }

        return tree;
    }

    _openDialog(key) {
        const vertex = this.state.vertices[key];
        this.setState({
            [vertex.config.type]: {
                config: vertex.config,
                position: vertex.position,
            },
        });

        this.openedKey = key;
    }

    render() {
        // анимация, либо от открываемой вершины, либо от кнопки добавления файла
        const point = this.state.shape.position
            || this.state.place.position
            || this.state.world.position
            || {
                x: this.state.menu.left + this.state.menu.width / 2,
                y: this.state.menu.top + 20,
            };

        const dialogAnimation = {
            point,
            time: 200,
        };

        const contextMenuAnimation = {
            time: 200,
        };

        const vertices = [];
        const edges = [];
        for (let key in this.state.vertices) {
            const vertex = this.state.vertices[key];
            vertices.push(
                <Vertex
                    {...vertex}
                    key={key}
                    moving={this._moveVertex.bind(this, key)}
                    open={this._openDialog.bind(this, key)}
                />
            );

            // собираем ребра от вершины
            // если она в графе, то рисуем дочерние, если не в графе, то потенциальные
            const type = vertex.link.status ? 'children' : 'potential';

            vertex.link[type].forEach(drawKey => {
                const drawVertex = this.state.vertices[drawKey];
                const config = {
                    distance: this._distance(vertex, drawVertex),
                    potential: !vertex.link.status,
                    from: {
                        position: vertex.position,
                        color: vertex.config.color
                    },
                    to: {
                        position: drawVertex.position,
                        color: drawVertex.config.color
                    }
                };

                edges.push(
                    <Edge
                        {...config}
                        key={`edge_${key}_${drawKey}`}
                        onSet={this._setEdge.bind(this, key, drawKey, type)}
                        onUnset={this._unsetEdge.bind(this, key, drawKey, type)}/>
                );
            });
        }



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
                        onCreatePlace={this._onCreatePlace}
                        onClose={this._toggleContextMenu.bind(this, false)}
                        onSaveGraph={this._save}
                    />
                )}
                {this.state.shape && (
                    <ShapeDialog
                        animation={dialogAnimation}
                        file={this.state.shape.file}
                        config={this.state.shape.config}
                        onClose={this._dialogClose}
                    />
                )}

                {this.state.place && (
                    <PlaceDialog
                        animation={dialogAnimation}
                        config={this.state.place.config}
                        onClose={this._dialogClose}
                    />
                )}

                {this.state.world && (
                    <WorldDialog
                        seeds={this._seeds}
                        animation={dialogAnimation}
                        vertices={this.state.vertices}
                        onClose={this._dialogClose}
                        onGenerate={this._generate}
                    />
                )}

                {this.state.graphsList && (
                    <div className="graph-list">
                        <Dropdown
                            config={this.state.graphsList}
                            selected={{
                                key: this.state.name,
                                title: this.state.name,
                                caption: this.state.name,
                                style: {
                                    background: 'rgba(11, 25, 53, 0.4)'
                                }
                            }}
                            onChange={this._setGraph}
                        />
                    </div>
                )}

                {this.state.climateMap && <ClimateDialog
                    animation={dialogAnimation}
                    image={this.state.climateMap}
                    toggle={(open) => {this._climateOpen = open}}
                    vertices={this.state.vertices}/>}

                {vertices}
                {edges}
                <div
                    className="graph-hole"
                    ref={(hole) => {
                        this._hole = hole;
                    }}>
                </div>
            </div>
        );
    }
}

export default Graph;
