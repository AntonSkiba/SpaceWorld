import React, { PureComponent } from "react";
import "./Vertex.css";

class Vertex extends PureComponent {
    constructor(props) {
        super(props);

        this.startPress = this.startPress.bind(this);
        this.endPress = this.endPress.bind(this);
        this.move = this.move.bind(this);
        this.type = props.config.type; // shape/place/world
    }

    startPress(e) {
        this.startPressTime = Date.now();
        document.addEventListener("mouseup", this.endPress);
        document.addEventListener("mousemove", this.move);
    }

    endPress(e) {
        if (Date.now() - this.startPressTime < 200) {
            this.props.open();
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
        
        this.props.moving(position);
    }

    render() {
        let style = {
            top: this.props.position.y - this.props.size / 2,
            left: this.props.position.x - this.props.size / 2,
            width: this.props.size,
            height: this.props.size,
        };

        if (this.type === 'world') {
            style = {
                ...style,
                ...this.props.config.style,
                background: this.props.config.color
            };
        }

        const imgStyle = this.type !== 'world' && {
            position: "absolute",
            borderRadius: "50%",
            width: "100%",
            height: "100%",
            border: this.props.config.border || `2px solid ${this.props.config.color}`,
            backgroundImage: `url(${this.props.config.screenshot})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
        };

        return (
            <div
                className="vertex"
                style={style}
                onMouseDown={this.startPress}
                onMouseUp={this.endPress}
            >
                {this.type === 'world' && this.props.config.caption}
                {imgStyle && <div style={imgStyle}></div>}
            </div>
        );
    }
}

export default Vertex;
