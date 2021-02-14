import React, { PureComponent } from "react";
import "./Vertex.css";
import configs from "../configs";

import Loader from "../../Components/Loader/Loader";

class Vertex extends PureComponent {
    constructor(props) {
        super(props);

        this.startPress = this.startPress.bind(this);
        this.endPress = this.endPress.bind(this);
        this.move = this.move.bind(this);
    }

    componentDidMount() {
        if (this.props.status === "new") {
			//const formData = new FormData();

            this.shapeFetch("upload", {
				method: "POST",
				headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: this.props.config.name,
                    screenshot: this.props.config.screenshot,
                    settings: this.props.config.settings
                }),
            }).then(res => {
                if (res.path) {
                    console.log(res.path);
                    this.props.changeVertex({
                        status: 'loaded',
                        path: res.path
                    });
                }
            });
        }
    }

    componentDidUpdate() {
        if (this.props.status === "update") {
            this.shapeFetch("upload", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: this.props.path,
                    name: this.props.config.name,
                    screenshot: this.props.config.screenshot,
                    settings: this.props.config.settings
                }),
            }).then(res => {
                if (res.path) {
                    console.log(res.path);
                    this.props.changeVertex({status: 'loaded'});
                }
            });
        }
    }

    shapeFetch(action, data) {
        return fetch(`/api/shape/${action}`, data).then((res) => {
            return res.json();
        });
    }

    startPress(e) {
        this.startPressTime = Date.now();
        document.addEventListener("mouseup", this.endPress);
        document.addEventListener("mousemove", this.move);
    }

    endPress(e) {
        if (Date.now() - this.startPressTime < 200) {
            this.props.openShape()
        }
        document.removeEventListener("mouseup", this.endPress);
        document.removeEventListener("mousemove", this.move);
    }

    move(e) {
        e = e || window.event;
        const position = {
            y: e.clientY,
            x: e.clientX,
        }
        //this.setState({position});
        this.props.changeVertex({position});
    }

    render() {
        const loading = ['new', 'update'].includes(this.props.status);

        let style = {
            top: this.props.position.y - this.props.size / 2,
            left: this.props.position.x - this.props.size / 2,
            width: this.props.size,
            height: this.props.size,
        };

        if (this.props.text) {
            style = {
                ...style,
                ...this.props.text.style,
            };
            // content = <div style={textStyle}>{this.state.text.caption}</div>
        }

        let imgStyle;
        if (this.props.config) {
            imgStyle = {
                position: "absolute",
                borderRadius: "50%",
                width: "100%",
                height: "100%",
                zIndex: -1,
                border: `2px solid ${
                    configs.styleDialog[this.props.config.settings.style].background
                }`,
                backgroundImage: `url(${this.props.config.screenshot})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            };
        }

        return (
            <div
                className="vertex"
                style={style}
                onMouseDown={this.startPress}
                onMouseUp={this.endPress}
            >
                {loading && (
                    <Loader
                        size={this.props.size}
                        color={
                            configs.styleDialog[this.props.config.settings.style]
                                .background
                        }
                        opacity="0.8"
                        weight="10px"
                    />
                )}
                {this.props.text && this.props.text.caption}
                {imgStyle && <div style={imgStyle}></div>}
            </div>
        );
    }
}

export default Vertex;
