import React, { Component } from 'react';
import './Switch.css';

class Switch extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);

		this.list = [];
		for (const key in props.config) {
			const order = props.config[key].order || this.list.length;
			this.list[order] = key;

			if (key === props.selected) {
				this.current = this.list.length - 1;
			}
		}

		this.list = this.list.filter((key) => !!key);
	}

	onClick(e) {
		this.current++;
		if (this.current === this.list.length) {
			this.current = 0;
		}
		this.props.onToggle(e, this.list[this.current]);
	}

	render() {
		return (
			<div className={'switch-container ' + this.props.className}>
				<button
					title={this.props.title}
					tabIndex="-1"
					disabled={this.props.disabled}
					onClick={this.onClick}
					className='switch'
					style={this.props.config[this.props.selected].style}>
					{this.props.config[this.props.selected].text}
				</button>
			</div>
		);
	}
}

Switch.defaultProps = {
	className: '',
	title: '',
	disabled: false
}

export default Switch;

