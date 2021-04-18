import React, { PureComponent } from "react";
import "./View.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import configs from "../../Components/Dialog/configs";

/**
 * Панель характеристик объекта с самим трехмерным объектом
 */
class ShapeView extends PureComponent {
    constructor(props) {
        super(props);

        this.settings = props.settings;

        this._shape = props.shape.clone();

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
        this._controls.dispose();
        this._renderer.dispose();
        this._view.removeChild(this._renderer.domElement);
        this._shape = null;
        this._scene = null;
    }

    _resize() {
        if (this._view) {
            const width = this._view.clientWidth;
            const height = this._view.clientHeight;

            this._renderer.setSize(width, height);
            this._camera.aspect = width / height;

            this._camera.updateProjectionMatrix();
        }
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
        this.updateTime(this.settings.sunTime);
        this.updateCamera(this.settings.camera);
        
        this._controls = new OrbitControls(this._camera, this._view);
        
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.shadowMap.enabled = true;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
        this._view.appendChild(this._renderer.domElement);
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

        // this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        // this._scene.add(this.ambientLight);
        // const sphere = new THREE.SphereBufferGeometry( 14, 16, 16 );

        // this.light1 = new THREE.PointLight( 0xae24f2, 2, 700 );
        // this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xae24f2 } ) ) );
        // this._scene.add( this.light1 );

        // this.light2 = new THREE.PointLight( 0x2470f2, 2, 700 );
        // this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x2470f2 } ) ) );
        // this._scene.add( this.light2 );

        // this.light3 = new THREE.PointLight( 0xffffff, 2, 700 );
        // this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
        // this._scene.add( this.light3 );

        // this.light4 = new THREE.PointLight( 0xffffff, 2, 700 );
        // this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
        // this._scene.add( this.light4 );
    }

    setHelperLight(x = 0, y = 0, z = 0, color = 0xffffff, intensity = 0.2) {
        const helperLight = new THREE.DirectionalLight(color, intensity);
        helperLight.position.x = x;
        helperLight.position.y = y;
        helperLight.position.z = z;
        this._scene.add(helperLight);
    }

    shapeSetup() {
        // Объект
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 40
        });

        this._shape.traverse((shapeChild) => {
            if (shapeChild instanceof THREE.Mesh) {
                shapeChild.material = material;
                shapeChild.castShadow = true;
                shapeChild.receiveShadow = true;
            }
        });

        const box = new THREE.Box3().setFromObject(this._shape);
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

        this._scene.add(this._shape);

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
        this.scaleObject(settings.scale);
        this.toggleLight(settings.style);
        this.settings = settings;
    }

    toggleStand(type) {
        this._scene.remove(this.grid);
        this._scene.remove(this.plane);
        switch (type) {
            case "grid":
                this._scene.add(this.grid);
                break;
            case "plane":
                this._scene.add(this.plane);
                break;
        }
    }

    toggleLight(style) {
        this._scene.background = new THREE.Color(configs.styleCanvas[style].sky);
        this.directionalLight.color.setHex(configs.styleCanvas[style].light);
        this.sun.material.color.setHex(configs.styleCanvas[style].light);
        this.grid.material.color.setHex(configs.styleCanvas[style].grid);
    }

    changePosition(pos) {
        this._shape.position.x = pos.x || this._shape.position.x;
        this._shape.position.y = pos.y || this._shape.position.y;
        this._shape.position.z = pos.z || this._shape.position.z;
    }

    scaleObject(scale) {
        this._shape.scale.x = scale;
        this._shape.scale.y = scale;
        this._shape.scale.z = scale;

        this._shape.position.y = this.zeroPosition.y * scale;
        this._shape.position.x = this.zeroPosition.x * scale;
        this._shape.position.z = this.zeroPosition.z * scale;
    }

    updateTime(sunTime) {
        this.sunTime = sunTime;
    }

    updateCamera(camera) {
        this._camera.position.x = camera.position.x;
        this._camera.position.y = camera.position.y;
		this._camera.position.z = camera.position.z;
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

    startAnimationLoop() {
        this.sunTime++;
        const time = this.sunTime * 0.001;
        if (time > Math.PI*2) {
            this.sunTime = 0;
        }

        this.directionalLight.position.x = Math.sin(time) * 1500;
        this.directionalLight.position.y = Math.cos(time) * 1500;
        this.directionalLight.position.z = Math.cos(time) * 1500;

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

        this._renderer.render(this._scene, this._camera);
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    }

    render() {
        return (
            <div className="object-view" tabIndex="0">
                <div
                    className="object-view__canvas"
                    ref={(view) => (this._view = view)}
                />
            </div>
        );
    }
}

export default ShapeView;
