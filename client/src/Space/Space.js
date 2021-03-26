import * as THREE from "three";
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import Planet from './Planet/Planet';

/**
 * Space - реализует создание отображаемого пространства в контексте THREE.js
 */
export default class Space {
	constructor() {
		// контейнер для вставки сцены
		this._view = null;

		this._startAnimationLoop = this._startAnimationLoop.bind(this);
	}

	create(view) {
		this._view = view;

		this._sceneSetup();
		this._lightsSetup();
		this._planetSetup();

		this._startAnimationLoop();
	}

	destroy() {
		window.cancelAnimationFrame(this._requestID);
		this._controls.dispose();
	}

	takeScreenshot() {
        this._renderer.render(this._scene, this._camera);
        return this._renderer.domElement.toDataURL();
    }

	getSettings() {
		return {
			camera: {
				position: this._camera.position
			}
		}
	}

	// создаем сцену
	_sceneSetup() {
		const width = this._view.clientWidth;
        const height = this._view.clientHeight;

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x000012);

		this._camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            100000
        );

		this._camera.position.y = 80000;

		this._controls = new FirstPersonControls(this._camera, document);
        this._controls.lookSpeed = 0.1;
        this._controls.movementSpeed = 8000;
        this._controls.noFly = true;
		
		this._controls.lookAt(0, 0, 0);
        this._clock = new THREE.Clock();

		this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.shadowMap.enabled = true;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
        this._view.appendChild(this._renderer.domElement);
	}

	// создаем свет в пространстве
	_lightsSetup() {
		const sunGeo = new THREE.SphereBufferGeometry(1000, 20, 20);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this._sun = new THREE.Mesh(sunGeo, sunMat);

        this._directionalLight = new THREE.DirectionalLight(0xffffff, 1);

		this._directionalLight.position.x = 80000;
		this._directionalLight.position.y = 80000;

        this._directionalLight.castShadow = true;
        this._directionalLight.shadow.mapSize.width = 16384; // default
        this._directionalLight.shadow.mapSize.height = 16384; // default
        this._directionalLight.shadow.camera.near = 0.1;
        this._directionalLight.shadow.camera.far = 10000;
        this._directionalLight.shadow.camera.zoom = 0.001;

        this._directionalLight.add(this._sun);
        this._scene.add(this._directionalLight);
	}

	_planetSetup() {
		this._planet = new Planet(40000, this._scene);
		this._planet.create();
	}

	_startAnimationLoop() {
		this._controls.update(this._clock.getDelta());
		
		if (this._planet.created) {
			this._planet.update(this._camera.position);
		}

		this._renderer.render(this._scene, this._camera);
		this._requestID = window.requestAnimationFrame(this._startAnimationLoop);
	}
}