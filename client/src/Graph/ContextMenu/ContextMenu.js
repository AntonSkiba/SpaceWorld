import React, { Component } from 'react';
import './ContextMenu.css';

class ContextMenu extends Component {
	constructor(props) {
		super(props);

		this.contextMenu = React.createRef();
	}

	componentDidMount() {
		this.contextMenu.current.focus();
	}

	render() {
		const positionStyle = {
			top: window.event.clientY,
			left: window.event.clientX
		};

		return (
			<div
				ref={this.contextMenu}
				tabIndex={-1}
				className="contextMenu"
				style={positionStyle}
				onBlur={this.props.onBlur}>
				
			</div>
		);
	}
}

export default ContextMenu;
