import React, { Component } from "react";
import "./Dialog.css";
import configs from "../../Components/Dialog/configs";

import ShapeView from "../View/View";
import Loader from "../../Components/Loader/Loader";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Dialog from "../../Components/Dialog/Dialog";
import Switch from "../../Components/Buttons/Switch/Switch";
import Number from "../../Components/Buttons/Number/Number";

class ShapeDialog extends Component {
    constructor(props) {
        super(props);

        if (props.file) {
            // убираем расширение файла
            const fullName = props.file.name.split(".");
            fullName.pop();

            this.firstSettings = {
                style: "default",
                stand: "grid",
                sunTime: 0,
                camera: {
                    position: { x: -330, y: 250, z: 400 },
                },
            };

            this.firstName = `shapes/${fullName.join(".")}`;
            this.action = "save";
        } else {
            this._path = props.config.path;
            this.firstName = props.config.name;
            this.firstSettings = props.config.settings;
            this.action = "update";
        }

        this.state = {
            name: this.firstName,
            settings: this.firstSettings,
            loadingStatus: "",
        };

        this._changeName = this._changeName.bind(this);
        this._cancelClick = this._cancelClick.bind(this);
        this._saveClick = this._saveClick.bind(this);
        this._updateSettings = this._updateSettings.bind(this);
    }

    setModel(file) {
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
            });
        };

        this.setState({
            loadingStatus: "Чтение файла...",
        });
        shapeReader.readAsDataURL(file);
    }

    // метод сохраняет файл на сервере
    uploadFile() {
        const formData = new FormData();
        formData.append("shape", this.props.file);
        this.setState({
            loadingStatus: "Загрузка файла...",
        });
        
        fetch("/api/shape/upload", {
            method: "POST",
            body: formData,
        }).then((res) => {
            return res.json();
        }).then((res) => {
            if (res.link) {
                this.setModel(this.props.file);
                this.state.settings.link = res.link;
            }
        });
    }

    // метод загружает файл с сервера
    downloadFile() {
        const name = this.props.config.settings.link;
        this.setState({
            loadingStatus: "Загрузка файла...",
        });

        fetch(`/api/shape/download/${name}`, {
            method: "GET"
        }).then((res) => {
            return res.json();
        }).then((res) => {
            this.setModel(new File([res.file], name));
        });
    }

    // метод сохраняет конфиг фигуры
    saveShape(config) {
        return fetch("/api/vertex/save", {
            method: "POST",
			headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config)
        }).then(res => {
            return res.json();
        }).then(info => {
            console.log("Shape dialog, vertex saved: " + info.path);
            return info.path;
        });
    }

    componentDidMount() {
        if (this.props.file) {
            this.uploadFile();
        } else {
            this.downloadFile();
        }
    }

    _changeName(e) {
        const full = e.target.value;
        const dirs = full.split("/");
        dirs[0] = "shapes";

        this.setState({
            name: dirs[1] ? dirs.join("/") : this.firstName,
        });
    }

    _updateSettings(settings) {
        const newSettings = {
            ...this.state.settings,
            ...settings,
        };

        if (this._view) {
            this._view.updateView(newSettings);
        }

        this.setState({
            settings: newSettings,
        });
    }

    _cancelClick() {
        this._dialog.close().then(() => {
            this.props.onClose("cancel");
        });
    }

    _saveClick() {
        let { screenshot, settings } = this._view.getConfig();

        // внутри сцены обновляется время и положение камеры
        settings = {
            ...this.state.settings,
            ...settings,
        };

        const config = {
            path: this._path,
            type: 'shape',
            name: this.state.name,
            screenshot,
            color: configs.styleDialog[this.state.settings.style].background,
            settings,
        }

        this.saveShape(config).then((path) => {
            this._dialog.close().then(() => {
                config.path = path;
                this.props.onClose(this.action, config);
            });
        });
    }

    render() {
        const style = {
            overlay: configs.styleDialog[this.state.settings.style].overlay,
            dialog: configs.styleDialog[this.state.settings.style].background,
        };

        const menu = [{
            tab: {
                key: 'settings',
                title: 'Object view settings',
                icon: 'cube.png'
            },
            content: (
                <div>
                    <Switch selected={this.state.settings.stand} onToggle={(e, stand) => {this._updateSettings({stand})}} config={configs.standButton}/>
                    <Switch selected={this.state.settings.style} onToggle={(e, style) => {this._updateSettings({style})}} config={configs.styleButton}/>
				    <Number value={this.state.settings.scale} caption="Scale:" step="0.01" min="0.01" onChange={(e) => {this._updateSettings({scale: e.target.value})}} title="Измените размер модели"/>
                </div>
            )
        }, {
            tab: {
                key: 'world',
                title: 'Settings for landscape',
                icon: 'world.png'
            },
            content: (<div>world</div>)
        }];

        return (
            <Dialog
                style={style}
                animation={this.props.animation}
                ref={(dialog) => {
                    this._dialog = dialog;
                }}
                header={
                    <input
                        ref={(input) => {
                            this._nameInput = input;
                        }}
                        className="shapeDialog-header__name"
                        onChange={this._changeName}
                        type="text"
                        size="40"
                        value={this.state.name}
                        placeholder="Name"
                    />
                }
                view={
                    !this.state.shape ? (
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
                    ) : (
                        <ShapeView
                            ref={(view) => {
                                this._view = view;
                            }}
                            shape={this.state.shape}
                            settings={this.firstSettings}
                            updateSettings={this._updateSettings}
                        />
                    )
                }
                menu={menu}

                cancelClick={this._cancelClick}
                saveClick={this._saveClick}
            />
        );
    }
}

export default ShapeDialog;
