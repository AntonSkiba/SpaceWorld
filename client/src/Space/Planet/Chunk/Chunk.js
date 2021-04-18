import * as THREE from "three";

export default class Chunk {
	constructor(params) {
		this._params = params;

		this._geometry = new THREE.BufferGeometry();
		this._plane = new THREE.Mesh(this._geometry, this._params.material);
		this._plane.castShadow = true;
		this._plane.receiveShadow = true; 
		this._params.group.add(this._plane);
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

	// *rebuild() {
	// 	const positions = [];
	// 	const colors = [];

	// 	const vertex = new THREE.Vector3();

	// 	const resolution = this._params.resolution;
	// 	const offset = this._params.offset;
	// 	const worldMatrix = this._params.worldMatrix;
	// 	const radius = this._params.radius;
		
	// 	let count = 0;
	// 	for (let x = 0; x < resolution; x++) {
	// 		for (let y = 0; y < resolution; y++) {
	// 			// от -resolution/2 до +resolution/2
	// 			const xp = x / (resolution - 1) - 0.5;
	// 			const yp = y / (resolution - 1) - 0.5;

	// 			vertex.set(xp, yp, 0);
	// 			vertex.add(offset);

	// 			vertex.normalize();
	// 			vertex.applyMatrix4(worldMatrix);

	// 			const height = this._genHeight(vertex);
	// 			const color = this._genColor(height);

	// 			vertex.multiplyScalar(radius + height * radius / 10);

	// 			positions.push(vertex.x, vertex.y, vertex.z);
	// 			colors.push(color.r, color.g, color.b);

	// 			count++;
	// 			if (count === Math.ceil(resolution * resolution / 2)) {
	// 				count = 0;
	// 				yield;
	// 			}
	// 		}
	// 	}

	// 	this._geometry.setAttribute( "color", new THREE.Float32BufferAttribute(colors, 3));
	// 	this._geometry.setAttribute( "position", new THREE.Float32BufferAttribute(positions, 3));
        
	// 	this._geometry.computeVertexNormals();
	// }

	// _genColor(height) {
	// 	let color = {r: 0, g: 0, b: 0};

	// 	if (height < 0.1) {
	// 		color.b = height * 10;
	// 	} else if (height < 0.12) {
	// 		color.r = 0.7;
	// 		color.g = 0.5;
	// 	} else if (height < 0.6) {
	// 		color.r = 0.1;
	// 		color.g = 0.5;
	// 		color.b = 0.1;
	// 	} else if (height < 0.7) {
	// 		color.r = 0.3;
	// 		color.g = 0.3;
	// 		color.b = 0.3;
	// 	} else {
	// 		color.r = 1.0;
	// 		color.g = 1.0;
	// 		color.b = 1.0;
	// 	}

	// 	return color;
	// }

	// _genHeight({x, y, z}) {
	// 	let value = 0;
    //     let max = 0;
    //     let amp = 1;
    //     let frequence = this._params.noise.frequence;
    //     let flatness = this._params.noise.flatness;
    //     const octaves = this._params.noise.octaves;

    //     for (let i = 0; i < octaves; i++) {
    //         value +=
    //             this._normalization(
    //                 this._params.simplex.noise3D(
    //                     frequence * x,
    //                     frequence * y,
    //                     frequence * z
    //                 ), -1, 1, 0, 1
    //             ) * amp;
    //         max += amp;
    //         amp /= 3;
    //         frequence *= 3;
    //     }

    //     value = Math.pow(value / max, flatness);

    //     return value;
	// }

	// _normalization(val, smin, smax, emin, emax) {
    //     const t =  (val-smin)/(smax-smin)
    //     return (emax-emin)*t + emin
    // }
}