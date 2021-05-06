import React, { Component } from "react";
import './Edge.css'

class Edge extends Component {
    render() {
        const f = this.props.from.position;
        const t = this.props.to.position;

        const center = {
            x: (f.x + t.x) / 2,
            y: (f.y + t.y) / 2,
        };

		const normVector = {
			x: t.x - f.x,
			y: t.y - f.y,
			sign: t.y - f.y < 0 ? -1 : 1
		};
		
		const cosAngle = normVector.sign * normVector.x / Math.sqrt(Math.pow(normVector.x, 2) + Math.pow(normVector.y, 2));

        const angle = 180 * Math.acos(cosAngle) / Math.PI;

		const distance = this.props.distance;
		const alpha = 1 - 3 * distance / window.innerWidth;

        const container = {
            top: center.y,
            left: center.x,
			transform: `rotate(${angle}deg)`,
			width: `${distance}px`,
			marginLeft: `${-distance/2}px`,
        };

		const edge = {
			background: `linear-gradient(${normVector.sign * 90}deg, ${this.props.from.color}, ${this.props.to.color})`,
			opacity: `${this.props.potential ? alpha : 0.8}`
		}

        return (
			<div className="edge-container" style={container} onClick={this.props.onSet} onDoubleClick={this.props.onUnset}>
				<div className={'edge edge__' + (this.props.potential ? 'potential' : 'fixed')} style={edge}></div>
			</div>
		);
    }
}

export default Edge;
