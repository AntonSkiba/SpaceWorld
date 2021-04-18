import * as THREE from "three";
// import { Quaternion } from "three";
// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// класс - обертка над FirstPersonControls для управления камерой в планетарном масштабе
export default class ShipControls {
    constructor(camera, domElement, radius, height) {
		this._camera = camera;
		this._domElement = domElement;
		this._size = radius + height;

		this._speed = {
			look: 0.1,
			movement: 10000,
		};

		this._targetPosition = new THREE.Vector3();
		

        // this._base = new FirstPersonControls(this._camera, this._domElement);
        // this._base.lookSpeed = 0.1;
        // this._base.movementSpeed = this._speed.movement;
        //this._base.noFly = true;

		// this._base.lookAt(0, 0, 0);
		this._clock = new THREE.Clock();
		this._center = new THREE.Vector3(0, 0, 0);

		this.move = {
			forward: false,
			backward: false,
			right: false,
			left: false
		};

		this.mouse = {
			x: 0,
			y: 0
		}

		this.resize();
		this._setOrientation();

		this._subscribe();
    }

	_subscribe() {
		this._mouseMove = this._mouseMove.bind(this);

		this._onKeyDown = this._onKeyDown.bind(this);
		this._onKeyUp = this._onKeyUp.bind(this);

		this._domElement.addEventListener('mousemove', this._mouseMove);
		window.addEventListener('keydown', this._onKeyDown);
		window.addEventListener('keyup', this._onKeyUp);
	}

	dispose() {
		this._domElement.removeEventListener('mousemove', this._mouseMove);
		window.removeEventListener('keydown', this._onKeyDown);
		window.removeEventListener('keyup', this._onKeyUp);

		//this._base.dispose();
	}

	_setOrientation() {
		const spherical = new THREE.Spherical();
		const lookDirection = new THREE.Vector3();

		const quaternion = this._camera.quaternion;
		lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
		spherical.setFromVector3(lookDirection);

		this._lat = 90 - THREE.MathUtils.radToDeg(spherical.phi);
		this._lon = THREE.MathUtils.radToDeg(spherical.theta);
	}

	_mouseMove(ev) {
		this.mouse = {
			x: ev.pageX - this._elementOffset.x - this._viewHalf.x,
			y: ev.pageY - this._elementOffset.y - this._viewHalf.y
		}
	}

	_onKeyDown(ev) {
		switch(ev.keyCode) {
			case 38:
			case 87:
				this.move.forward = true;
				break;
			case 40:
			case 83:
				this.move.backward = true;
				break;
			case 37:
			case 65:
				this.move.left = true;
				break;
			case 39:
			case 68:
				this.move.right = true;
				break;
		}
	}

	_onKeyUp(ev) {
		switch(ev.keyCode) {
			case 38: 
			case 87:
				this.move.forward = false;
				break;
			case 40: 
			case 83:
				this.move.backward = false;
				break;
			case 37:
			case 65:
				this.move.left = false;
				break;
			case 39:
			case 68:
				this.move.right = false;
				break;
		}
	}

	resize() {
		this._viewHalf = {
			x: this._domElement.offsetWidth / 2 || window.innerWidth / 2,
			y: this._domElement.offsetHeight / 2 || window.innerHeight / 2
		};

		this._elementOffset = {
			x: this._domElement.offsetLeft || 0,
			y: this._domElement.offsetTop || 0
		}
	}

	_addedSpherical() {
		const spherical = new THREE.Spherical();
		spherical.setFromVector3(this._camera.position);

		return {phi: spherical.phi, theta: spherical.theta};
	}

    update() {
		const delta = this._clock.getDelta();

		const actualMovementSpeed = delta * this._speed.movement;
		const actualLookSpeed = delta * this._speed.look;

		if (this.move.forward) this._camera.translateZ(-actualMovementSpeed);
		if (this.move.backward) this._camera.translateZ(actualMovementSpeed);

		if (this.move.left) this._camera.translateX(-actualMovementSpeed);
		if (this.move.right) this._camera.translateX(actualMovementSpeed);

		this._lat -= this.mouse.y * actualLookSpeed;
		this._lat = Math.max(-85, Math.min(85, this._lat));

		this._lon -= this.mouse.x * actualLookSpeed;
		// this._lon = 0;
		// this._lat = -45;

		let phi = THREE.MathUtils.degToRad(90 - this._lat);
		let theta = THREE.MathUtils.degToRad(this._lon);

		const position = this._camera.position;
		const forw = position.clone().normalize();

		//const angle = axis.angleTo(new THREE.Vector3(0, 1, 0));
		//theta += angle;
		this._targetPosition.setFromSphericalCoords(1, phi, theta).add(position); //.applyAxisAngle(forw, theta);

		// const up = position.clone().normalize();
		// const targetDir = this._targetPosition.normalize();
		// const forward = targetDir.add(-up.multiply(targetDir.dot(up)));
		
		// const rotation = new Quaternion();
		// rotation.setFromUnitVectors(forward.normalize(), up.normalize());
		
		//this._camera.applyQuaternion(rotation);

		//console.log(this._camera.rotation);
		

		//this._camera.rotateOnAxis(axis, phi);

		this._camera.lookAt(this._targetPosition);
		//console.log(this._targetPosition);
		
		
		
		// this._camera.rotateY(theta);
		//this._base.update(this._clock.getDelta());
	}
}
