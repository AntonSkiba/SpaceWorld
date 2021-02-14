import React, { Component } from 'react';
import './Simple.css';

class Simple extends Component {
	render() {
		return (
			<div className={'simple-container ' + this.props.className}>
				<button
					title={this.props.title}
					tabIndex="-1"
					disabled={this.props.disabled}
					onClick={this.props.onClick}
					className={'simple simple-' + this.props.hoveredEffect}
					style={this.props.style}>
					{this.props.children}
				</button>
			</div>
		);
	}
}

Simple.defaultProps = {
	className: '',
	title: '',
	disabled: false,
	hoveredEffect: 'default'
}

export default Simple;
