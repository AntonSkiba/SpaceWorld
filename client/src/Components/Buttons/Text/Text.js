import React, { Component } from 'react';
import './Text.css';

class Text extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="text">
				<div className="text-caption">{this.props.caption}</div>
				<div className="text-input">
					<input
						className="text-input__field"
						type="text"
						size="40"
						value={this.props.value}
						onChange={this.props.onChange}
						onBlur={this.props.onOut}/>
				</div>
			</div>
		);
	}
}

export default Text;
