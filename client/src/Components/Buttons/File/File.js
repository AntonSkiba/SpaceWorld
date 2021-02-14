import React, { Component } from 'react';
import './File.css';

class InputFile extends Component {
	render() {
		return (
			<div className="file-container" title={this.props.title}>
				<label htmlFor="file" className={'file ' + this.props.className}>
					<div>{this.props.caption}</div>
				</label>
				<input
					id="file"
					className="file-input"
					type="file"
					accept={this.props.accept}
					onChange={this.props.onChange}/>
			</div>
		);
	}
}

InputFile.defaultProps = {
	caption: 'Upload file',
	title: '',
	className: '',
	disabled: false
}

export default InputFile;
