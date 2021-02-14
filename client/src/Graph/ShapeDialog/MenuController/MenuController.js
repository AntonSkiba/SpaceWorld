import React, { Component } from 'react';
import './MenuController.css';

import Menu from './Menu/Menu';


class MenuController extends Component {
	constructor(props) {
		super(props);

		this.state = {
			menu: null
		}
	}

	toggleMenu(menu, e) {
		this.setState({
			menu: this.state.menu !== menu ? menu : null 
		});
	}

	render() {
		const panel = {
			position: 'absolute',
			transition: '0.4s ease',
			left: this.state.menu ? 'calc(100% - 262px)' : 'calc(100% - 62px)',
			width: '60px'
		};

		return (
			<div className="menuController" style={panel}>
				<div className="menuController-buttons">
					<div
						title="Object view settings"
						onClick={this.toggleMenu.bind(this, 'settings')}
						className={'menuController-buttons__item' + (this.state.menu === 'settings' ? ' selected': '')}>
						<div className="menuController-buttons__item-image" style={{backgroundImage: "url('/icons/cube.png')"}}/>
					</div>
					<div
						title="Settings for landscape"
						onClick={this.toggleMenu.bind(this, 'world')}
						className={'menuController-buttons__item' + (this.state.menu === 'world' ? ' selected': '')}>
						<div className="menuController-buttons__item-image" style={{backgroundImage: "url('/icons/world.png')"}}/>
					</div>
				</div>
				<Menu
					settings={this.props.settings}
					menu={this.state.menu}
					onUpdateSettings={this.props.onUpdateSettings}
					cancelClick={this.props.cancelClick}
					saveClick={this.props.saveClick}/>
			</div>
		);
	}
}

export default MenuController;
