import React, { Component } from 'react';
import './Slider.css';

class Slider extends Component {
	render() {
		const color = `hsl(${360*this.props.value}, 100%, 87%)`;

		return (
			<div className='slider-container'>
				<div className="slider-caption">{this.props.caption + ' - '}<span style={{color}}>{this.props.value}</span></div>
				<input
					type="range"
					className="slider"
					min={this.props.min}
					max={this.props.max}
					step={this.props.step}
					onChange={this.props.onChange}
					value={this.props.value}/>
			</div>
		);
	}
}

Slider.defaultProps = {
	caption: 'Value',
	min: -100,
	max: 100,
	step: 1,
	title: '',
	className: '',
	disabled: false
}

export default Slider;
