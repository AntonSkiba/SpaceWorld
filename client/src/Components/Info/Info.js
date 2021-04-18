import React, { Component } from 'react';
import './Info.css';

class Info extends Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
		};

		this._waitingClose = false;

		this._toggle = this._toggle.bind(this);
		this._enter = this._enter.bind(this);
		this._leave = this._leave.bind(this);
	}

	_enter() {
		this._waitingClose = false;
		this._toggle(true);
	}

	_leave() {
		this._waitingClose = true;
		setTimeout(() => {
			if (this._waitingClose) {
				this._toggle(false);
			}
		}, 500);
	}

	_toggle(status) {
		let show = !this.state.show;

		if (typeof status === 'boolean') {
			show = status;
		}

		this.setState({show});
	}

	render() {
		const content = this.props.content || (<div>Info content</div>);
		const width = 400;
		const height = 160;

		const infoStyle = {
			width: !this.state.show ? '40px' : `${width}px`,
			height: !this.state.show ? '40px' : `${height + 40}px`,
			...this.props.style
		}

		const infoBodyStyle = {
			width: `${width - 10}px`,
			height: `${height - 10}px`
		}

		return (
			<div 
				className={'info ' + this.props.className}
				style={infoStyle}
				// onMouseLeave={this._leave}
				// onMouseEnter={this._enter}>
				>
				<div className="info-header">
					<div
						onClick={this._toggle}
						className="info-header__icon"
						style={{backgroundImage: "url('/icons/eye-white.png')"}}/>
					<div className="info-header__caption">Information</div>
				</div>
				<div className="info-body" style={infoBodyStyle}>
					{content}
				</div>
			</div>
		);
	}
}

export default Info;
