import React, { Component } from "react";
import Info from "../../Components/Info/Info";

class PlaceInfo extends Component {
    render() {
        const settings = this.props.settings;
        const name = this.props.name;

        const style = {
            position: "absolute",
            top: "60px",
            left: "10px",
        };

        const neighborsChecked = [];
        const neighborsFiltered = settings.zone.neighbors.filter(
            (neighbor) => {
                const result =
                    neighbor.key !== settings.zone.key &&
                    !neighborsChecked.includes(neighbor.key);

                neighborsChecked.push(neighbor.key);
                return result;
            }
        );

        const neighbors = neighborsFiltered.map(
            (neighbor) => {
                return (
                    <div
                        key={`info_neighbor_${neighbor.key}`}
                        className="placeDialog-info__biome"
                        style={{
                            background: `rgba(${neighbor.color.r},${neighbor.color.g},${neighbor.color.b}, 0.6)`,
                        }}
                    >
                        {" " + neighbor.caption}
                    </div>
                );
            }
        );

        return (
            <Info
                style={style}
                content={
                    <div className="placeDialog-info">
                        Данная панель предназначена для конфигурации вершины
                        местности.
                        <br />
                        <br />
                        Вы можете сменить имя участка -{" "}
                        <span>
                            '{name.replace("places/", "")}'
                        </span>{" "}
                        на любое другое. Через '/' указываются директории для
                        участка
                        <br />
                        <br />
                        На местности указываются тип биома и параметры
                        распределения моделей.
                        <br />
                        <br />
                        Например сейчас выбран биом:
                        <div
                            className="placeDialog-info__biome"
                            style={{
                                background: `rgba(${settings.zone.color.r},${settings.zone.color.g},${settings.zone.color.b}, 0.6)`,
                            }}
                            title={settings.zone.title}
                        >
                            {" " + settings.zone.caption}
                        </div>
                        <br />
                        Для него соседями сгенерированы:
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {neighbors}
                        </div>
                        А также параметры:
                        <br />- Clustering (Кластеризация) -{" "}
                        {settings.clustering}
                        <br />
                        <span className="placeDialog-info__adding">
                            Выражает степень группировки объектов для этой зоны.
                        </span>
                        <br />- Saturation (Насыщенность) -{" "}
                        {settings.saturation}
                        <br />
                        <span className="placeDialog-info__adding">
                            Выражает насколько плотно зона загружена объектами.
                        </span>
                        <br />- Chaotic (Хаотичность) - {settings.chaotic}
                        <br />
                        <span className="placeDialog-info__adding">
                            Выражает насколько сильно будут смещены зоны и повернуты объекты внутри зоны.
                        </span>
                        <br />- Fullness (Заполнение) -{" "}
                        {settings.fullness}
                        <br />
                        <span className="placeDialog-info__adding">
                            Выражает уровень заполненности зоны.
                            <br />
                        </span>
                        <br />
                        <br />
                        Это означает, что на итоговом ландшафте зоны с выбранным
                        типом биома, будут заполнены прикрепленными объектами c
                        выставленными параметрами.
                        <br />
                        <br />
                        Сгенерированный участок ландшафта является лишь
                        упращением. Он предназначен для наглядности параметров и
                        не является конечным результатом.
                        <br />
                        <br />
                    </div>
                }
            />
        );
    }
}

export default PlaceInfo;
