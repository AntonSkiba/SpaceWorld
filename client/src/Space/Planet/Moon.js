import * as THREE from "three";
import SimplexNoise from 'simplex-noise';

export default class Moon {
	constructor(scene, distance, seed) {
		this._scene = scene;

		this._sides = [
			{axis: "x", angle: -90},
			{axis: "x", angle: 90},
			{axis: "y", angle: 0},
			{axis: "y", angle: 180},
			{axis: "y", angle: 270},
			{axis: "y", angle: 90}
		];

		this._distance = distance;

		this.radius = 80000;
		this.height = 8000;
		this._simplex = new SimplexNoise(seed);

		this._create();
		this._createLight();
	}

	_createLight() {
		this._light = new THREE.DirectionalLight(0x334477, 1);
		this._light.target.position.set(0, 0, 0);
		this._scene.add(this._light);
	}

	dispose() {
		this._scene.remove(this._group);
		this._geometry.dispose();
		this._material.dispose();
		this._group = null;
	}

	getPosition() {
		return this._group.position;
	}

	_create() {
		this._group = new THREE.Group();
		this._material = new THREE.MeshPhongMaterial({
            vertexColors: THREE.VertexColors,
            shininess: 10,
        });
		this._geometry = new THREE.PlaneBufferGeometry(1, 1, 199, 199);

		const offset = new THREE.Vector3(0, 0, 0.5);

		this._sides.forEach(side => {
			const geometry = this._geometry.clone();
			const colors = [];
			const position = geometry.attributes.position;

			const axis = new THREE.Vector3(
				side.axis === "x" ? 1 : 0,
				side.axis === "y" ? 1 : 0,
				side.axis === "z" ? 1 : 0
			);
	
			const angle = (Math.PI * side.angle) / 180;

			for (let i = 0; i < position.count; i++) {
				const vertex = new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i));
				vertex.add(offset);

				vertex.normalize();
				vertex.applyAxisAngle(axis, angle);

				const elevation = this._getElevation(vertex, 20, 2, 4);

				vertex.multiplyScalar(this.radius + elevation * this.height);

				colors.push(0.4, 0.4, 0.4);

				position.setXYZ(i, vertex.x, vertex.y, vertex.z);
			}

			geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
			geometry.computeVertexNormals();

			const mesh = new THREE.Mesh(geometry, this._material);
			// mesh.castShadow = true;
        	// mesh.receiveShadow = true;
			this._group.add(mesh);
		});

		this._scene.add(this._group);
		this.created = true;
	}

	_getElevation({ x, y, z }, octaves, freq, flatness) {
        let value = 0;
        let max = 0;
        let amp = 2;

        for (let i = 0; i < octaves; i++) {
            value += this._normalization(this._simplex.noise3D(freq * x, freq * y, freq * z), -1, 1, 0, 1) * amp;
            max += amp;
            amp /= 3;
            freq *= 3;
        }

        value = Math.pow(value / max, flatness);

        return value;
    }

    _normalization(val, smin, smax, emin, emax) {
        const t =  (val-smin)/(smax-smin)
        return (emax-emin)*t + emin
    }

	changeDistance(distance) {
		this._distance = distance;
	}

	update(time) {
		this._group.position.x = Math.sin(time*3) * this._distance;
        this._group.position.y = -Math.cos(time*3) * this._distance;
        this._group.position.z = Math.cos(time*3) * this._distance;

		this._light.position.x = Math.sin(time*3) * this._distance;
        this._light.position.y = -Math.cos(time*3) * this._distance;
        this._light.position.z = Math.cos(time*3) * this._distance;
	}
}