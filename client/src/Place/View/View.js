import React, { PureComponent } from "react";
import SimplexNoise from 'simplex-noise';

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * View - создает новую область для отображения объектов
 */
export default class PlaceView extends PureComponent {
	constructor(props) {
		super(props);

		this._settings = props.settings;
		// просто карта биомов, для 4 соседей и основной зоны
		this._biomesMap = [
			[0, 0, 0, 2, 5, 1, 1, 1],
			[0, 2, 2, 2, 5, 5, 1, 1],
			[0, 2, 2, 5, 5, 3, 3, 1],
			[2, 2, 5, 5, 5, 3, 2, 4],
			[0, 2, 5, 5, 5, 5, 4, 4],
			[1, 2, 2, 5, 5, 4, 4, 4],
			[1, 1, 2, 5, 5, 5, 0, 0],
			[1, 1, 2, 4, 4, 0, 0, 0]
		];

		this._startAnimationLoop = this._startAnimationLoop.bind(this);
	}

	componentDidMount() {
		//this._space.create(this._view);
		this.sceneSetup();
        this.lightsSetup();

		this.updateView(this._settings);

        this._startAnimationLoop();
	}

	componentWillUnmount() {
        window.cancelAnimationFrame(this.requestID);
        this._controls.dispose();
        this._renderer.dispose();
		this.placeRemove();
        this._view.removeChild(this._renderer.domElement);
		this._scene = null;
    }

	updateView(settings) {

		if (settings.zone) {
			this._scene.remove(this._place);
			this.placeSetup(settings.zone);
		}

		this._settings = settings;
	}

	sceneSetup() {
        const width = this._view.clientWidth;
        const height = this._view.clientHeight;

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x7b87bd);

        this._camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            100000
        );

        // Вызываются только при построении и обновляются здесь
        this.updateTime(this._settings.sunTime);
        this.updateCamera(this._settings.camera);
        
        this._controls = new OrbitControls(this._camera, this._view);
        
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.shadowMap.enabled = true;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
        this._view.appendChild(this._renderer.domElement);
    }

	updateTime(sunTime) {
        this.sunTime = sunTime;
    }

    updateCamera(camera) {
        this._camera.position.x = camera.position.x;
        this._camera.position.y = camera.position.y;
		this._camera.position.z = camera.position.z;
    }

    lightsSetup() {
        const sunGeo = new THREE.SphereBufferGeometry(80, 20, 20);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.sun = new THREE.Mesh(sunGeo, sunMat);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 16384; // default
        this.directionalLight.shadow.mapSize.height = 16384; // default
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 10000;
        this.directionalLight.shadow.camera.zoom = 0.001;
        this.directionalLight.add(this.sun);
        this._scene.add(this.directionalLight);

        this.setHelperLight(1000, 100, 0);
        this.setHelperLight(-1000, 100, 0);
        this.setHelperLight(0, 100, 1000);
        this.setHelperLight(0, 100, -1000);
    }

    setHelperLight(x = 0, y = 0, z = 0, color = 0xffffff, intensity = 0.2) {
        const helperLight = new THREE.DirectionalLight(color, intensity);
        helperLight.position.x = x;
        helperLight.position.y = y;
        helperLight.position.z = z;
        this._scene.add(helperLight);
    }

	// максимально прямое и упращенное создание ландшафта просто для создания вершины местности
	placeSetup(config) {
		const simplexHeight = new SimplexNoise(config.heightSeed);
		const simplexBiomes = new SimplexNoise(config.biomeSeed);

		this._material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
			vertexColors: THREE.VertexColors,
            shininess: 0.1
        });

		this._geometry = new THREE.PlaneBufferGeometry(1000, 1000, 499, 499);
		
		const position = this._geometry.attributes.position;
		const colors = [];

		for (let x = 0; x < 500; x++) {
			for (let y = 0; y < 500; y++) {
				let height = this._getValue(x/500, y/500, simplexHeight, 10, 0.5, 2);
				let biome = this._getValue(x/500, y/500, simplexBiomes, 10, 1, 1);
				let color = this._getColor(height, biome, config.color, config.neighbors);

				if (height < 0.1) {
					height = 0.1;
				}
				
				colors.push(color.r, color.g, color.b);
				
				const idx = x*500 + y;
				position.setZ(idx, height*400);
			}
		}

		this._geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		this._geometry.computeVertexNormals();

		this._place = new THREE.Mesh(this._geometry, this._material);
		this._place.castShadow = true;
		this._place.receiveShadow = true;
		this._place.rotation.x = -Math.PI/2;

		this._scene.add(this._place);
	}

	placeRemove() {
		this._scene.remove(this._place);
		this._material.dispose();
		this._geometry.dispose();
		this._place = null;
	}

	_getColor(height, biome, main, neighbors) {
		const color = {r: 0, g: 0, b: 0};

		if (height < 0.1) {
            color.b = height * 6 + biome / 2.5;
        } else {
			const heightMax = this._biomesMap.length - 1;
			const biomeMax = this._biomesMap[0].length - 1;
			const heightIndex = Math.round(height * heightMax);
			const biomeIndex = Math.round(biome * biomeMax);

			const rgbColor = neighbors[this._biomesMap[heightIndex][biomeIndex]] || main;

			color.r = rgbColor.r / 255;
            color.g = rgbColor.g / 255;
            color.b = rgbColor.b / 255;
		}

		return color;
	}

	_getValue(nx, ny, simplex, octaves, freq, flatness) {
		let value = 0;
		let max = 0;
		let amp = 1;
	
		for (let i = 0; i < octaves; i++) {
			value += this._normalization(simplex.noise2D(freq*nx, freq*ny), -1, 1, 0, 1)*amp;
			max += amp;
			amp /= 2;
			freq *= 2;
		}
	
		value = Math.pow(value / max, flatness);
	
		return value;
	}
	
	_normalization(val, smin, smax, emin, emax) {
		const t =  (val-smin)/(smax-smin)
		return (emax-emin)*t + emin
	}

	getConfig() {
        const screenshot = this.takeScreenshot();

        return {
            screenshot,
            settings: {
                sunTime: this.sunTime,
                camera: {
					position: this._camera.position
				},
            },
        };
    }

    takeScreenshot() {
        this._renderer.render(this._scene, this._camera);
        return this._renderer.domElement.toDataURL();
    }

    _startAnimationLoop() {
        this.sunTime++;
        const time = this.sunTime * 0.001;
        if (time > Math.PI*2) {
            this.sunTime = 0;
        }

        this.directionalLight.position.x = Math.sin(time) * 1500;
        this.directionalLight.position.y = Math.cos(time) * 1000 + 1000;
        this.directionalLight.position.z = Math.cos(time) * 1500;

        this._renderer.render(this._scene, this._camera);
        this.requestID = window.requestAnimationFrame(this._startAnimationLoop);
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