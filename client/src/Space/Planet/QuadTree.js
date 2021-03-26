import * as THREE from "three";

export default class QuadTree {
	constructor(name, rotation, radius, max) {
		this._max = max;

		this._radius = radius;

		const axis = new THREE.Vector3(
				rotation.axis === "x" ? 1 : 0,
				rotation.axis === "y" ? 1 : 0,
				rotation.axis === "z" ? 1 : 0
			);
		const angle = (Math.PI * rotation.angle) / 180;
		
		this._worldMatrix = new THREE.Matrix4();
		this._worldMatrix.makeRotationAxis(axis, angle);

		this._root = this._createQuad(name, 0, {x: 0, y: 0, z: 0.5});
	}

	_createQuad(name, level, offset) {
		const box = new THREE.Box3(
			new THREE.Vector3(-1, -1, 0),
			new THREE.Vector3(1, 1, 0)
		);
		const center = box.getCenter(new THREE.Vector3());
		const offsetVector = new THREE.Vector3(offset.x, offset.y, offset.z);
		
		// смещаем центр до нужного участка
		center.add(offsetVector);

		// нормализуем, поворачиваем и сдвигаем на радиус
		center.normalize();
		center.applyMatrix4(this._worldMatrix);
		center.multiplyScalar(this._radius);

		return {
			level,
			name,
			offset,
			center,
			worldMatrix: this._worldMatrix,
			radius: this._radius,
			distance: (this._radius) / (offset.z)
		}
	}

	getChildren() {
		const quads = {};
		this._getChildren(this._root, quads);
		return quads;
	}

	_getChildren(quad, target) {
		if (!quad.children) {
			target[quad.name] = quad;
			return;
		}

		for (const child of quad.children) {
			this._getChildren(child, target);
		}
	}

	insert(pos) {
		this._insert(this._root, pos);
	}

	_insert(quad, pos, level = 0) {
		const hit = quad.center.distanceTo(pos) < quad.distance;
		if (hit && level < this._max) {
			if (!quad.children) {
				quad.children = this._createChildren(quad);
			}

			for (const child of quad.children) {
				this._insert(child, pos, level + 1);
			}
		} else if (!hit && quad.children) {
			quad.children = null;
			delete quad.children;
		}
	}

	_createChildren(quad) {
		// левый верхний
		const northeast = this._createQuad(quad.name + '_northeast', quad.level + 1, {
			x: quad.offset.x*2 - 0.5,
			y: quad.offset.y*2 + 0.5,
			z: quad.offset.z*2
		});

		// правый верхний
		const northwest = this._createQuad(quad.name + '_northwest', quad.level + 1, {
			x: quad.offset.x*2 + 0.5,
			y: quad.offset.y*2 + 0.5,
			z: quad.offset.z*2
		});

		// левый нижний
		const southeast = this._createQuad(quad.name + '_southeast', quad.level + 1, {
			x: quad.offset.x*2 - 0.5,
			y: quad.offset.y*2 - 0.5,
			z: quad.offset.z*2
		});

		// правый нижний
		const southwest = this._createQuad(quad.name + '_southwest', quad.level + 1, {
			x: quad.offset.x*2 + 0.5,
			y: quad.offset.y*2 - 0.5,
			z: quad.offset.z*2
		});

		return [northeast, northwest, southeast, southwest];
	}



	_getGroup(config) {
		let group;
		if (!config.group) {
			group = new THREE.Group();
			this._scene.add(this._group);
		} else {
			group = config.group;
		}

		return group;
	}
}