import React, { Component } from 'react';
import './ObjectView.css';

import * as THREE from 'three';
import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Loader from '../../../Components/Loader/Loader';

/**
 * Панель характеристик объекта с самим трехмерным объектом
 */
class ObjectView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true
		}

		this.THREE =
		this.startAnimationLoop = this.startAnimationLoop.bind(this);
	}

	// У МЕНЯ ЕСТЬ ГОТОВЫЙ ФАЙЛ НА РУКАХ, НО Я НЕ МОГУ ЕГО ОТРИСОВАТЬ, СЕРЬЕЗНО ЧТО ЛИ
	componentDidMount() {
		const shapeReader = new FileReader();
		shapeReader.onload = () => {
			const shapeLoader = new OBJLoader();
			shapeLoader.load(shapeReader.result, (shape) => {
				this.setState({
					loading: false
				});
				console.log(shape);

				this.sceneSetup();
				this.lightsSetup();
				this.shapeSetup(shape);

				this.startAnimationLoop();
			})
		}
		shapeReader.readAsDataURL(this.props.shape);
	}

	componentWillUnmount() {
		window.cancelAnimationFrame(this.requestID);
		this.controls.dispose();
	}

	sceneSetup() {
		const width = this.view.clientWidth;
		const height = this.view.clientHeight;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x000000);

		this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 10000);
		this.camera.position.z = 450;
		this.camera.position.x = -300;
		this.camera.position.y = 450;

		this.controls = new OrbitControls(this.camera, this.view);
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(width, height);
        this.view.appendChild(this.renderer.domElement);
	}

	lightsSetup() {
		const sphere = new THREE.SphereBufferGeometry( 14, 16, 16 );

		this.light1 = new THREE.PointLight( 0xffffff, 2, 700 );
		this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
		this.scene.add( this.light1 );

		this.light2 = new THREE.PointLight( 0xffffff, 2, 700 );
		this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
		this.scene.add( this.light2 );

		this.light3 = new THREE.PointLight( 0xffffff, 2, 700 );
		this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
		this.scene.add( this.light3 );

		this.light4 = new THREE.PointLight( 0xffffff, 2, 700 );
		this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
		this.scene.add( this.light4 );
	}

	shapeSetup(shape) {
		// Объект
		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			shininess: 10
		});

		shape.traverse(shapeChild => {
			if (shapeChild instanceof THREE.Mesh) {
				shapeChild.material = material;
			}
		});

		this.scene.add(shape);

		// хелперы
		const grid = new THREE.GridHelper(10000, 999);
		this.scene.add(grid);


	}

	startAnimationLoop() {
		const time = Date.now() * 0.0005;

		this.light1.position.x = Math.sin( time * 0.7 ) * 300;
		this.light1.position.y = Math.cos( time * 0.5 ) * 400;
		this.light1.position.z = Math.cos( time * 0.3 ) * 300;

		this.light2.position.x = Math.cos( time * 0.3 ) * 300;
		this.light2.position.y = Math.sin( time * 0.5 ) * 400;
		this.light2.position.z = Math.sin( time * 0.7 ) * 300;

		this.light3.position.x = Math.sin( time * 0.7 ) * 300;
		this.light3.position.y = Math.cos( time * 0.3 ) * 400;
		this.light3.position.z = Math.sin( time * 0.5 ) * 300;

		this.light4.position.x = Math.sin( time * 0.3 ) * 300;
		this.light4.position.y = Math.cos( time * 0.7 ) * 400;
		this.light4.position.z = Math.sin( time * 0.5 ) * 300;

		this.renderer.render(this.scene, this.camera);
		this.requestID = window.requestAnimationFrame(this.startAnimationLoop)
	}

	render() {

		return (
			<div className="object-view">
				{this.state.loading
				 ? <Loader/>
				 : <div className="object-view__canvas" ref={ref => (this.view = ref)}/>}
			</div>
			
		);
	}
}

export default ObjectView;
