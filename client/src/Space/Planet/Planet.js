import QuadTree from './QuadTree';
import ChunkManager from './Chunk/Manager';

export default class Planet {
	constructor(config, scene) {
		this._noise = {
			terrain: {
				seed: config.seed || 16,
				octaves: 20,
				frequence: 2,
				flatness: 3
			},
			biomes: {
				seed: config.biomesSeed || 13,
				octaves: 16,
				frequence: 8,
				flatness: 1
			}
		};

		this._scene = scene;

		this._created = false;

		this._lod = 20;
		this._radius = config.radius;
		this._height = config.height;

		// стороны планеты
		this._sides = [];

		this._chunkManager = null;
	}

	get created() {
		return this._created;
	}

	get radius() {
		return this._radius;
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
				noise: this._noise,
				radius: this._radius,
				height: this._height
			})
		}).then((result) => result.json());
	}

	_build() {
		return fetch('/api/planet/build', {
			method: "GET"
		}).then((result) => {
			return result.json()
		}).then((config) => {
			console.log(config.process.build.percent);
			if (!config.process.build.done) {
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