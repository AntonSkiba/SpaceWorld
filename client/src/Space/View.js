import React, { PureComponent } from "react";
import Space from './Space';

/**
 * View - создает новую область для отображения мира
 */
export default class SpaceView extends PureComponent {
	constructor(props) {
		super(props);

		this._space = new Space();
	}

	componentDidMount() {
		this._space.create(this._view);
	}

	componentWillUnmount() {
        this._space.destroy();
    }

	getConfig() {
		const screenshot = this._space.takeScreenshot();
		const settings = this._space.getSettings();

		return {screenshot, settings};
	}

	render() {
		const fillStyle = {
			width: '100%',
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		};

        return (
            <div style={fillStyle} tabIndex="0">
                <div
                    style={fillStyle}
                    ref={(ref) => (this._view = ref)}
                />
            </div>
        );
    }
}