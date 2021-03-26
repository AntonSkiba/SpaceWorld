const SimplexNoise = require("simplex-noise");
const fs = require("fs");
const def = require("./default");
const helper = require("./helper");
const THREE = require("three");
const Jimp = require('jimp');

// Класс создает конфигурацию новой планеты
// создает директорию, считает основу для будущих участков, то есть 6 сторон планеты
// вместе с водоемами и определением мест для графа объектов, записывает эти карты в
// виде изображенией, где цветом указана высота, а прозрачностью тип места
class Planet {
	/**
	 * @param {*} noise - объект с конфигурацией шума
	 */
	constructor(noise) {
		this._noise = {...def.noise, ...noise};
		this._build = def.build;
		this._id = def.genId();
		this._sides = def.sides;

		// то, что будет очищено после завершения сборки
		this._geometry = new THREE.PlaneBufferGeometry(1, 1, this._build.size - 1, this._build.size - 1);
		this._image = null;
		this._simplex = new SimplexNoise(this._noise.seed);
		//

		helper.log.head(`New planet, name - ${this._id}`);
		helper.log.info('Noise:');
		helper.log.info(this._noise);
		helper.log.info('\n');
	}

	init() {
		helper.log.subhead('Planet initializing');
		return this._createDir(`../SpaceWorldData/Planets/${this._id}`).then(() => {
			helper.log.info('Dir created');
			return this._writeConfig().then(config => {
				helper.log.info('Config saved');
				return this._createImage(this._build.size).then(image => {
					this._image = image;
					return config;
				}) 
			});
		});
	}

	createChunk(params) {
		const positions = [];
		const colors = [];

		const vertex = new THREE.Vector3();

		const resolution = params.resolution;
		const offset = params.offset;
		const worldMatrix = params.worldMatrix;
		const radius = params.radius;

		for (let x = 0; x < resolution; x++) {
			for (let y = 0; y < resolution; y++) {
				// от -resolution/2 до +resolution/2
				const xp = x / (resolution - 1) - 0.5;
				const yp = y / (resolution - 1) - 0.5;

				vertex.set(xp, yp, 0);
				vertex.add(offset);

				vertex.normalize();
				vertex.applyMatrix4(worldMatrix);

				const height = this._genHeight(vertex);
				const color = this._genColor(height);
				// if (height < 0.1) {
				// 	height = 0.1;
				// }

				vertex.multiplyScalar(radius + height * 3000);

				positions.push(vertex.x, vertex.y, vertex.z);
				colors.push(color.r, color.g, color.b);
			}
		}

		return {colors, positions};
	}

	_genColor(height) {
		let color = {r: 0, g: 0, b: 0};

		if (height < 0.1) {
			color.b = height * 10;
		} else if (height < 0.12) {
			color.r = 0.7;
			color.g = 0.5;
		} else if (height < 0.6) {
			color.r = 0.1;
			color.g = 0.5;
			color.b = 0.1;
		} else if (height < 0.7) {
			color.r = 0.3;
			color.g = 0.3;
			color.b = 0.3;
		} else {
			color.r = 1.0;
			color.g = 1.0;
			color.b = 1.0;
		}

		return color;
	}

	_genHeight({x, y, z}) {
		let value = 0;
        let max = 0;
        let amp = 2;
        let frequence = this._noise.frequence;
        let flatness = this._noise.flatness;
        const octaves = this._noise.octaves;

        for (let i = 0; i < octaves; i++) {
            value +=
                this._normalization(
                    this._simplex.noise3D(
                        frequence * x,
                        frequence * y,
                        frequence * z
                    ), -1, 1, 0, 1
                ) * amp;
            max += amp;
            amp /= 3;
            frequence *= 3;
        }

        value = Math.pow(value / max, flatness);

        return value;
	}

	// build() {
	// 	let side = null;

	// 	// определяем сторону, которую нужно строить
	// 	for (let s = 0; s < this._sides.length; s++) {
	// 		if (!this._sides[s].builded) {
	// 			side = this._sides[s];
	// 			break;
	// 		}
	// 	}
		
	// 	let result = null;

	// 	if (side) {
	// 		result = this._calculate(side);
	// 	}

	// 	if (result) {
	// 		console.log('side created: ', side.name);
	// 		side.builded = true;
	// 		this._build.status = this._sides.every(s => s.builded);
	// 	}

	// 	return this._writeConfig().then(config => {
	// 		if (result) {
	// 			return this._writeImage(side.name).then(() => {
	// 				if (this._build.status) {
	// 					this._clear();
	// 				}
	// 				return config;
	// 			});
	// 		} else {
	// 			return config;
	// 		}
	// 	});	
	// }

	// getMap(side) {
	// 	return Jimp.read(`../SpaceWorldData/Planets/${this._id}/${side}.png`).then(image => {
	// 		const map = []
	// 		for (let x = 0; x < image.bitmap.width; x++) {
	// 			map[x] = [];
	// 			for (let y = 0; y < image.bitmap.height; y++) {
	// 				const rgba = Jimp.intToRGBA(image.getPixelColor(y, x));
	// 				const height = rgba.r * rgba.g * rgba.b / (255 * 255 * 255);
	// 				const type = rgba.a;
	// 				map[x][y] = {height, type};
	// 			}
	// 		}
	// 		return map;
	// 	});
	// }

	// _clear() {
	// 	this._image = null;
	// 	this._geometry = null;
	// 	this._simplex = null;
	// 	this._sides.forEach(side => {
	// 		delete side.percent;
	// 		delete side.count;
	// 	});
	// }

	// _calculate(side) {
	// 	const position = this._geometry.attributes.position;
	// 	const axis  = new THREE.Vector3(
    //         side.rotation.axis === "x" ? 1 : 0,
    //         side.rotation.axis === "y" ? 1 : 0,
    //         side.rotation.axis === "z" ? 1 : 0
    //     );
	// 	const angle = (Math.PI * side.rotation.angle) / 180;
	// 	const from = side.count || 0;
	// 	const to = from + this._build.step + 1 < position.count
	// 		? from + this._build.step + 1 : position.count;

	// 	for (let i = from; i < to; i++) {
	// 		const vertex = new THREE.Vector3(
	// 			position.getX(i),
	// 			position.getY(i),
	// 			position.getZ(i) + 0.5
	// 		);

	// 		// нормализуем каждую вершину и поворачиваем
	// 		vertex.normalize().applyAxisAngle(axis, angle);
	// 		const height = this._getHeight(vertex);
			
	// 		const pixelX = i % this._build.size;
	// 		const pixelY = Math.floor(i / this._build.size);
	// 		const pixelColor = this._getColor(height);

	// 		this._image.setPixelColor(pixelColor, pixelX, pixelY);

	// 		side.count = i;
	// 		side.percent = side.count/position.count;
	// 		this._build.progress += 1 / (position.count * this._sides.length);
	// 	}

	// 	return to === position.count;
	// }

	// _getColor(h) {
	// 	const value = Math.floor(h * 255 * 255 * 255);
	// 	const rgba = Jimp.intToRGBA(value);
	// 	const color = [rgba.g, rgba.b, rgba.a, 255];
	// 	return Jimp.rgbaToInt(...color);
	// }

	// _getHeight({ x, y, z }) {
    //     let value = 0;
    //     let max = 0;
    //     let amp = 1;
    //     let frequence = this._noise.frequence;
    //     let flatness = this._noise.flatness;
    //     const octaves = this._noise.octaves;

    //     for (let i = 0; i < octaves; i++) {
    //         value +=
    //             this._normalization(
    //                 this._simplex.noise3D(
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

	_normalization(val, smin, smax, emin, emax) {
        const t = (val - smin) / (smax - smin);
        return (emax - emin) * t + emin;
    }

	_createDir(path) {
		return new Promise((resolve, reject) => {
			fs.mkdir(path, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	}

	_createImage(size) {
		return new Promise((resolve, reject) => {
			new Jimp(size, size, (err, image) => {
				if (err) reject(err);
				else {
					resolve(image);
				};
			});
		});
	}

	_writeImage(name) {
		return new Promise((resolve, reject) => {
			this._image.write(`../SpaceWorldData/Planets/${this._id}/${name}.png`, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	}

	_writeConfig() {
		return new Promise((resolve, reject) => {
			const planetConfig = {
				id: this._id,
				noise: this._noise,
				build: this._build,
				sides: this._sides
			};

			fs.writeFile(`../SpaceWorldData/Planets/${this._id}/config.json`, JSON.stringify(planetConfig, null, 2), 'utf8', (err) => {
				if (err) reject(err);
				resolve(planetConfig);
			});
		});
		
	}
}

module.exports = Planet;