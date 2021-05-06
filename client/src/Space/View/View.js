import React, { Component } from 'react';
import Space from '../Space';
import './View.css';

class SpaceView extends Component {
	constructor(props) {
		super(props);

		this._timePhrases = [
			'Time is fleeting',
			'Space oddity',
			'Can you hear me, Major Tom?',
			'Fade to grey',
			'We can be heroes!',
			'Velvet space',
			'Planet Earth is blue'
		];
		
		this.state = {
			
			sun: 217,
			moon: 384000,

			w: false,
			a: false,
			s: false,
			d: false,
			q: false,
			e: false,
			z: false,
			x: false,

			time: null,

			pause: false
		};

		this._control = this._control.bind(this);
		this._keyup = this._keyup.bind(this);
		this._timeControl = this._timeControl.bind(this);

		this._space = new Space(props.graph, this.state.sun, this.state.moon, this._timeControl);
	}

	componentDidMount() {
		this._space.create(this._view);

		document.addEventListener('keydown', this._control);
		document.addEventListener('keyup', this._keyup);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this._control);
		document.removeEventListener('keyup', this._keyup);
		this._space.destroy();
	}

	_keyup(event) {
		if (event.code === 'KeyZ') this.setState({z: false});
		if (event.code === 'KeyX') this.setState({x: false});
		if (event.code === 'KeyQ') this.setState({q: false});
		if (event.code === 'KeyE') this.setState({e: false});
		if (event.code === 'KeyW') this.setState({w: false});
		if (event.code === 'KeyA') this.setState({a: false});
		if (event.code === 'KeyS') this.setState({s: false});
		if (event.code === 'KeyD') this.setState({d: false});
	}

	_timeControl(timeType, timeValue, localeValue) {
		if (timeType === 'phrase' && !this._timePhrases.includes(this.state.time)) {
			this.setState({
				time: this._timePhrases[Math.floor(Math.random() * this._timePhrases.length)]
			});
		} else if (timeType === 'time') {
			const locale = Math.floor(localeValue * 24) - 8;
			const all = timeValue * 24 * 60 * 60;
			let hour = (Math.floor(all / (60 * 60) + locale) % 24).toString();
			let min = (Math.floor(all / 60) % 60).toString();
			let sec = (Math.floor(all) % 60).toString();

			if (hour < 10) {
				hour = '0' + hour;
			}
			if (min < 10) {
				min = '0' + min;
			}
			if (sec < 10) {
				sec = '0' + sec;
			}

			this.setState({
				time: `Time: ${hour}:${min}:${sec}`
			});
		}
	}

	_control(event) {
		if (event.code === 'Space') {
			this._space.toggle();

			this.setState({
				pause: !this.state.pause
			});
		}

		if (event.code === 'KeyQ' || event.code === 'KeyE') {
			let added;

			let speed = this.state.sun;

			added = Math.floor(speed / 100);

			if (!added) added = 1;

			speed += event.code === 'KeyE' ? added : -added;
			if (speed > 9999999) {
				speed = 9999999;
			} else if (speed < 0) {
				speed = 0;
			} else {
				this._space.acceleration(speed);
			}

			this.setState({sun: speed});
		}

		if (event.code === 'KeyZ' || event.code === 'KeyX') {
			let distance = this.state.moon;

			distance += event.code === 'KeyX' ? 1000 : -1000;
			if (distance > 1000000) {
				distance = 1000000;
			} else if (distance < 1000) {
				distance = 1000;
			} else {
				this._space.moonDistance(distance);
			}

			this.setState({moon: distance});
		}

		if (event.code === 'KeyZ') this.setState({z: true});
		if (event.code === 'KeyX') this.setState({x: true});
		if (event.code === 'KeyQ') this.setState({q: true});
		if (event.code === 'KeyE') this.setState({e: true});
		if (event.code === 'KeyW') this.setState({w: true});
		if (event.code === 'KeyA') this.setState({a: true});
		if (event.code === 'KeyS') this.setState({s: true});
		if (event.code === 'KeyD') this.setState({d: true});
	}

	render() {

		return (
			<div className="space">
				<div className="space-header">
					<div className="space-header__keys">
						<div className="space-header__keys-name">Movement</div>
						<div className={'space-header__keys-item' + (this.state.w ? ' active': '')}>W</div>
						<div className={'space-header__keys-item' + (this.state.a ? ' active': '')}>A</div>
						<div className={'space-header__keys-item' + (this.state.s ? ' active': '')}>S</div>
						<div className={'space-header__keys-item' + (this.state.d ? ' active': '')}>D</div>

						<div className="space-header__keys-name">Pause</div>
						<div className={'space-header__keys-item' + (this.state.pause ? ' active': '')}>Space</div>

						<div className="space-header__keys-name">Sun</div>
						<div className={'space-header__keys-item' + (this.state.q ? ' active': '')}>Q &darr;</div>
						<div className={'space-header__keys-item' + (this.state.e ? ' active': '')}>E &uarr;</div>
						<div className="space-header__info-name__added">{this.state.sun} km/s</div>

						<div className="space-header__keys-name">Moon</div>
						<div className={'space-header__keys-item' + (this.state.z ? ' active': '')}>Z &darr;</div>
						<div className={'space-header__keys-item' + (this.state.x ? ' active': '')}>X &uarr;</div>
						<div className="space-header__info-name__added">{this.state.moon} km</div>
					</div>

					<div className="space-header__info">
						<div className="space-header__info-name">{this.state.time}</div>
					</div>

				</div>
				<div className="space-view" ref={(view) => {this._view = view}}/>
			</div>
		);
	}
}

export default SpaceView;
