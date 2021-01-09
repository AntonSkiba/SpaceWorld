import React, { Component } from "react";
import "./ShapeDialog.css";

import Popup from "reactjs-popup";
import ObjectView from "./ObjectView/ObjectView";

class ShapeDialog extends Component {
	constructor(props) {
		super(props);

		const fullName = this.props.shape.name.split('.');
		const ext = '.' + fullName.pop();
		const name = fullName.join('.');

		this.state = {
			name,
			ext
		}

		this.onChangeName = this.onChangeName.bind(this);
	}

	onChangeName(e) {
		this.setState({
			name: e.target.value
		});
	}

    render() {
        return (
			<Popup 
				modal
				className="shapeDialog"
				open={true}
				closeOnEscape={false}
				closeOnDocumentClick={false}>
                <div className="shapeDialog-header">
					<input
						ref={(input) => { this.nameInput = input; }} 
						className="shapeDialog-header__name"
						onChange={this.onChangeName}
						type="text"
						size="40"
						value={this.state.name}
						placeholder='Введите название...'/>
				</div>
				<div className="shapeDialog-main">
					<div className="shapeDialog-main__view">
						<ObjectView shape={this.props.shape}/>
					</div>
					<div>menu</div>
				</div>
            </Popup>
        );
    }
}

export default ShapeDialog;
