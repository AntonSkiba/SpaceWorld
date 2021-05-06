import * as THREE from "three";

export default class ShipControls {
    constructor(camera, domElement, radius, height) {
		this._camera = camera;
		this._domElement = domElement;
		this._size = radius + height/2;
		this._radius = radius;

		this._speed = {
			look: 0.1,
			movement: 1,
		};

		this._targetPosition = new THREE.Vector3();
		
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

		// коэффициент скорости в зависимости расстояния от планеты
		let coef = this._camera.position.distanceTo(this._center) - this._radius;
		coef /= 4;

		const actualMovementSpeed = delta * this._speed.movement * coef;
		const actualLookSpeed = delta * this._speed.look;

		if (this.move.forward) this._camera.translateZ(-actualMovementSpeed);
		if (this.move.backward) this._camera.translateZ(actualMovementSpeed);

		if (this.move.left) this._camera.translateX(-actualMovementSpeed);
		if (this.move.right) this._camera.translateX(actualMovementSpeed);

		this._lat -= this.mouse.y * actualLookSpeed;
		this._lat = Math.max(-85, Math.min(85, this._lat));

		this._lon -= this.mouse.x * actualLookSpeed;

		let phi = THREE.MathUtils.degToRad(90 - this._lat);
		let theta = THREE.MathUtils.degToRad(this._lon);

		const position = this._camera.position;

		this._targetPosition.setFromSphericalCoords(1, phi, theta);

		const q = new THREE.Quaternion();
		const ver = new THREE.Vector3(0, 1, 0);
		q.setFromUnitVectors(ver, position.clone().normalize());

		this._targetPosition.add(position); //.applyAxisAngle(forw, theta);

		this._camera.lookAt(this._targetPosition);
		this._camera.applyQuaternion(q);
	}
}
