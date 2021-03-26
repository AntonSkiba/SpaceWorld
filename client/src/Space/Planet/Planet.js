import * as THREE from "three";
import QuadTree from './QuadTree';
import ChunkManager from './ChunkManager'

export default class Planet {
	constructor(radius, scene, seed = 13) {
		this._noise = {
			seed,
			octaves: 20,
			frequence: 3,
			flatness: 3,
		};

		this._scene = scene;

		this._created = false;

		this._lod = 12;
		this._radius = radius;

		// стороны планеты
		this._sides = [];

		this._chunkManager = null;
	}

	get created() {
		return this._created;
	}

	async create() {
		try {
			// инициализация новой планеты
			const initConfig = await this._init();

			// записываем стороны
			this._sides = initConfig.sides;

			// создаем объект для управления участками
			this._chunkManager = new ChunkManager({
				sides: this._sides,
				noise: this._noise,
				scene: this._scene
			});

			// построение новой планеты
			//await this._build();

			// запись референсных карт для каждой стороны
			//await this._setMap();

			this._created = true;

			// создаем деревья квадрантов для каждой стороны
			for (const side of this._sides) {
				side.quadTree = new QuadTree(side.name, side.rotation, this._radius, this._lod);
			}
		} catch (err) {
			console.log(err)
		};
	}

	update(pos) {
		if (this._created) {
			this._chunkManager.update(pos);
			//this._insert(pos);
		}

		const dist = pos.distanceTo(new THREE.Vector3(0, 0, 0));
		const atmosphere = 20000;
		if (dist < this._radius + atmosphere) {
			const color = 1 - (dist - this._radius) / atmosphere;
			this._scene.background = new THREE.Color(0.5*color, 0.5*color, color);
		}
	}

	// метод отправляет запрос на инициализацию новой планеты
	// возвращает промис с конфигом новой планеты
	_init() {
		return fetch('/api/planet/init', {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				noise: this._noise
			})
		}).then((result) => result.json());
	}

	_build() {
		return fetch('/api/planet/build', {
			method: "GET"
		}).then((result) => {
			return result.json()
		}).then((config) => {
			console.log(config.build.progress);
			if (!config.build.status) {
				return this._build();
			} else {
				return config;
			}
		});
	}

	_setMap(count = 0) {
		return fetch(`/api/planet/getmap/${this._sides[count].name}`, {
			method: "GET"
		}).then((result) => {
			return result.json()
		}).then((info) => {
			this._sides[count].reference = info.map;
			count++;
			if (this._sides[count]) {
				return this._setMap(count);
			}

			return;
		});
	}

}