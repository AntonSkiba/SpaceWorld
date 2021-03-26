import * as THREE from "three";
import SimplexNoise from 'simplex-noise';
//import ChunkRebuilder from './ChunkRebuilder/ChunkRebuilder';
import ChunkRebuilderThreaded from './ChunkRebuilder/ChunkRebuilderThreaded';

export default class ChunkManager {
	constructor(params) {
		this._noise = params.noise;
		this._simplex = new SimplexNoise(params.noise.seed);

		this._sides = params.sides;
		this._groups = params.sides.map(() => new THREE.Group());
		this._chunks = {};

		this._scene = params.scene;
		this._scene.add(...this._groups);

		this._material = this._createMaterial();
		this._builder = new ChunkRebuilderThreaded();
	}

	update(pos) {
		this._builder.update();
		// если билдер не заполнен, то вызываем обновление дерева
		if (!this._builder.busy) {
			this._updateQuadTree(pos);
		}
	}

	_updateQuadTree(pos) {
		// вставляем позицию камеры в каждое дерево
		let newQuads = {};
		for (let s = 0; s < this._sides.length; s++) {
			// в дерево вставляется точка
			this._sides[s].quadTree.insert(pos);

			// в объект собираются все квадранты, которые должны быть отрисованы
			const sideQuads = this._sides[s].quadTree.getChildren();
			// каждому квадранту приписывается группа, соответствующая стороне
			for (const quadKey in sideQuads) {
				sideQuads[quadKey].group = this._groups[s];
			}

			// далее все квадранты данной стороны, приписываются к общему объекту квадрантов
			newQuads = {
				...newQuads,
				...sideQuads
			}
		}

		const intersection = this._getIntersection(this._chunks, newQuads);
		const difference = this._getDifference(newQuads, this._chunks);
		
		// Для ChunkRebuilder
		// const recycle = Object.values(this._getDifference(this._chunks, newQuads));
		// this._builder._old.push(...recycle);
		
		// Для ChunkRebuilderThreaded
		const recycle = this._getDifference(this._chunks, newQuads);
		if (Object.keys(difference).length) {
			this._builder._changes.push({difference, recycle, draw: {}});
		}
		
		newQuads = intersection;

		// if (Object.keys(difference).length) {
		// 	console.log(intersection);
		// 	console.log(difference);
		// }
		// if (recycle.length) {
		// 	console.log(recycle);
		// }
		
		// превращаем квадранты в настоящие участки
		for (let key in difference) {
			newQuads[key] = this._createChunk(difference[key]);
		}

		this._chunks = newQuads;
	}

	// пересечение двух объектов
	_getIntersection(dictA, dictB) {
		const intersection = {};
		for (let k in dictB) {
			if (k in dictA) {
				intersection[k] = dictA[k];
			}
		}
		return intersection;
	}

	// вычитание двух объектов
	_getDifference(dictA, dictB) {
		const diff = {...dictA};
		for (let k in dictB) {
			delete diff[k];
		}
		return diff;
	}

	_createMaterial() {
		return new THREE.MeshPhongMaterial({
            color: 0xffffff,
            //wireframe: true,
            vertexColors: THREE.VertexColors,
            shininess: 0.1,
        });
	}

	_createChunk(params) {
		const chunkParams = {
			material: this._material,
			resolution: 128,
			simplex: this._simplex,
			noise: this._noise,
			...params
		}

		return this._builder.allocateChunk(chunkParams);
	}
}