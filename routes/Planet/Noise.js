const SimplexNoise = require("simplex-noise");

class Noise {
	constructor(config) {
		this._seed = config.seed || 'earth';
		this._octaves = config.octaves || 16;
		this._frequence = config.frequence || 2;
		this._flatness = config.flatness || 3;
		this._amplitude = config.amplitude || 2;
		this._simplex = new SimplexNoise(this._seed);
	}

	genValue({x, y, z}) {
		let value = 0;
        let max = 0;
        let amplitude = this._amplitude;
		let frequence = this._frequence;

		for (let i = 0; i < this._octaves; i++) {
            value +=
                this._normalization(
                    this._simplex.noise3D(
                        frequence * x,
                        frequence * y,
                        frequence * z
                    ),
                    -1,
                    1,
                    0,
                    1
                ) * amplitude;
            max += amplitude;
            amplitude /= 3;
            frequence *= 3;
        }

		value = Math.pow(value / max, this._flatness);

        return value;
	}

	_normalization(val, smin, smax, emin, emax) {
		const t = (val - smin) / (smax - smin);
		return (emax - emin) * t + emin;
	}

	getConfig() {
		return {
			seed: this._seed,
			octaves: this._octaves,
			frequence: this._frequence,
			flatness: this._flatness,
			amplitude: this._amplitude
		}
	}

	static getTemperature(vertex, elevation) {
		// чем больше высота, тем холоднее, height (0, 1)
        const eTemp = 1 - elevation;
        // чем дальше от экватора, тем холоднее, y (-1, 1)
        const aTemp = 1 - Math.pow(vertex.y, 2);
        return aTemp * eTemp; //(aTemp + eTemp) / 2;
	}

	static getBiome(elevation, biome, temperature, climate) {
		if (elevation < 0.1) {
            return {type: 'water', color: {b: 255 * (elevation * 6 + temperature / 2.5)}}
        } else {
            const tempMax = climate.length - 1;
            const humMax = climate.length - 1;
            const tempIndex = Math.round(temperature * tempMax);
            const humIndex = Math.round(biome * humMax);
            
            return climate[tempIndex][humIndex];
        }
	}
}

module.exports = Noise;