import React, { Component } from 'react';
import './Dropdown.css';

class Dropdown extends Component {
	constructor(props) {
		super(props);

		this._config = props.config;
		this.state = {
			show: false
		};

		this._toggle = this._toggle.bind(this);
	}

	_toggle() {
		this.setState({
			show: !this.state.show
		});
	}

	_change(item) {
		this._toggle();
		this.props.onChange && this.props.onChange(item);
	}

	render() {
		const selected = this.props.selected || this._config[0];
		const listItems = []; 

		this._config.forEach(item => {
			if (item.key !== selected.key) {
				listItems.push(
					<div
						className="dropdown-item"
						style={item.style}
						key={'dropdown_' + item.key} 
						title={item.title}
						onClick={this._change.bind(this, item)}>
						{item.caption}
					</div>
				);
			}
		});

		const buttonStyle = {
			borderRadius: this.state.show ? '5px 5px 0 0' : '5px',
			...selected.style
		};

		const listStyle = {
			height: this.state.show ? '200px' : '0',
			opacity: this.state.show ? 1 : 0,
		}

		return (
			<div className="dropdown-container">
				<button
					className="dropdown-button"
					style={buttonStyle}
					title={selected.title}
					onClick={this._toggle}>
					{selected.caption}
				</button>
				<div className="dropdown" style={listStyle}>
					{listItems}
				</div>
			</div>
		);
	}
}

export default Dropdown;
