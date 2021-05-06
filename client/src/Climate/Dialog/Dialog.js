import React, { Component } from 'react';
import './Dialog.css';

class ClimateDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false
		};

        this._overlayClick = this._overlayClick.bind(this);
		this._dialogClick = this._dialogClick.bind(this);

	}

	_dialogClick() {
		if (!this.state.open) {
			this._animate();
			this.setState({open: true});
			this.props.toggle(true);
		}
	}

	_overlayClick(e) {
        if (e.target.className === "climate-overlay" && this.state.open) {
            this._animate('reverse');
			this.setState({open: false});
			this.props.toggle(false);
        }
    }

	_animate(direction = 'normal') {
		const time = {
			direction,
			duration: 600,
			easing: 'ease-in-out',
			fill: 'both'
		}

		this._overlay.animate({
			zIndex: [1, 99],
			borderRadius: ['16px', '0px'],
			top: ['20px', '0px'],
			left: ['20px', '0px'],
			width: ['100px', '100%', '100%'],
			height: ['100px', '100%', '100%']
		}, time);

		this._dialog.animate({
			borderRadius: ['16px', '40px'],
			width: ['100px', '520px'],
			height: ['100px', '520px']
		}, time);

		this._body.animate({
			padding: ['0px', '16px'],
			height: ['100%', 'auto'],
			width: ['100%', 'auto']
		}, time);

		this._image.animate({
			width: ['100px', '360px'],
			height: ['100px', '360px']
		}, time);
	}

	render() {
		const color = { r: 11, g: 25, b: 73 };

        const dialog = {
            background: `rgb(${color.r}, ${color.g}, ${color.b})`,
        };

        const overlay = {
            background: `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`,
        };

		const image = {
			backgroundImage: `url(${this.props.image})`
		};

		return (
			<div
				className={'climate-overlay' + (!this.state.open ? ' climate-closed' : '')}
				ref={(overlay) => {this._overlay = overlay;}}
				style={overlay}
				onClick={this._overlayClick}>
				<div
					ref={(dialog) => this._dialog = dialog}
					onClick={this._dialogClick}
					style={dialog}
					className="climate">
					<div className="climate-header climate-full">Climate</div>
					<div
						className="climate-body"
						ref={(body) => {this._body = body;}}>
						<div className="climate-body__row climate-full">Климатическая карта будущей планеты.</div>
						<div className="climate-body__image-row">
							<div className="climate-full climate-body__image-temperature">
								<div className="climate-body__image-name">Temperature</div>
								<div className="climate-body__image-values">
									<div>50 C&deg;</div>
									<div>25 C&deg;</div>
									<div>0 C&deg;</div>
									<div>-25 C&deg;</div>
									<div>-50 C&deg;</div>
								</div>
							</div>
							<div
								ref={(image) => {
									this._image = image;
								}}
								className="climate-body__image"
								style={image}></div>
						</div>
						<div className="climate-full climate-body__image-humidity">
								<div className="climate-body__image-values">
									<div>0 %</div>
									<div>25 %</div>
									<div>50 %</div>
									<div>75 %</div>
									<div>100 %</div>
								</div>
								<div className="climate-body__image-name">Humidity</div>
							</div>
						
					</div>
					
				</div>
			</div>
			
		);
	}
}

export default ClimateDialog;
