import * as THREE from "three";
import Planet from './Planet/Planet';
import Moon from './Planet/Moon';

import Stats from 'three/examples/jsm/libs/stats.module';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {CopyShader} from 'three/examples/jsm/shaders/CopyShader';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {WEBGL} from 'three/examples/jsm/WebGL.js';
import {GUI} from 'three/examples/jsm/libs/dat.gui.module';
import ShipControls from './Controls/Ship';

import {scattering_shader} from './shaders/scattering';

/**
 * Space - реализует создание отображаемого пространства в контексте THREE.js
 */
export default class Space {
	constructor(graph, sunSpeed, moonDistance, timeControl) {
		// контейнер для вставки сцены
		this._view = null;
		this._time = 0;
		this._planetConfig = {
			graph,
			radius: 200000,
			height: 10000
		};

		this._sunSpeed = sunSpeed;
		this._moonDistance = this._planetConfig.radius + moonDistance;
		this._timeControl = timeControl;
		this._moon = null;

		this._startAnimationLoop = this._startAnimationLoop.bind(this);
	}

	create(view) {
		this._view = view;

		//this._guiSetup();
		this._rendererSetup();
		this._cameraSetup();
		this._sceneSetup();
		this._lightsSetup();
		this._planetSetup();
		this._moonSetup();

		this._startAnimationLoop();
	}

	toggle() {
		this._stopControls = !this._stopControls;
	}

	destroy() {
		window.cancelAnimationFrame(this._requestID);
		this._controls.dispose();
		this._renderer.dispose();
		this._target.dispose();
		this._view.removeChild(this._renderer.domElement);
		if (this._moon && this._moon.created) {
			this._moon.dispose();
		}
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

	_guiSetup() {
		this._scatteringConst = {
			referencePlanetRadiusConst: 2000000.0,
			referenceAtmosphereRadiusConst: 100000.0,
			rayleighScaleConst: 8500.0,
			mieScaleConst: 120.0,
			absorptionHeightMaxConst: 32000.0,
			absorptionFalloffConst: 3000.0,
			gConst: 0.76,
			sunIntensityConst: 40.0,
			skyAmtFactorConst: 0.25,
			skyAmtPlusConst: 0.75,
			beConst: 0.000025,
			silhouetteConst: 10000.0,
			distFactorConst: 0.0005,
			scaledDistanceToSurfaceConst: 0.25,
			scatteringOpacityConst: 1.0
		};
		this._gui = new GUI();
		this._gui.domElement.style = {
			position: 'absolute',
			zIndex: 100
		}
		const scattering = this._gui.addFolder('Scattering');
		scattering.add(this._scatteringConst, 'referencePlanetRadiusConst', 100000, 10000000, 1000);
		scattering.add(this._scatteringConst, 'referenceAtmosphereRadiusConst', 10000, 1000000, 1000);
		scattering.add(this._scatteringConst, 'rayleighScaleConst', 100, 100000, 100);
		scattering.add(this._scatteringConst, 'mieScaleConst', 100, 100000, 100);
		scattering.add(this._scatteringConst, 'absorptionHeightMaxConst', 100, 1000000, 100);
		scattering.add(this._scatteringConst, 'absorptionFalloffConst', 100, 1000000, 100);
		scattering.add(this._scatteringConst, 'gConst', 0, 1, 0.001);
		scattering.add(this._scatteringConst, 'sunIntensityConst', 1, 500, 1);
		scattering.add(this._scatteringConst, 'skyAmtFactorConst', 0, 1, 0.001);
		scattering.add(this._scatteringConst, 'skyAmtPlusConst', 0, 1, 0.001);
		scattering.add(this._scatteringConst, 'beConst', 0, 0.0025, 0.000001);
	}

	_rendererSetup() {
		const width = this._view.clientWidth;
        const height = this._view.clientHeight;

		const canvas = document.createElement('canvas');
      	const context = canvas.getContext('webgl2', {alpha: false});

		this._renderer = new THREE.WebGLRenderer({
			canvas,
			context,
			antialias: false
		});
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
		//this._renderer.shadowMap.enabled = true;
		this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this._renderer.autoClear = false;
        this._view.appendChild(this._renderer.domElement);
	}

	_cameraSetup() {
		const width = this._view.clientWidth;
        const height = this._view.clientHeight;

		const fov = 45;
		const aspect = width/ height;
		const near = 2;
		const far = 2000000;

		this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this._camera.position.y = this._planetConfig.radius * 4;
		this._camera.lookAt(0, 0, 0);

		this._controls = new ShipControls(this._camera, document, this._planetConfig.radius, this._planetConfig.height);
	}

	// создаем сцену
	_sceneSetup() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x000012);

		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'skybox/light/front.png',
			'skybox/light/back.png',
			'skybox/light/up.png',
			'skybox/light/down.png',
			'skybox/light/right.png',
			'skybox/light/left.png',
		]);
		this._scene.background = texture;

		this._stats = new Stats();
		const renderPass = new RenderPass(this._scene, this._camera);
		const fxaaPass = new ShaderPass(FXAAShader);

		this._composer = new EffectComposer(this._renderer);
		this._composer.addPass(renderPass);
		this._composer.addPass(fxaaPass);

		const width = this._view.clientWidth;
        const height = this._view.clientHeight;

		this._target = new THREE.WebGLRenderTarget(width, height);
		this._target.texture.format = THREE.RGBFormat;
		this._target.texture.minFilter = THREE.NearestFilter;
		this._target.texture.magFilter = THREE.NearestFilter;
		this._target.texture.generateMipmaps = false;
		this._target.stencilBuffer = false;
		this._target.depthBuffer = true;
		this._target.depthTexture = new THREE.DepthTexture();
		this._target.depthTexture.format = THREE.DepthFormat;
		this._target.depthTexture.type = THREE.FloatType;

		this._renderer.setRenderTarget(this._target);

		this._postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		this._depthPass = new THREE.ShaderMaterial({
			vertexShader: scattering_shader.VS,
			fragmentShader: scattering_shader.PS,
			uniforms: {
				cameraNear: {value: this._camera.near},
				cameraFar: {value: this._camera.far},
				cameraPosition: {value: this._camera.position},
				cameraForward: {value: null},
				tDiffuse: {value: null},
				tDepth: {value: null},
				inverseProjection: {value: null},
				inverseView: {value: null},
				planetPosition: {value: null},
				moonPosition: {value: null},
				planetRadius: {value: null},
				moonRadius: {value: null},
				atmosphereRadius: {value: null},
				lightDir: {value: null},
				
			}
		});

		const postPlane = new THREE.PlaneBufferGeometry(2, 2);
		const postQuad = new THREE.Mesh(postPlane, this._depthPass);
		this._postScene = new THREE.Scene();
		this._postScene.add(postQuad);
	}

	// создаем свет в пространстве
	_lightsSetup() {
		const sunGeo = new THREE.SphereBufferGeometry(1000, 20, 20);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);

        this._sun = new THREE.SpotLight(0xffffff, 1);

		this._sun.position.x = this._planetConfig.radius;
		this._sun.position.y = this._planetConfig.radius;
		this._sun.angle = Math.PI / 3;

        // this._sun.castShadow = true;
        // this._sun.shadow.mapSize.width = Math.pow(2, 10); // default
        // this._sun.shadow.mapSize.height = Math.pow(2, 10); // default
        // this._sun.shadow.camera.near = 10;
        // this._sun.shadow.camera.far = 1000000;
        // this._sun.shadow.camera.zoom = 0.1;

		// const helper = new THREE.CameraHelper( this._sun.shadow.camera );
		// this._scene.add( helper );

        this._sun.add(sunMesh);
        this._scene.add(this._sun);
	}

	_planetSetup() {
		this._planet = new Planet(this._planetConfig, this._scene);
		this._planet.create();
	}

	_moonSetup() {
		this._moon = new Moon(this._scene, this._moonDistance, this._planetConfig.graph.tree.moonSeed);
	}

	acceleration(speed) {
		this._sunSpeed = speed;
	}

	moonDistance(distance) {
		this._moon.changeDistance(this._planetConfig.radius + distance);
	}

	_startAnimationLoop() {
		if (!this._stopControls) {
			this._time += this._sunSpeed * 0.000000005;
			if (this._time > Math.PI*2) {
				this._time = 0;
			}
		}

		const sunPosition = this._sun.position.clone().normalize();
		const userPosition = this._camera.position.clone().normalize();
		const planetPosition = new THREE.Vector3(0, 0, 0);

		const timeType = this._camera.position.distanceTo(planetPosition) < this._planetConfig.radius * 2 ? 'time' : 'phrase';
		
		const timeValue = this._time / (2 * Math.PI);

		const localeValue = (userPosition.y + 1) / 2;

		this._timeControl(timeType, timeValue, localeValue);

		if (this._moon.created) {
			this._moon.update(this._time);
		}

        this._sun.position.x = Math.sin(this._time) * this._planetConfig.radius * 20;
        this._sun.position.y = Math.cos(this._time) * this._planetConfig.radius * 20;
        this._sun.position.z = Math.cos(this._time) * this._planetConfig.radius * 20;

		this._renderer.setRenderTarget(this._target);

		this._renderer.clear();
		this._renderer.render(this._scene, this._camera);

		this._renderer.setRenderTarget( null );

		const forward = new THREE.Vector3();
		this._camera.getWorldDirection(forward);

		this._depthPass.uniforms.inverseProjection.value = this._camera.projectionMatrixInverse;
		this._depthPass.uniforms.inverseView.value = this._camera.matrixWorld;
		this._depthPass.uniforms.tDiffuse.value = this._target.texture;
		this._depthPass.uniforms.tDepth.value = this._target.depthTexture;
		this._depthPass.uniforms.cameraNear.value = this._camera.near;
		this._depthPass.uniforms.cameraFar.value = this._camera.far;
		this._depthPass.uniforms.cameraPosition.value = this._camera.position;
		this._depthPass.uniforms.cameraForward.value = forward;
		this._depthPass.uniforms.planetPosition.value = planetPosition;
		this._depthPass.uniforms.moonPosition.value = this._moon.getPosition();
		this._depthPass.uniforms.planetRadius.value = 1.0 * this._planet.radius;
		this._depthPass.uniforms.moonRadius.value = this._moon.radius;
		this._depthPass.uniforms.atmosphereRadius.value = 1.2 * this._planet.radius;
		this._depthPass.uniforms.lightDir.value = sunPosition;
		
		this._depthPass.uniformsNeedUpdate = true;

		this._renderer.render(this._postScene, this._postCamera);

		this._stats.update();

		if (!this._stopControls) {
			this._controls.update();
		}
		
		
		if (this._planet.created) {
			this._planet.update(this._camera.position);
		}

		
		this._requestID = window.requestAnimationFrame(this._startAnimationLoop);
	}
}