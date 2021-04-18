import React, { Component } from "react";
import "./Menu.css";

import Simple from '../../Buttons/Simple/Simple';

class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            menu: null,
            idx: null,
        };
    }

    _toggleMenu(menu, idx, e) {
        this.setState({
            menu: this.state.menu !== menu ? menu : null,
            idx: this.state.menu !== menu ? idx : null,
        });
    }

    render() {
        const panelStyle = {
            left: this.state.menu ? "calc(100% - 262px)" : "calc(100% - 62px)",
        };

		const menuStyle = {
			width: this.state.menu ? '190px' : '0',
			backgroundColor: this.state.menu ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
			opacity: this.state.menu ? 1 : 0,
		}

        const buttons = this.props.config.map((item, idx) => {
            return (
                <div
                    key={item.tab.key}
                    title={item.tab.title}
                    onClick={this._toggleMenu.bind(
                        this,
                        item.tab.key,
                        idx
                    )}
                    className={
                        "menu-controller__buttons-item" +
                        (this.state.menu === item.tab.key ? " selected" : "")
                    }
                >
                    <div
                        className="menu-controller__buttons-item__image"
                        style={{
                            backgroundImage: `url('/icons/${item.tab.icon}')`,
                        }}
                    />
                </div>
            );
        });

        const footer = (
            <div className="menu-footer">
                <Simple hoveredEffect="glow" title="Cancel" onClick={this.props.cancelClick} >
                    <div className="menu-footer__item-image" style={{ backgroundImage: "url('/icons/cancel.svg')" }} />
                </Simple>
                <Simple hoveredEffect="glow" title="Save all" onClick={this.props.saveClick} >
                    <div className="menu-footer__item-image" style={{ backgroundImage: "url('/icons/tick.svg')" }} />
                </Simple>
            </div>
        );

		const body = (
			<div className="menu-body">
				{typeof this.state.idx === 'number' && this.props.config[this.state.idx].content}
			</div>
		);

        return (
            <div className="menu-controller" style={panelStyle}>
                <div className="menu-controller__buttons">{buttons}</div>
				<div className="menu" style={menuStyle}>
					{body}
					{footer}
				</div>
            </div>
        );
    }
}

export default Menu;
