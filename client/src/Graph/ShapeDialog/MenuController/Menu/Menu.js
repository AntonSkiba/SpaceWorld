import React, { Component } from 'react';
import './Menu.css';

import configs from '../../../configs';
import Switch from '../../../../Components/Buttons/Switch/Switch';
import Number from '../../../../Components/Buttons/Number/Number';
import Simple from '../../../../Components/Buttons/Simple/Simple';

class Menu extends Component {
	constructor(props) {
		super(props);

		this.toggleStand = this.toggleStand.bind(this);
		this.toggleStyle = this.toggleStyle.bind(this);
		this.scaleObject = this.scaleObject.bind(this);
	}

	toggleStand(e, stand) {
		this.updateSettings({stand});
	}

	toggleStyle(e, style) {
		this.updateSettings({style});
	}

	scaleObject(e) {
		this.updateSettings({scale: e.target.value});
	}

	updateSettings(settings) {
		this.props.onUpdateSettings(settings)
	}

	render() {
		const style = {
			position: 'absolute',
			transition: '0.4s ease',
			left: 'calc(100% + 2px)',
			width: this.props.menu ? '190px' : '0',
			backgroundColor: this.props.menu ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
			height: '539px',
			opacity: this.props.menu ? 1 : 0,
			padding: '5px'
		};

		let menuBody = <div className="menu" style={style}></div>

		if (this.props.menu === 'settings') {
			const standSwitchConfig = configs.standButton;
			const styleSwitchConfig = configs.styleButton;
			
			menuBody = 
			<div className="menu-body">
				<Switch selected={this.props.settings.stand} onToggle={this.toggleStand} config={standSwitchConfig}/>
				<Switch selected={this.props.settings.style} onToggle={this.toggleStyle} config={styleSwitchConfig}/>
				<Number value={this.props.settings.scale} caption="Scale:" step="0.01" min="0.01" onChange={this.scaleObject} title="Измените размер модели"/>
			</div>
		}

		if (this.props.menu === 'world') {
			menuBody = 
			<div className="menu-body">
				WORLD
			</div>
		}

		if (this.props.menu === 'space') {
			menuBody = 
			<div className="menu-body">
				Space
			</div>
		}

		const menuFooter =
		<div className="menu-footer">
			<Simple hoveredEffect="glow" title="Cancel" onClick={this.props.cancelClick}>
				<div className="menu-footer__item-image" style={{backgroundImage: "url('/icons/cancel.svg')"}}/>
			</Simple>
			<Simple hoveredEffect="glow" title="Save all" onClick={this.props.saveClick}>
				<div className="menu-footer__item-image" style={{backgroundImage: "url('/icons/tick.svg')"}}/>
			</Simple>
		</div>

		return (
			<div className="menu" style={style}>
				{menuBody}
				{menuFooter}
			</div>
		);
	}
}

export default Menu;
