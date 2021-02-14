import React, { Component } from 'react';
import './ContextMenu.css';

import InputFile from '../../Components/Buttons/File/File';

/**
 * Контекстное меню right-click, позволяет выбрать файл
 */

class ContextMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			width: this.props.width,
			height: this.props.height
		}

		if (this.props.animation) {
			this.animation = {
				show: {
					transform: 'translate(0px, 0px) scale(1)',
					opacity: 1
				},
				close: {
					transform: `translate(${-this.props.width/2}px, ${-this.props.height/2}px) scale(0)`,
					opacity: 1
				},
				time: {
					duration: this.props.animation.time,
					easing: 'ease-in-out',
					fill: 'both'
				}
			}
		}

		this._checkClosing = this._checkClosing.bind(this);
	}

	componentDidMount() {
		if (this.animation) {
			this.popup.animate([this.animation.close, this.animation.show], this.animation.time);
		}
	}

	_checkClosing(e) {
		if (e.target.className === 'contextMenu-overlay') {
			if (this.animation) {
				this.popup.animate([{transform: 'scale(1)'}, {transform: 'scale(0)'}], this.animation.time);
				setTimeout(() => {
					this.props.onClose(e);
				}, this.animation.time.duration)
			} else {
				this.props.onClose(e);
			}
		}
	}

	render() {
		const contentStyle = {
			width: this.state.width,
			height: this.state.height,
			transition: '0.2s ease',
			top: this.props.top,
			left: this.props.left,
		};

		return (
			<div className="contextMenu-overlay" onClick={this._checkClosing}>
				<div
					style={contentStyle}
					className="contextMenu"
					ref={(popup) => { this.popup = popup; }}>
					
					<InputFile caption="Upload 3D model" onChange={this.props.onLoadShape} />
				</div>
			</div>
			
		);
	}
}

export default ContextMenu;
