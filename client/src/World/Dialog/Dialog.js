import React, { Component } from "react";
import "./Dialog.css";

import Loader from "../../Components/Loader/Loader";
import Simple from "../../Components/Buttons/Simple/Simple";
import Text from "../../Components/Buttons/Text/Text";

class WorldDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingStatus: '',
            seeds: props.vertices.world.config.seeds
        };

        if (props.animation) {
            this._animation = {
                show: {
                    transform: "translate(0px, 0px) scale(1)",
                    opacity: 1,
                },
                close: {
                    transform: `translate(${
                        props.animation.point.x - window.innerWidth / 2
                    }px, ${
                        props.animation.point.y - window.innerHeight / 2
                    }px) scale(0)`,
                    opacity: 1,
                },
                time: {
                    duration: props.animation.time,
                    easing: "ease-in-out",
                    fill: "both",
                },
            };
        }

        this._overlayClick = this._overlayClick.bind(this);
		this._generateClick = this._generateClick.bind(this);
    }

    componentDidMount() {
        if (this._animation) {
            this._dialog.animate(
                [this._animation.close, this._animation.show],
                this._animation.time
            );
            this._overlay.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                this._animation.time
            );
        }

        this._getZones().then(() => {
            this.setState({
                loadingStatus: null,
            });
        });
    }

    _getZones() {
        this.setState({
            loadingStatus: "Загрузка зон...",
        });

        return fetch("/api/place/zones", {
            method: "GET",
        })
            .then((res) => {
                return res.json();
            })
            .then((info) => {
                this.setState({
					info: this._createInfo(this.props.vertices, info.list)
                });
            });
    }

	_createInfo(vertices, zones) {
		const keys = Object.keys(vertices);
		const count = Object.keys(vertices).length - 1;
		let places = [], shapes = [];

		keys.forEach(key => {
			if (vertices[key].config.type === 'place') places.push(vertices[key]);
			else if (vertices[key].config.type === 'shape') shapes.push(vertices[key]);
		});

		// console.log(places, zones);

		return {
			//count: 'На данный момент в графе ' + (count ? 'создано ' + ,
		}
	}

    _overlayClick(e) {
        if (e.target.className === "worldDialog-overlay") {
            this.close().then(() => {
                this.props.onClose();
            });
        }
    }

	_generateClick() {
		this.close().then(() => {
			this.props.onGenerate('render');
		});
	}

    _seed(type, event) {
        const seeds = this.props.vertices.world.config.seeds;
        seeds[type] = event.target.value;
        this.setState({seeds});
    }

    _seedOut(type, event) {
        if (!event.target.value) {
            const seeds = this.props.vertices.world.config.seeds;
            seeds[type] = this.props.seeds[Math.floor(Math.random() * this.props.seeds.length)];
            this.setState({seeds});
        }
    }

    close() {
        return new Promise((resolve) => {
            if (this._animation) {
                this._dialog.animate(
                    [this._animation.show, this._animation.close],
                    this._animation.time
                );
                this._overlay.animate(
                    [{ opacity: 1 }, { opacity: 0 }],
                    this._animation.time
                );
                setTimeout(() => {
                    resolve();
                }, this._animation.time.duration);
            } else {
                resolve();
            }
        });
    }

    render() {
        const color = { r: 11, g: 25, b: 73 };

        const dialog = {
            background: `rgb(${color.r}, ${color.g}, ${color.b})`,
        };

        const overlay = {
            background: `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`,
        };

        return (
            <div
                className="worldDialog-overlay"
                style={overlay}
                onClick={this._overlayClick}
                ref={(overlay) => {
                    this._overlay = overlay;
                }}
            >
                <div
                    className="worldDialog"
                    style={dialog}
                    ref={(dialog) => {
                        this._dialog = dialog;
                    }}
                >
                    <div className="worldDialog-header">World</div>
                    {!this.state.info ? (
                        <Loader
                            color="#ffffff"
                            opacity="0.4"
                            weight="14px"
                            status={this.state.loadingStatus}
                            absolute={true}
                            statusStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                                color: "#ffffff",
                            }}
                        />
                    ) : (
                        <div className="worldDialog-body">
							<div className="worldDialog-body__info">Last step!</div>
							<Text caption="Keyword for planet terrain"
                                value={this.state.seeds['planet']}
                                onChange={this._seed.bind(this, 'planet')}
                                onOut={this._seedOut.bind(this, 'planet')}/>
                            <Text caption="Keyword for planet biomes"
                                value={this.state.seeds['biome']}
                                onChange={this._seed.bind(this, 'biome')}
                                onOut={this._seedOut.bind(this, 'biome')}/>
                            <Text caption="Keyword for moon"
                                value={this.state.seeds['moon']}
                                onChange={this._seed.bind(this, 'moon')}
                                onOut={this._seedOut.bind(this, 'moon')}/>
						</div>
                    )}
					<div className="worldDialog-footer">
						<Simple onClick={this._generateClick} title="Запуск генерации ландшафта">
							Generate!
						</Simple>
					</div>
                </div>
            </div>
        );
    }
}

export default WorldDialog;
