import QuadTree from './QuadTree';
import ChunkManager from './Chunk/Manager';

export default class Planet {
	constructor(config, scene) {
		this._scene = scene;

		this._created = false;

		this._lod = 40;
		this._radius = config.radius;
		this._height = config.height;
		this._graph = config.graph;

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
			const initConfig = await this._init();

			// записываем стороны
			this._sides = initConfig.sides;

			// создаем объект для управления участками
			this._chunkManager = new ChunkManager({
				sides: this._sides,
				scene: this._scene
			});

			this._chunkManager.downloadModels(this._graph.models);	

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
		}
	}

	// метод отправляет запрос на инициализацию новой планеты
	// возвращает промис с конфигом новой планеты
	_init() {
		console.log('Инициализация новой планеты');
		return fetch('/api/planet/init', {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				radius: this._radius,
				height: this._height,
				graph: this._graph
			})
		}).then((result) => result.json());
	}

	_build() {
		return fetch('/api/planet/build', {
			method: "GET"
		}).then((result) => {
			return result.json()
		}).then((build) => {
			console.log('Построение основного ландшафта: ' + build.percent);
			if (!build.done) {
				return this._build();
			} else {
				return true;
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