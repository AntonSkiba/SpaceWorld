import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

import RebuilderServer from './RebuilderServer';

export default class Manager {
	constructor(params) {
		this._sides = params.sides;
		this._groups = params.sides.map(() => new THREE.Group());
		this._chunks = {};

		this._scene = params.scene;
		this._scene.add(...this._groups);
		this._modelsGroup = new THREE.Group();
		this._scene.add(this._modelsGroup);

		this._material = this._createMaterial();
		this._modelMaterial = this._createModelMaterial();
		this._models = {};

		this._builder = new RebuilderServer(this._models, this._modelsGroup);
	}

	update(pos) {
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
		
		// Для RebuilderClient
		// const recycle = Object.values(this._getDifference(this._chunks, newQuads));
		// this._builder._old.push(...recycle);
		
		// Для RebuilderServer
		const recycle = this._getDifference(this._chunks, newQuads);
		if (Object.keys(difference).length) {
			this._builder._changes.push({difference, recycle, draw: {}});
		}
		
		newQuads = intersection;
		
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

	// загружаем все модели
	downloadModels(models) {
		models.forEach(config => {
			this._createModel(config);
		});
	}

	_createModel(config) {
		// загрузка файла
		fetch(`/api/shape/download/${config.link}`, {
            method: "GET"
        }).then((res) => {
            return res.json();
        }).then((res) => {
            this._fileProcessing(new File([res.file], config.name), config);
        });
	}

	_fileProcessing(file, config) {
		const shapeReader = new FileReader();
		shapeReader.onload = () => {
			const shapeLoader = new OBJLoader();
			shapeLoader.load(shapeReader.result, (shape) => {
				this._modelSetup(shape, config);
			});
		};

		shapeReader.readAsDataURL(file);
	}

	_modelSetup(shape, config) {
		shape.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.material = this._modelMaterial;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		const box = new THREE.Box3().setFromObject(shape);
		const center = new THREE.Vector3();
		const size = new THREE.Vector3();
		box.getCenter(center);
		box.getSize(size);

		const pos = {
			y: -box.min.y,
            x: -center.x,
            z: -center.z
		}

		// увеличиваем
		shape.scale.x = config.scale;
		shape.scale.y = config.scale;
		shape.scale.z = config.scale;

		// центрируем
		shape.position.y = pos.y * config.scale;
        shape.position.x = pos.x * config.scale;
        shape.position.z = pos.z * config.scale;

		// записываем
		const key = config.link.slice(0, -4);
		console.log('Модель ' + key + ' выгружена');
		this._models[key] = shape;
	}

	_createModelMaterial() {
		return new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 40
        });
	}

	_createMaterial() {
		return new THREE.MeshPhongMaterial({
            color: 0xffffff,
            // wireframe: true,
            vertexColors: THREE.VertexColors,
            shininess: 0.1,
        });
	}

	_createChunk(params) {
		const chunkParams = {
			material: this._material,
			resolution: 100,
			...params
		}

		return this._builder.allocateChunk(chunkParams);
	}
}