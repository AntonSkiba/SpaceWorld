const fs = require("fs");
const climate = require("./climate");
const THREE = require("three");
const Jimp = require("jimp");
const Noise = require("./Noise");

// Класс создает конфигурацию новой планеты
// создает директорию, считает основу для будущих участков, то есть 6 сторон планеты
// вместе с водоемами и определением мест для графа объектов, записывает эти карты в
// виде изображенией, где цветом указана высота, а прозрачностью тип места
class Planet {
    constructor(graph, radius, height) {
        this._id = 'planet_' + Date.now();
        this._sides = [{
            name: 'top',
            rotation: {axis: "x", angle: -90}
        }, {
            name: 'bottom',
            rotation: {axis: "x", angle: 90}
        }, {
            name: 'front',
            rotation: {axis: "y", angle: 0}
        }, {
            name: 'back',
            rotation: {axis: "y", angle: 180}
        }, {
            name: 'left',
            rotation: {axis: "y", angle: 270}
        }, {
            name: 'right',
            rotation: {axis: "y", angle: 90}
        }];

        this._radius = radius;
        this._height = height;

        this._terrainNoise = new Noise({
            seed: graph.terrainSeed,
            octaves: 16,
			frequence: 2,
			flatness: 3,
            amplitude: 2
        });

        this._biomeNoise = new Noise({
            seed: graph.biomeSeed,
            octaves: 8,
            frequence: 5,
            flatness: 1,
            amplitude: 2
        });

        this._graph = graph;

        this._data = {
            climate: climate(graph, 100).map,
            sides: {}
        };

        // конфиг для построения рефернсного ландшафта
        this._build = {
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
        };

        // полная конфигурация планеты
        this._config = {
            id: this._id,
            radius: this._radius,
            height: this._height,

            graph,

            noise: {
                terrain: this._terrainNoise.getConfig(),
                biome: this._biomeNoise.getConfig()
            },

            sides: this._sides,
        }

        console.log(`New planet, name - ${this._id}`);
        console.log("Terrain noise:");
        console.log(this._config.noise.terrain);
        console.log("Biome noise:");
        console.log(this._config.noise.biome);
        console.log("Graph:");
        console.log(this._graph)
    }

    init() {
        console.log("Planet initializing");
        return this._createDir(`../SpaceWorldData/Planets/${this._id}`).then(() => {
                console.log("Dir created");

                return this._saveClimate().then(() => {
                    return this._config;
                });
                
            }
        );
    }

    _saveClimate() {
        return this._createImage(100).then(image => {
            for (let x = 0; x < 100; x++) {
                for (let y = 0; y < 100; y++) {
                    const biome = this._data.climate[x][y];
                    const color = biome.color;
                    const hex = Jimp.rgbaToInt(color.r, color.g, color.b, 255);
                    image.setPixelColor(hex, x, y);
                }
            }

            return this._writeImage(image, 'climateMap');
        });
    }

    chunk(params) {
        const objects = [];
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

        const level = params.level;

        // для 0 уровня детализируем больше, для того, чтобы издалека планета смотрелась нормально
        const resolution = !level ? params.resolution * 2 : params.resolution;
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

                let elevation = this._terrainNoise.genValue(vertex);
                const biomeValue = this._biomeNoise.genValue(vertex);
                const temperature = Noise.getTemperature(vertex, elevation);
                const biome = Noise.getBiome(elevation, biomeValue, temperature, this._data.climate);

                if (elevation < 0.1) {
                	elevation = 0.1;
                }

                // на определенном уровне начинаем собирать объекты
                if (params.objects && elevation > 0.1) {
                    const pointObjects = this._getPointObjects({x, y, worldMatrix, resolution, offset}, {vertex: vertex.clone(), zone: biome.key, elevation});
                    objects.push(...pointObjects);
                }

                vertex.multiplyScalar(this._radius + elevation * this._height);

                positions.push(vertex.x, vertex.y, vertex.z);
                
                colors.push(
                    biome.color.r / 255,
                    biome.color.g / 255,
                    biome.color.b / 255
                );
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

        return {colors, positions, normals, tangents, uvs, indices, objects};
    }

    _getPointObjects(coor, point, depth) {
        const objects = [];
        this._graph.models.forEach(model => {
            // собираем параметры родительской зоны
            const clustering = model.parent.clustering;
            const saturation = model.parent.saturation;
            const chaotic = model.parent.chaotic;
            const fullness = model.parent.fullness;
            const zone = model.parent.zone;

            // убираем .obj
            const key = model.link.slice(0, -4);
            // убираем object_
            const id = key.slice(7);

            const noise = new Noise({
                seed: id,
                octaves: 20,
                frequence: 1/clustering,
                flatness: 1,
                amplitude: 20
            });

            const value = noise.genValue(point.vertex);

            let step = Math.ceil((1.01 - saturation) * coor.offset.z);
            step = step < 4 ? 4 : step;
            const checked = !(coor.x % step) && !(coor.y % step);

            if (value > 1 - fullness && checked) {
                if (zone === point.zone) {
                    const position = this._getChaoticPosition(coor.x, coor.y, coor.offset, coor.resolution, coor.worldMatrix, point.elevation, chaotic);

                    objects.push({
                        key,
                        position: position.vertex,
                        angle: position.angle
                    });
                }
            }
            
        });

        return objects;
    }

    _getChaoticPosition(x, y, offset, resolution, matrix, old, strong) {
        // Расчитываем угол
        const randomParam = old * 0x131297 % 0xf5abe1;
        const direction = randomParam - Math.floor(randomParam);
        const quadAngle = Math.PI * Math.floor(direction * 4) / 2 ; // 0, 0.5PI, PI, 1.5PI
        const angle = quadAngle + direction * strong * Math.PI * 2; // 0 - 2PI

        const vertex = new THREE.Vector3();
        const xp = (x + Math.cos(angle)) / (resolution - 1) - 0.5;
        const yp = (y + Math.sin(angle)) / (resolution - 1) - 0.5;

        vertex.set(xp, yp, 0);
        vertex.add(offset);

        vertex.normalize();
        vertex.applyMatrix4(matrix);

        const elevation = this._terrainNoise.genValue(vertex);

        vertex.multiplyScalar(this._radius + elevation * this._height);

        return {angle, vertex};
    }

    // создаем референсные карты
    build() {
        const side = this._build.side;
	
		side.name = this._sides[side.index].name;

		const rotation = this._sides[side.index].rotation;

        const axis = new THREE.Vector3(
            rotation.axis === "x" ? 1 : 0,
            rotation.axis === "y" ? 1 : 0,
            rotation.axis === "z" ? 1 : 0
        );
        const angle = (Math.PI * rotation.angle) / 180;
        const matrix = new THREE.Matrix4();
        matrix.makeRotationAxis(axis, angle);

        const params = {
            resolution: 2000,
            offset: {x: 0, y: 0, z: 0.5},
            worldMatrix: matrix
        }

        const map = this.chunk(params, true);
        
        side.index++;
        
        // записываем созданные карты в данные
        this._data.sides[side.name] = map;
	
		this._build.percent = side.index / this._sides.length;
	
		if (side.name === this._sides[this._sides.length - 1].name) {
			this._build.done = true;
		}
        return this._build;
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

    _writeImage(image, name) {
        return new Promise((resolve, reject) => {
            image.write(
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
