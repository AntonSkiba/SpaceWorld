import * as THREE from "three";

export default class Chunk {
	constructor(params) {
		this._params = params;

		this._geometry = new THREE.BufferGeometry();
		this._plane = new THREE.Mesh(this._geometry, this._params.material);
		// this._plane.castShadow = true;
		// this._plane.receiveShadow = true; 
		this._params.group.add(this._plane);

		this._drawed = [];
	}

	remove() {
		this._params.group.remove(this._plane);
		this._geometry.dispose();
	}

	hide() {
		this._plane.visible = false;
	}

	show() {
		this._plane.visible = true;
	}

	rebuildMeshFromData(data) {
		this._geometry.setAttribute(
			'position', new THREE.Float32BufferAttribute(data.positions, 3));
		this._geometry.setAttribute(
			'color', new THREE.Float32BufferAttribute(data.colors, 3));
		this._geometry.setAttribute(
			'normal', new THREE.Float32BufferAttribute(data.normals, 3));
		this._geometry.setAttribute(
			'tangent', new THREE.Float32BufferAttribute(data.tangents, 4));
		this._geometry.setAttribute(
			'uv', new THREE.Float32BufferAttribute(data.uvs, 2));
		this._geometry.setIndex(
			new THREE.BufferAttribute(new Uint32Array(data.indices), 1));
	}
	
}