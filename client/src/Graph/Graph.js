import React, { Component } from 'react';
import './Graph.css';

import ContextMenu from './ContextMenu/ContextMenu';
// import {LoadShape} from './helpers/LoadShape';
import ShapeDialog from './ShapeDialog/ShapeDialog';

/**
 * Основной компонент графа
 */

class Graph extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showMenu: false,
			shape: null
		}

		this._onLoadShape = this._onLoadShape.bind(this);
	}

	_onLoadShape(e) {
		// LoadShape(e.target.files[0]);
		this._toggleContextMenu.call(this, false, e);
		this.setState({
			shape: e.target.files[0]
		});
	}

	_toggleContextMenu(showMenu, e) {
		e?.preventDefault();

		if (this.state.showMenu !== showMenu && !this.state.shape) {
			this.setState({
				showMenu
			});
		}
	}

	render() {

		return (
			<div 
				className="graph"
				onContextMenu={this._toggleContextMenu.bind(this, true)}>
				{this.state.showMenu && 
				<ContextMenu
					onLoadShape={this._onLoadShape}
					onClose={this._toggleContextMenu.bind(this, false)}/>}
				{this.state.shape &&
				<ShapeDialog shape={this.state.shape}/>}
			</div>
		);
	}
}

export default Graph;
