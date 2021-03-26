import React, { Component } from "react";
import "./ShapeDialog.css";
import configs from "../configs";

import ObjectView from "./ObjectView/ObjectView";
import SpaceView from "../../Space/View";
import MenuController from "./MenuController/MenuController";
import Loader from "../../Components/Loader/Loader";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

class ShapeDialog extends Component {
    constructor(props) {
        super(props);

        if (props.shape === "space") {
            this.firstName = `spaces/${Date.now()}`;

            this.firstSettings = {
                style: "space",
            };

            this.action = "save";
            this.shape = props.shape;
        } else if (props.shape.config) {
            this.firstName = props.shape.config.name;
            this.firstSettings = props.shape.config.settings;
            this.shape = props.shape.config.readyShape;
            this.action = "update";
        } else {
            const fullName = props.shape.name.split(".");
            fullName.pop();

            this.firstName = `default/${fullName.join(".")}`;

            this.firstSettings = {
                style: "default",
                stand: "grid",
                sunTime: 0,
                camera: {
                    position: { x: -330, y: 250, z: 400 },
                },
            };

            this.action = "save";
        }

        this.state = {
            shape: this.shape,
            name: this.firstName,
            settings: this.firstSettings,
            loadingStatus: "",
        };

        if (props.animation) {
            this.animation = {
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

        this.onChangeName = this.onChangeName.bind(this);
        this.checkName = this.checkName.bind(this);
        this.toggleStyle = this.toggleStyle.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
    }

    componentDidMount() {
        if (this.animation) {
            this.popup.animate(
                [this.animation.close, this.animation.show],
                this.animation.time
            );
            this.popupOverlay.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                this.animation.time
            );
        }

        if (!this.state.shape) {
            const formData = new FormData();
            formData.append("shape", this.props.shape);

            this.setState({
                loadingStatus: "Загрузка файла...",
            });
            fetch("/api/shape/saveFile", {
                method: "POST",
                body: formData,
            })
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    if (res.link) {
                        const shapeReader = new FileReader();
                        shapeReader.onload = () => {
                            const shapeLoader = new OBJLoader();
                            this.setState({
                                loadingStatus: "Обработка модели...",
                            });
                            shapeLoader.load(shapeReader.result, (shape) => {
                                this.setState({
                                    shape,
                                });

                                this.state.settings.link = res.link;
                            });
                        };

                        this.setState({
                            loadingStatus: "Чтение файла...",
                        });
                        shapeReader.readAsDataURL(this.props.shape);
                    }
                });
        }
    }

    onChangeName(e) {
        this.setState({
            name: e.target.value,
        });
    }

    checkName() {
        let names = this.state.name.split("/");
        names = names.filter((name) => !!name.length && name !== "..");

        let resultName;
        if (!names.length) {
            resultName = this.firstName;
        } else if (names.length === 1) {
            resultName = `default/${names[0]}`;
        } else {
            resultName = names.join("/");
        }

        this.setState({
            name: resultName,
        });
    }

    toggleStyle(e, style) {
        this.setState({
            styleSelected: style,
        });
    }

    updateSettings(settings) {
        const newSettings = {
            ...this.state.settings,
            ...settings,
        };

        if (this.view) {
            this.view.updateView(newSettings);
        }

        this.setState({
            settings: newSettings,
        });
    }

    cancelClick() {
        this.closeDialog("cancel");
    }

    saveClick() {
        let { screenshot, settings } = this.view.getConfig();

        // внутри сцены обновляется время и положение камеры
        settings = {
            ...this.state.settings,
            ...settings,
        };

        // ради оптимизации при обновлении повторно не передаем объект
        this.closeDialog(this.action, {
            readyShape: this.action === "save" && this.state.shape,
            name: this.state.name,
            screenshot,
            settings,
        });
    }

    closeDialog(state, shape) {
        if (this.animation) {
            this.popup.animate(
                [this.animation.show, this.animation.close],
                this.animation.time
            );
            this.popupOverlay.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                this.animation.time
            );
            setTimeout(() => {
                this.props.onClose(state, shape);
            }, this.animation.time.duration);
        } else {
            this.props.onClose(state, shape);
        }
    }

    render() {
        const contentStyle = {
            backgroundColor:
                configs.styleDialog[this.state.settings.style].background,
        };

        return (
            <div
                ref={(overlay) => {
                    this.popupOverlay = overlay;
                }}
                className="shapeDialog-overlay"
                style={{
                    backgroundColor:
                        configs.styleDialog[this.state.settings.style].overlay,
                }}
            >
                <div
                    style={contentStyle}
                    className="shapeDialog"
                    ref={(popup) => {
                        this.popup = popup;
                    }}
                >
                    <div className="shapeDialog-header">
                        <input
                            ref={(input) => {
                                this.nameInput = input;
                            }}
                            className="shapeDialog-header__name"
                            onChange={this.onChangeName}
                            onBlur={this.checkName}
                            type="text"
                            size="40"
                            value={this.state.name}
                            placeholder="Name"
                        />
                    </div>
                    {!this.state.shape ? (
                        <div className="shapeDialog-main">
                            <Loader
                                color="#000000"
                                opacity="0.4"
                                weight="14px"
                                status={this.state.loadingStatus}
                                statusStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                                    color: "#ffffff",
                                }}
                            />
                        </div>
                    ) : (
                        <div
                            className="shapeDialog-main"
                            onClick={this.checkName}
                        >
                            <div className="shapeDialog-main__view">
                                {this.state.shape !== "space" ? (
                                    <ObjectView
                                        ref={(view) => {
                                            this.view = view;
                                        }}
                                        shape={this.state.shape}
                                        settings={this.firstSettings}
                                        updateSettings={this.updateSettings}
                                    />
                                ) : (
                                    <SpaceView
                                        ref={(view) => {
                                            this.view = view;
                                        }}
                                    />
                                )}
                            </div>
                            <MenuController
                                isSpace={this.state.shape === "space"}
                                settings={this.state.settings}
                                onUpdateSettings={this.updateSettings}
                                cancelClick={this.cancelClick}
                                saveClick={this.saveClick}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ShapeDialog;
