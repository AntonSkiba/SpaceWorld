import Chunk from "./Chunk";
import * as THREE from "three";

class WorkerThread {
    constructor() {
        this._resolve = null;
        this._id = Date.now();
    }

	_postMessage(message) {
		return fetch('/api/planet/chunk', {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				params: message.params
			})
		}).then((result) => result.json()).then((e) => {
			this._onMessage(e);
		});
	}

    _onMessage(e) {
        const resolve = this._resolve;
        this._resolve = null;
        resolve(e);
    }

    get id() {
        return this._id;
    }

    postMessage(message, resolve) {
        this._resolve = resolve;
        this._postMessage(message);
    }
}

class WorkerThreadPool {
    constructor(sz) {
        this._workers = [...Array(sz)].map((_) => new WorkerThread());
        this._free = [...this._workers];
        this._busy = {};
        this._queue = [];
    }

    get length() {
        return this._workers.length;
    }

    get busy() {
        return this._queue.length > 0 || Object.keys(this._busy).length > 0;
    }

    enqueue(workItem, resolve) {
        this._queue.push([workItem, resolve]);
        this._pumpQueue();
    }

    _pumpQueue() {
        while (this._free.length > 0 && this._queue.length > 0) {
            const worker = this._free.pop();
            this._busy[worker.id] = worker;

            const [workItem, workResolve] = this._queue.shift();

            worker.postMessage(workItem, (message) => {
                delete this._busy[worker.id];
                this._free.push(worker);
                workResolve(message);
                this._pumpQueue();
            });
        }
    }
}

export default class ChunkRebuilderThreaded {
	constructor (models, modelsGroup) {
		this._pool = [];
		this._old = [];
		this._changes = [];
		this._models = models;
		this._modelsGroup = modelsGroup;
		this._modelsLevel = 6;

		this._workerPool = new WorkerThreadPool(100);

		// данные о сгенерированных объектах на участках
		this._data = {};
	}

	_onResult(chunk, msg) {
		//console.log(msg);
		chunk.rebuildMeshFromData(msg.data);
		//chunk.show();

		const chunkKey = chunk._params.name;

		console.log('Chunk Info: ');
		console.log('name: ' + chunkKey);
		console.log('objects: ' + msg.data.objects.length);

		if (msg.data.objects.length) {
			this._data[chunkKey] = this._drawModels(msg.data.objects);
		}

		// Если новый чанк меньше установленного уровня, то находим дочерние чанки с объектами
		// и удаляем объекты со сцены
		if (chunk._params.level < this._modelsLevel) {
			const drawedChunkKeys = Object.keys(this._data);
			drawedChunkKeys.forEach(drawedKey => {
				if (drawedKey.includes(chunkKey)) {
					this._data[drawedKey].forEach(shape => {
						this._modelsGroup.remove(shape);
					});
					this._data[drawedKey] = null;
					delete this._data[drawedKey];
				}
			})
		}

		//console.log(chunkKey);

		// находим изменение в котором есть загруженный участок
		for (let c = 0; c < this._changes.length; c++) {
			const change = this._changes[c];
			if (change.difference[chunkKey]) {
				change.difference[chunkKey] = null;
				delete change.difference[chunkKey];

				change.draw[chunkKey] = chunk;
				
				if (!Object.keys(change.difference).length) {
					for (let hideKey in change.recycle) {
						change.recycle[hideKey].remove();
					}
		
					for (let drawKey in change.draw) {
						change.draw[drawKey].show();
					}
		
					this._changes.splice(c, 1);
				}
				break;
			}
		}
	}

	_drawModels(models) {
		const shapes = [];
		
		models.forEach(model => {
			const ref = this._models[model.key];
			const shape = ref && ref.clone();

			if (shape) {
				shape.position.x = model.position.x;
				shape.position.y = model.position.y;
				shape.position.z = model.position.z;

				const axis = shape.position.clone().normalize()
				const q = new THREE.Quaternion();
				const ver = new THREE.Vector3(0, 1, 0);
				q.setFromUnitVectors(ver, axis);

				shape.applyQuaternion(q).rotateOnWorldAxis(axis, model.angle);

				shapes.push(shape);
				this._modelsGroup.add(shape);
			}
		});

		return shapes;
	}

	allocateChunk(params) {
		const level = params.level;
		if (!this._pool[level]) {
			this._pool[level] = [];
		}

		let chunk = null;
		if (this._pool[level].length > 0) {
			chunk = this._pool[level].pop();
			chunk._params = params;
			return chunk;
		} else {
			chunk = new Chunk(params);
		}

		chunk.hide();

		const threadedParams = {
			objects: level === this._modelsLevel && !this._data[params.name],
			resolution: params.resolution,
			offset: params.offset,
			worldMatrix: params.worldMatrix,
			radius: params.radius,
			level
		};

		const msg = {
			subject: 'build_chunk',
			params: threadedParams
		};

		this._workerPool.enqueue(msg, (message) => {
			this._onResult(chunk, message);
		});

		return chunk;
	}

	_recycleChunks(chunks) {
		for (let chunk of chunks) {
			if (!this._pool[chunk._params.level]) {
				this._pool[chunk._params.level] = [];
			}

			chunk.remove();
		}
	}

	get busy() {
		return this._workerPool.busy;
	}
}