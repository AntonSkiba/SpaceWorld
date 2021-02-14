import React, { Component } from "react";
import "./Loader.css";

class Loader extends Component {
    render() {
        const loaderStyle = {
            width: this.props.size,
            height: this.props.size,
            opacity: this.props.opacity,
        };

        const elemStyle = {
            border: `${this.props.weight} solid`,
            borderColor: `${this.props.color} transparent transparent transparent`,
		};

        return (
            <div className="loader-container">
                <div className="loader" style={loaderStyle}>
                    <div style={elemStyle}></div>
                    <div style={elemStyle}></div>
                    <div style={elemStyle}></div>
                    <div style={elemStyle}></div>
                </div>
                {this.props.status && (
                    <div className="loader-status" style={this.props.statusStyle}>
                        {this.props.status}
                    </div>
                )}
            </div>
        );
    }
}

Loader.defaultProps = {
    size: "100px",
    weight: "10px",
    color: "#ffffff",
    opacity: "1.0",
};

export default Loader;
