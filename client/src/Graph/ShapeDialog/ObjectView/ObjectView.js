import React, { PureComponent } from "react";
import "./ObjectView.css";

import * as THREE from "three";
// import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import configs from "../../configs";

/**
 * Панель характеристик объекта с самим трехмерным объектом
 */
class ObjectView extends PureComponent {
    constructor(props) {
        super(props);

        this.settings = props.settings;
        this.shape = props.shape.clone();

        this.startAnimationLoop = this.startAnimationLoop.bind(this);
        this._resize = this._resize.bind(this);
    }

    componentDidMount() {
        this.sceneSetup();
        this.lightsSetup();
        this.shapeSetup();

        // Может вызываться извне для управления состояниями из меню
        this.updateView(this.settings);

        this.startAnimationLoop();
    }

    componentWillUnmount() {
        // window.removeEventListener('resize', this._resize);
        window.cancelAnimationFrame(this.requestID);
        this.controls.dispose();
    }

    _resize() {
        if (this.view) {
            const width = this.view.clientWidth;
            const height = this.view.clientHeight;

            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;

            this.camera.updateProjectionMatrix();
        }
    }

    sceneSetup() {
        const width = this.view.clientWidth;
        const height = this.view.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x7b87bd);

        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            10000
        );

        // Вызываются только при построении и обновляются здесь
        this.updateTime(this.settings.sunTime);
        this.updateCamera(this.settings.camera);

        this.controls = new OrbitControls(this.camera, this.view);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.view.appendChild(this.renderer.domElement);
    }

    lightsSetup() {
        const sunGeo = new THREE.SphereBufferGeometry(14, 20, 20);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.sun = new THREE.Mesh(sunGeo, sunMat);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 4096; // default
        this.directionalLight.shadow.mapSize.height = 4096; // default
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 10000;
        this.directionalLight.shadow.camera.zoom = 0.01;
        this.directionalLight.add(this.sun);
        this.scene.add(this.directionalLight);

        this.setHelperLight(1000, 100, 0);
        this.setHelperLight(-1000, 100, 0);
        this.setHelperLight(0, 100, 1000);
        this.setHelperLight(0, 100, -1000);

        // this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        // this.scene.add(this.ambientLight);
        // const sphere = new THREE.SphereBufferGeometry( 14, 16, 16 );

        // this.light1 = new THREE.PointLight( 0xae24f2, 2, 700 );
        // this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xae24f2 } ) ) );
        // this.scene.add( this.light1 );

        // this.light2 = new THREE.PointLight( 0x2470f2, 2, 700 );
        // this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x2470f2 } ) ) );
        // this.scene.add( this.light2 );

        // this.light3 = new THREE.PointLight( 0xffffff, 2, 700 );
        // this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
        // this.scene.add( this.light3 );

        // this.light4 = new THREE.PointLight( 0xffffff, 2, 700 );
        // this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
        // this.scene.add( this.light4 );
    }

    setHelperLight(x = 0, y = 0, z = 0, color = 0xffffff, intensity = 0.2) {
        const helperLight = new THREE.DirectionalLight(color, intensity);
        helperLight.position.x = x;
        helperLight.position.y = y;
        helperLight.position.z = z;
        this.scene.add(helperLight);
    }

    shapeSetup() {
        // Объект
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 40,
        });

        this.shape.traverse((shapeChild) => {
            if (shapeChild instanceof THREE.Mesh) {
                shapeChild.material = material;
                shapeChild.castShadow = true;
                shapeChild.receiveShadow = true;
            }
        });

        const box = new THREE.Box3().setFromObject(this.shape);
		const center = new THREE.Vector3();
		const size = new THREE.Vector3();
		box.getCenter(center);
		box.getSize(size);

        this.zeroPosition = {
            y: -box.min.y,
            x: -center.x,
            z: -center.z,
		};
        
        if (!this.settings.scale) {
            this.settings.scale = Math.round(100 * 300 / size.y)/100;
        }
		
		this.props.updateSettings(this.settings);

        this.scene.add(this.shape);

        // хелперы
        this.grid = new THREE.GridHelper(2000, 99, 0xffffff, 0xffffff);

        const planeGeo = new THREE.PlaneGeometry(2000, 2000);
        const planeMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
        });
        this.plane = new THREE.Mesh(planeGeo, planeMat);
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.receiveShadow = true;
    }

    updateView(settings) {
        this.toggleStand(settings.stand);
        this.toggleLight(settings.style);
        this.scaleObject(settings.scale);
        this.settings = settings;
    }

    toggleStand(type) {
        this.scene.remove(this.grid);
        this.scene.remove(this.plane);
        switch (type) {
            case "grid":
                this.scene.add(this.grid);
                break;
            case "plane":
                this.scene.add(this.plane);
                break;
        }
    }

    toggleLight(style) {
        this.scene.background = new THREE.Color(configs.styleCanvas[style].sky);
        this.directionalLight.color.setHex(configs.styleCanvas[style].light);
        this.sun.material.color.setHex(configs.styleCanvas[style].light);
        this.grid.material.color.setHex(configs.styleCanvas[style].grid);
    }

    changePosition(pos) {
        this.shape.position.x = pos.x || this.shape.position.x;
        this.shape.position.y = pos.y || this.shape.position.y;
        this.shape.position.z = pos.z || this.shape.position.z;
    }

    scaleObject(scale) {
        this.shape.scale.x = scale;
        this.shape.scale.y = scale;
        this.shape.scale.z = scale;

        this.shape.position.y = this.zeroPosition.y * scale;
        this.shape.position.x = this.zeroPosition.x * scale;
        this.shape.position.z = this.zeroPosition.z * scale;
    }

    updateTime(sunTime) {
        this.sunTime = sunTime;
    }

    updateCamera(camera) {
        this.camera.position.x = camera.position.x;
        this.camera.position.y = camera.position.y;
		this.camera.position.z = camera.position.z;
    }

    getConfig() {
        const screenshot = this.takeScreenshot();

        return {
            screenshot,
            settings: {
                sunTime: this.sunTime,
                camera: {
					position: this.camera.position
				},
            },
        };
    }

    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL();
    }

    startAnimationLoop() {
        this.sunTime++;
        const time = this.sunTime * 0.001;
        if (time > Math.PI*2) {
            this.sunTime = 0;
        }

        this.directionalLight.position.x = Math.sin(time) * 1000;
        this.directionalLight.position.y = Math.cos(time) * 1000 + 1000;
        this.directionalLight.position.z = Math.cos(time) * 1000;

        // this.light1.position.x = Math.sin( time * 0.7 ) * 300;
        // this.light1.position.y = Math.cos( time * 0.5 ) * 400;
        // this.light1.position.z = Math.cos( time * 0.3 ) * 300;

        // this.light2.position.x = Math.cos( time * 0.3 ) * 300;
        // this.light2.position.y = Math.sin( time * 0.5 ) * 400;
        // this.light2.position.z = Math.sin( time * 0.7 ) * 300;

        // this.light3.position.x = Math.sin( time * 0.7 ) * 300;
        // this.light3.position.y = Math.cos( time * 0.3 ) * 400;
        // this.light3.position.z = Math.sin( time * 0.5 ) * 300;

        // this.light4.position.x = Math.sin( time * 0.3 ) * 300;
        // this.light4.position.y = Math.cos( time * 0.7 ) * 400;
        // this.light4.position.z = Math.sin( time * 0.5 ) * 300;

        this.renderer.render(this.scene, this.camera);
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    }

    render() {
        return (
            <div className="object-view" tabIndex="0">
                <div
                    className="object-view__canvas"
                    ref={(ref) => (this.view = ref)}
                />
            </div>
        );
    }
}

export default ObjectView;
