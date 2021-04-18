import React, { Component } from "react";
import "./Dialog.css";
import configs from "../../Components/Dialog/configs";

import PlaceView from "../View/View";
import Loader from "../../Components/Loader/Loader";
import Dialog from "../../Components/Dialog/Dialog";
import Dropdown from "../../Components/Buttons/Dropdown/Dropdown";
import Info from "../../Components/Info/Info";

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
        // ПОЛУЧАЕМ ЗОНЫ, ПОТОМ В ЗАВИСИМОСТИ ОТ ТИПА МЕСТНОСТИ СОЗДАЕМ НОВУЮ ИЛИ ЗАГРУЖАЕМ СТАРУЮ
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
                console.log(this.state.zones);
            }
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
                const zonesConfig = info.list.map((zone) => {
                    return {
                        key: zone.name,
                        caption: zone.name
                            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                            .toUpperCase(),
                        title: "информация про зону " + zone.name,
                        color: zone.color,
                        style: {
                            background: `rgba(${zone.color.r},${zone.color.g},${zone.color.b}, 0.4)`,
                        },
                    };
                });

                this.setState({
                    zones: zonesConfig,
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
        })
            .then((res) => {
                return res.json();
            })
            .then((info) => {
                console.log(info.path);
                return info.path;
            });
    }

    _saveClick() {
        let { screenshot, settings } = this._view.getConfig();

        settings = {
            ...this.state.settings,
            ...settings,
        };

        const config = {
            type: "place",
            name: this.state.name,
            screenshot,
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
        zone.biomeSeed = Math.random() * 1000;

        for (let i = 0; i < 4; i++) {
            const randomZone = this.state.zones[
                Math.floor(Math.random() * this.state.zones.length)
            ];
            neighbors.push(randomZone.color);
        }

        zone.neighbors = neighbors;

        this._updateSettings({ zone });
    }

    render() {
        const style = {
            overlay: configs.styleDialog[this.state.settings.style].overlay,
            dialog: configs.styleDialog[this.state.settings.style].background,
        };

		const infoStyle = {
			position: 'absolute',
			top: '60px',
			left: '10px'
		};

		const infoContent = this.state.settings.zone ? (
			<div className="placeDialog-info">
				Данная панель предназначена для конфигурации вершины местности.<br/><br/>
				Вы можете сменить имя участка - <span>'{this.state.name.replace('places/', '')}'</span> на любое друго. Через '/' указываются директории для участка<br/><br/>
				На местности указываются тип биома и параметры распределения моделей.<br/><br/>
				Например сейчас выбран биом: 
				<div style={{
					display: 'inline-block',
					background: `rgba(${this.state.settings.zone.color.r},${this.state.settings.zone.color.g},${this.state.settings.zone.color.b}, 0.6)`,
					color: '#ffffff', 
					borderRadius: '5px',
					padding: '5px',
					width: 'fit-content'
				}} title={this.state.settings.zone.title}>
					{' ' + this.state.settings.zone.caption}
				</div><br/>
				А также параметры:<br/>
				- Saturation (Насыщенность) - <br/>
				<span className="placeDialog-info__adding">Выражает насколько плотно зона загружена объектами</span><br/>
				- Blur (Размытие) - <br/>
				<span className="placeDialog-info__adding">Выражает насколько сильно будут распределены прикрепленные объекты на соседних зонах</span><br/>
				- Fullness (Заполнение) - <br/>
				<span className="placeDialog-info__adding">Выражает вероятность заполнения зон с этим же биомом, по введенным параметрам.<br/>
					Например: <br/>
					- 0.01 - заполняется одна зона с данным биомом;<br/>
					- 1.0 - заполняются все зоны с данным биомом
				</span><br/><br/>
				Это означает, что на итоговом ландшафте зоны с выбранным типом биома, будут заполнены прикрепленными объектами c выставленными параметрами.<br/><br/>
				Сгенерированный участок ландшафта является лишь упращением. Он предназначен для наглядности параметров и не является конечным результатом.<br/><br/>
			</div>
		) : <div></div>;

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
                        ref={(input) => {
                            this.nameInput = input;
                        }}
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
                        <div style={{width: '100%', height: '100%'}}>
							<Info 
								style={infoStyle}
								content={infoContent}/>
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
