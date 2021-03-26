import Chunk from "../Chunk";

class WorkerThread {
    constructor() {
        // this._worker = new Worker(s, {type: 'module'});
        // this._worker.onmessage = (e) => {
        //     this._onMessage(e);
        // };
		// this._worker.onerror = (err) => {
		// 	console.error(err);
		// };
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
	constructor () {
		this._pool = [];
		this._old = [];
		this._changes = [];

		// this._workerPool = new WorkerThreadPool(
		// 	7, './ChunkRebuilderThreaded_worker.js'
		// );
		this._workerPool = new WorkerThreadPool(10);
	}

	_onResult(chunk, msg) {
		//console.log(msg);
		chunk.rebuildMeshFromData(msg.data);
		//chunk.show();

		const chunkKey = chunk._params.name;

		console.log(chunkKey);

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
			resolution: params.resolution,
			offset: params.offset,
			worldMatrix: params.worldMatrix,
			radius: params.radius,
			noise: params.noise
		}

		const msg = {
			subject: 'build_chunk',
			params: threadedParams
		}

		this._workerPool.enqueue(msg, (message) => {
			this._onResult(chunk, message);
		})

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

	update() {
		//console.log(this._changes.length);
		// if (!this.busy) {
		// 	this._recycleChunks(this._old);
		// 	this._old = [];
		// }
	}
}