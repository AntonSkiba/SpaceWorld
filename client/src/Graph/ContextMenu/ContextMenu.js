import React, { Component } from 'react';
import './ContextMenu.css';

import Popup from "reactjs-popup";

/**
 * Контекстное меню right-click, позволяет выбрать файл
 */

class ContextMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			width: 250,
			height: 400
		}

		//this._checkFocus = this._checkFocus.bind(this);
	}

	// componentDidMount() {
	// 	document.addEventListener('click', this._checkFocus)
	// }

	// componentWillUnmount() {
	// 	document.removeEventListener('click', this._checkFocus);
	// }

	// _checkFocus(e) {
	// 	const leftFace = this.state.left;
	// 	const rightFace = this.state.left + this.state.width;
	// 	const topFace = this.state.top;
	// 	const bottomFace = this.state.top + this.state.height;
	// 	if (e.clientX < leftFace || e.clientX > rightFace || e.clientY < topFace || e.clientY > bottomFace) {
	// 		this.props.onBlur(e);
	// 	}
	// }

	render() {
		console.log(window.event.offsetX);
		const positionStyle = {
			position: 'absolute',
			width: this.state.width,
			height: this.state.height,
			top: window.event.offsetY,
			left: window.event.offsetX
		};

		const overlayStyle = { background: 'none' };

		return (
			<Popup
				contentStyle={positionStyle}
				open={true}
				onClose={this.props.onClose}
				overlayStyle={overlayStyle}>
                <input 
					name="myFile" 
					type="file"
					accept=".obj"
					onChange={this.props.onLoadShape}></input>
            </Popup>
		);
	}
}

export default ContextMenu;
