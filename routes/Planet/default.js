// дефолтная конфигурация для создания планеты

const def = {
	// конфигурация шума
	noise: {
		terrain: {
			seed: 4,
			octaves: 16,
			frequence: 2,
			flatness: 3,
		},
		biomes: {
			seed: 16,
			octaves: 8,
			frequence: 5,
			flatness: 1,
		}
	},

	// конфигурация построения планеты
	build: {
		progress: 0,
		status: false,
		// size * size - размер карты для одной стороны
		size: 500,
		// сколько вершин создавать за одну итерацию
		step: 200000
	},

	// генератор id для планеты
	genId: () => {
		return 'last_' + Date.now();
	},

	// конфиг сторон планеты
	sides: [{
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
	}]
}

module.exports = def;