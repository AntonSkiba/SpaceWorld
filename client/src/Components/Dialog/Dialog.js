import React, { Component } from "react";
import "./Dialog.css";

import Menu from './Menu/Menu';

class Dialog extends Component {
    constructor(props) {
        super(props);

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
        const style = this.props.style;

        const overlayStyle = {
            backgroundColor: style.overlay,
        };
        const dialog = {
            backgroundColor: style.dialog,
        };

        return (
            <div
                className="dialog-overlay"
                style={overlayStyle}
                ref={(overlay) => {
                    this._overlay = overlay;
                }}
            >
                <div
                    className="dialog"
                    style={dialog}
                    ref={(dialog) => {
                        this._dialog = dialog;
                    }}
                >
                    <div className="dialog-header">{this.props.header}</div>
                    <div className="dialog-body">
                        {this.props.view}
                        <Menu
                            config={this.props.menu}
                            cancelClick={this.props.cancelClick}
                            saveClick={this.props.saveClick}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Dialog;
