const SimplexNoise = require("simplex-noise");
const fs = require("fs");
const def = require("./default");
const biomes = require("./biomes/biomes");
const helper = require("./helper");
const THREE = require("three");
const Jimp = require("jimp");

// Класс создает конфигурацию новой планеты
// создает директорию, считает основу для будущих участков, то есть 6 сторон планеты
// вместе с водоемами и определением мест для графа объектов, записывает эти карты в
// виде изображенией, где цветом указана высота, а прозрачностью тип места
class Planet {
    /**
     * @param {*} noise - объект с конфигурацией шума
     */
    constructor(noise, radius, height) {
        this._noise = { ...def.noise, ...noise };
        this._build = def.build;
        this._id = def.genId();
        this._sides = def.sides;
        this._radius = radius;
        this._height = height;

        // то, что будет очищено после завершения сборки
        // this._geometry = new THREE.PlaneBufferGeometry(
        //     1,
        //     1,
        //     this._build.size - 1,
        //     this._build.size - 1
        // );
        this._image = null;
        this._simplex = {
            terrain: new SimplexNoise(this._noise.terrain.seed),
            biomes: new SimplexNoise(this._noise.biomes.seed)
        } 
        //

        // полная конфигурация планеты
        this._config = {
            id: this._id,
            radius: this._radius,
            height: this._height,

            noise: this._noise,

            process: {
                name: 'init',

                init: {
                    done: false
                },

                build: {
                    percent: 0,
                    side: {
                        index: 0,
                        name: '',
                        percent: 0,
                        from: {x: 0, y: 0},
                        count: 500,
                        done: false
                    },
                    done: false
                },
            },

            sides: this._sides,

            references: {
                resolution: 2000,
                sides: {}
            }
        }

        this._references = {};


        helper.log.head(`New planet, name - ${this._id}`);
        helper.log.info("Noise:");
        helper.log.info(this._noise);
        helper.log.info("\n");
    }

    init() {
        helper.log.subhead("Planet initializing");
        return this._createDir(`../SpaceWorldData/Planets/${this._id}`).then(() => {
                helper.log.info("Dir created");

                this._config.process.init.done = true;

                return this._writeConfig().then(() => {
                    helper.log.info("Config saved");

                    return this._config;
                });
            }
        );
    }


    createChunk(params) {
        const positions = [];
        const colors = [];
        const normals = [];
        const tangents = [];
        const uvs = [];
        const indices = [];

        const vertex = new THREE.Vector3();
        
		const D = new THREE.Vector3();
		const D1 = new THREE.Vector3();
      	const D2 = new THREE.Vector3();

		const N = new THREE.Vector3();
		const N1 = new THREE.Vector3();
		const N2 = new THREE.Vector3();
		const N3 = new THREE.Vector3();

        const resolution = params.resolution;
        const offset = params.offset;
        const worldMatrix = params.worldMatrix;

        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                // от -resolution/2 до +resolution/2
                const xp = x / (resolution - 1) - 0.5;
                const yp = y / (resolution - 1) - 0.5;

                vertex.set(xp, yp, 0);
                vertex.add(offset);

                vertex.normalize();
                vertex.applyMatrix4(worldMatrix);

                D.copy(vertex);

                let elevation = this._genValue(vertex, 'terrain');
                const biome = this._genValue(vertex, 'biomes');
                const temperature = this._genTemperature(vertex, elevation);
                const color = this._genColor(elevation, biome, temperature);
                if (elevation < 0.1) {
                	elevation = 0.1;
                }

                vertex.multiplyScalar(this._radius + elevation * this._height);

                positions.push(vertex.x, vertex.y, vertex.z);
                colors.push(color.r, color.g, color.b);
                normals.push(D.x, D.y, D.z);
                tangents.push(1, 0, 0, 1);
                uvs.push(vertex.x / 10, vertex.y / 10);
            }
        }

        for (let i = 0; i < resolution - 1; i++) {
            for (let j = 0; j < resolution - 1; j++) {
                indices.push(
                    i * (resolution) + j,
                    (i + 1) * (resolution) + j + 1,
                    i * (resolution) + j + 1
                );
                indices.push(
                    (i + 1) * (resolution) + j,
                    (i + 1) * (resolution) + j + 1,
                    i * (resolution) + j
                );
            }
        }

		for (let i = 0; i < indices.length; i += 3) {
			const i1 = indices[i] * 3;
			const i2 = indices[i+1] * 3;
			const i3 = indices[i+2] * 3;

			N1.fromArray(positions, i1);
			N2.fromArray(positions, i2);
			N3.fromArray(positions, i3);

			D1.subVectors(N3, N2);
			D2.subVectors(N1, N2);
			D1.cross(D2);

			normals[i1] += D1.x;
			normals[i2] += D1.x;
			normals[i3] += D1.x;

			normals[i1+1] += D1.y;
			normals[i2+1] += D1.y;
			normals[i3+1] += D1.y;

			normals[i1+2] += D1.z;
			normals[i2+2] += D1.z;
			normals[i3+2] += D1.z;
		}

		for (let i = 0, n = normals.length; i < n; i+=3) {
			N.fromArray(normals, i);
			N.normalize();
			normals[i] = N.x;
			normals[i+1] = N.y;
			normals[i+2] = N.z;
		}

        return {colors, positions, normals, tangents, uvs, indices};
    }

    _genTemperature(vertex, elevation) {
        // чем больше высота, тем холоднее, height (0, 1)
        const eTemp = 1 - elevation;
        // чем дальше от экватора, тем холоднее, y (-1, 1)
        const aTemp = 1 - Math.pow(vertex.y, 2);
        return aTemp * eTemp; //(aTemp + eTemp) / 2;
    }

    _genColor(elevation, biome, temperature) {
        let color = { r: 0, g: 0, b: 0 };

        if (elevation < 0.1) {
            color.b = elevation * 6 + temperature / 2.5;
        } else {
            const tempMax = biomes.map.length - 1;
            const humMax = biomes.map[0].length - 1;
            const tempIndex = tempMax - Math.round(temperature * tempMax);
            const humIndex = Math.round(biome * humMax);
    
            const type = biomes.map[tempIndex][humIndex];
            const rgbColor = biomes.colors[type];
            
            color.r = rgbColor.r / 255;
            color.g = rgbColor.g / 255;
            color.b = rgbColor.b / 255;
        }

        return color;
    }

    _genValue({ x, y, z }, type = 'terrain') {
        let value = 0;
        let max = 0;
        let amp = 2;
        let frequence = this._noise[type].frequence;
        let flatness = this._noise[type].flatness;
        const octaves = this._noise[type].octaves;

        for (let i = 0; i < octaves; i++) {
            value +=
                this._normalization(
                    this._simplex[type].noise3D(
                        frequence * x,
                        frequence * y,
                        frequence * z
                    ),
                    -1,
                    1,
                    0,
                    1
                ) * amp;
            max += amp;
            amp /= 3;
            frequence *= 3;
        }

        value = Math.pow(value / max, flatness);

        return value;
    }

    // создаем референсные карты
    build() {
        this._config.process.name = 'build';

        const side = this._config.process.build.side;
        const sidesArr = this._config.sides;

        if (side.done) {
            side.index++;
            side.percent = 0;
            side.done = false;
            side.from = {x: 0, y: 0};
        }

        side.name = sidesArr[side.index].name;
        side.rotation = sidesArr[side.index].rotation;

        this._generateMap(side);

        return this._config;

    }

    // создаем карту
    _generateMap(side) {
        console.log(side);
        const axis  = new THREE.Vector3(
            side.rotation.axis === "x" ? 1 : 0,
            side.rotation.axis === "y" ? 1 : 0,
            side.rotation.axis === "z" ? 1 : 0
        );
    	const angle = (Math.PI * side.rotation.angle) / 180;
        const vertex = new THREE.Vector3();

        const resolution = this._config.references.resolution;
        const xFrom = side.from.x;
        const yFrom = side.from.y;
        const xTo = Math.min(side.from.x + side.count, resolution);
        const yTo = Math.min(side.from.y + side.count, resolution);

        if (!this._references[side.name]) {
            this._references[side.name] = [];
        }

        for (let x = xFrom; x < xTo; x++) {
            this._references[side.name][x] = []
            for (let y = yFrom; y < yTo; y++) {
                // от -resolution/2 до +resolution/2
                const xp = x / (resolution - 1) - 0.5;
                const yp = y / (resolution - 1) - 0.5;

                vertex.set(xp, yp, 0.5);

                vertex.normalize();
                vertex.applyAxisAngle(axis, angle);

                const elevation = this._genValue(vertex, 'terrain');
                const biome = this._genValue(vertex, 'biomes');
                const temperature = this._genTemperature(vertex, elevation);
                const color = this._genColor(elevation, biome, temperature);

                this._references[side.name][x].push({
                    height: elevation,
                    biomeHeight: biome,
                    temperature,
                    color
                });
            }
        }

        side.from = {
            x: xTo,
            y: yTo
        }

        side.percent += side.count / resolution;
        this._config.process.build.percent += side.count / (this._config.sides.length * resolution);

        if (xTo === resolution && yTo === resolution) {
            side.done = true;

            if (side.name === this._config.sides[this._config.sides.length - 1].name) {
                this._config.process.build.done = true;
            }
        }

    }

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
                }
            });
        });
    }

    _writeImage(name) {
        return new Promise((resolve, reject) => {
            this._image.write(
                `../SpaceWorldData/Planets/${this._id}/${name}.png`,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }

    _writeConfig() {
        return new Promise((resolve, reject) => {
            fs.writeFile(
                `../SpaceWorldData/Planets/${this._id}/config.json`,
                JSON.stringify(this._config, null, 2),
                "utf8",
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }
}

module.exports = Planet;
