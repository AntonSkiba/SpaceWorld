import Chunk from './Chunk';

export default class RebuilderClient {
	constructor () {
		this._pool = [];
		this._reset();
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
		} else {
			chunk = new Chunk(params);
		}

		chunk.hide();

		this._queued.push(chunk);

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

	_reset() {
		this._active = null;
		this._queued = [];
		this._old = [];
		this._new = [];
	}

	get busy() {
		return this._active || this._queued.length;
	}

	update() {
		//console.log(this._queued);
		if (this._active) {
			const build = this._active.next();
			if (build.done) {
				this._active = null;
			}
		} else {
			const chunk = this._queued.pop();
			if (chunk) {
				this._active = chunk.rebuild();
				this._new.push(chunk);
			}
		}

		if (this._active) {
			return;
		}

		if (!this._queued.length) {
			// if (this._old.length) {
			// 	console.log(this._old);
			// }
			this._recycleChunks(this._old);
			for (let chunk of this._new) {
				chunk.show();
			}

			this._reset();
		}
	}
}