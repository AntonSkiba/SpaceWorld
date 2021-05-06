import React, { Component } from "react";
import "./Dialog.css";
import configs from "../../Components/Dialog/configs";

import PlaceView from "../View/View";
import Loader from "../../Components/Loader/Loader";
import Dialog from "../../Components/Dialog/Dialog";
import Dropdown from "../../Components/Buttons/Dropdown/Dropdown";
import Slider from "../../Components/Buttons/Slider/Slider";

import PlaceInfo from "./PlaceInfo";

class PlaceDialog extends Component {
    constructor(props) {
        super(props);

        if (props.config) {
            this._firstName = props.config.name;
            this._firstSettings = props.config.settings;
            this._action = "update";
        } else {
            this._firstName = "places/" + this._genName();
            this._firstSettings = {
                style: "space",
                zone: null,
                clustering: 0.01,
                saturation: 0.01,
                chaotic: 0.00,
                fullness: 0.01,
                sunTime: 0,
                camera: {
                    position: { x: 0, y: 1500, z: 0 },
                },
            };
            this._action = "save";
        }

        this.state = {
            name: this._firstName,
            settings: this._firstSettings,
            loadingStatus: "",
            zones: [],
            place: null,
        };

        this._changeName = this._changeName.bind(this);
        this._changeZone = this._changeZone.bind(this);
        this._cancelClick = this._cancelClick.bind(this);
        this._saveClick = this._saveClick.bind(this);
        this._updateSettings = this._updateSettings.bind(this);
    }

    componentDidMount() {
        this._getZones().then(() => {
            this.setState({
                loadingStatus: null,
            });

            // если новая область, ставим рандомную зону
            if (!this.props.config) {
                const randomZone = this.state.zones[
                    Math.floor(Math.random() * this.state.zones.length)
                ];
                this._changeZone(randomZone);
                console.log("Place dialog, zones loaded: ", this.state.zones);
            }
        });
    }

    _updateSettings(settings) {
        clearTimeout(this._updateTimeout);
        const newSettings = {
            ...this.state.settings,
            ...settings,
        };

        if (this._view) {
            // ставим небольшую задержку, чтобы изменялись значения после остановки изменения параметров
            this._updateTimeout = setTimeout(() => {
                this._view.updateView(newSettings);
            }, 500);
            
        }

        this.setState({
            settings: newSettings,
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
                    zones: info.list,
                });
            });
    }

    _genName() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letter = letters[Math.floor(Math.random() * letters.length)];
        const number = Math.floor(Math.random() * 40000);
        return `${letter}-${number}`;
    }

    savePlace(config) {
        return fetch("/api/vertex/save", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config),
        }).then((res) => {
            return res.json();
        }).then((info) => {
            console.log("Place dialog, vertex saved: " + info.path);
            return info.path;
        });
    }

    _saveClick() {
        let { screenshot, settings } = this._view.getConfig();

        settings = {
            ...this.state.settings,
            ...settings,
        };

        const color = this.state.settings.zone.color;
        const config = {
            path: this.props.config && this.props.config.path,
            type: "place",
            name: this.state.name,
            screenshot,
            color: `rgb(${color.r}, ${color.g}, ${color.b})`,
            settings,
        };

        this.savePlace(config).then((path) => {
            this._dialog.close().then(() => {
                config.path = path;
                this.props.onClose(this._action, config);
            });
        });
    }

    _cancelClick() {
        this._dialog.close().then(() => {
            this.props.onClose("cancel");
        });
    }

    _changeName(e) {
        const full = e.target.value;
        const dirs = full.split("/");
        dirs[0] = "places";

        this.setState({
            name: dirs[1] ? dirs.join("/") : this._firstName,
        });
    }

    _changeZone(zone) {
        const neighbors = [];
        zone.heightSeed = Math.random() * 1000;
        zone.humiditySeed = Math.random() * 1000;

        for (let i = 0; i < 4; i++) {
            const randomZone = this.state.zones[
                Math.floor(Math.random() * this.state.zones.length)
            ];
            neighbors.push({
                key: randomZone.key,
                caption: randomZone.caption,
                color: randomZone.color,
            });
        }

        zone.neighbors = neighbors;

        this._updateSettings({ zone });  
    }

    render() {
        const style = {
            overlay: configs.styleDialog[this.state.settings.style].overlay,
            dialog: configs.styleDialog[this.state.settings.style].background,
        };

        const menu = [
            {
                tab: {
                    key: "settings",
                    title: "Place settings",
                    icon: "world.png",
                },
                content: (
                    <div>
                        <Dropdown
                            config={this.state.zones}
                            selected={this.state.settings.zone}
                            onChange={this._changeZone}
                        />
                        <Slider
                            min="0.01"
                            max="1"
                            step="0.01"
                            caption="Clustering"
                            value={this.state.settings.clustering}
                            onChange={(e) => {
                                this._updateSettings({
                                    clustering: parseFloat(e.target.value),
                                });
                            }}
                        />
                        <Slider
                            min="0.01"
                            max="1"
                            step="0.01"
                            caption="Saturation"
                            value={this.state.settings.saturation}
                            onChange={(e) => {
                                this._updateSettings({
                                    saturation: parseFloat(e.target.value),
                                });
                            }}
                        />
                        <Slider
                            min="0.00"
                            max="1"
                            step="0.01"
                            caption="Chaotic"
                            value={this.state.settings.chaotic}
                            onChange={(e) => {
                                this._updateSettings({
                                    chaotic: parseFloat(e.target.value),
                                });
                            }}
                        />
                        <Slider
                            min="0.01"
                            max="1"
                            step="0.01"
                            caption="Fullness"
                            value={this.state.settings.fullness}
                            onChange={(e) => {
                                this._updateSettings({
                                    fullness: parseFloat(e.target.value),
                                });
                            }}
                        />
                    </div>
                ),
            },
        ];

        return (
            <Dialog
                style={style}
                animation={this.props.animation}
                ref={(dialog) => {
                    this._dialog = dialog;
                }}
                header={
                    <input
                        className="placeDialog-header"
                        onChange={this._changeName}
                        type="text"
                        size="40"
                        value={this.state.name}
                        placeholder="Name"
                    />
                }
                view={
                    !this.state.settings.zone ? (
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
                        <div style={{ width: "100%", height: "100%" }}>
                            <PlaceInfo name={this.state.name} settings={this.state.settings}/>
                            <PlaceView
                                ref={(view) => {
                                    this._view = view;
                                }}
                                settings={this.state.settings}
                                updateSettings={this._updateSettings}
                            />
                        </div>
                    )
                }
                menu={menu}
                cancelClick={this._cancelClick}
                saveClick={this._saveClick}
            />
        );
    }
}

export default PlaceDialog;
