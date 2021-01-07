import React, { Component } from 'react';
import ContextMenu from './ContextMenu/ContextMenu';
import './Graph.css';



class Graph extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showMenu: false
		}
	}

	_toggleContextMenu(showMenu, e) {
		e.preventDefault();

		if(this.state.showMenu !== showMenu) {
			console.log(showMenu);
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
					onBlur={this._toggleContextMenu.bind(this, false)}/>}
			</div>
		);
	}
}

export default Graph;
