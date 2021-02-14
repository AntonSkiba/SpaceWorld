import React, { Component } from 'react';
import './Number.css';

class Number extends Component {
	render() {
		return (
			<div className={'number-container ' + this.props.className} title={this.props.title}>
				<div style={{flexShrink: 0}}>{this.props.caption}</div>

				<input
					type="number"
					className="number"
					min={this.props.min}
					max={this.props.max}
					step={this.props.step}
					onChange={this.props.onChange}
					value={this.props.value}/>
			</div>
		);
	}
}

Number.defaultProps = {
	caption: 'Value:',
	title: '',
	className: '',
	disabled: false,
	step: '1'
}

export default Number;
