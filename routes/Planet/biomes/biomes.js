const biomes = {
	// temperature / humidity
	map: [
		['desert', 'desert', 'desert', 'desert', 'desert', 'beach', 'beach', 'beach'],
		['desert', 'desert', 'desert', 'savanna', 'savanna', 'jungleEdge', 'jungleEdge', 'beach'],
		['desert', 'desert', 'savanna', 'savanna', 'warmForest', 'jungle', 'jungle', 'beach'],
		['desert', 'desert', 'savanna', 'plains', 'warmForest', 'warmForest', 'jungle', 'swamp'],
		['desert', 'coldForest', 'plains', 'plains', 'warmForest', 'warmForest', 'forest', 'swamp'],
		['coldDesert', 'coldForest', 'plains', 'plains', 'warmForest', 'forest', 'forest', 'stoneShore'],
		['coldDesert', 'coldForest', 'coldForest', 'coldForest', 'taiga', 'taiga', 'forest', 'stoneShore'],
		['coldDesert', 'wetTundra', 'wetTundra', 'wetTundra', 'coldForest', 'taiga', 'taiga', 'stoneShore'],
		['iceCap', 'iceCap', 'iceCap', 'iceCap', 'iceCap', 'snowCap', 'snowCap', 'snowCap']
	],

	info: {
		desert: {
			title: 'Пустыня, жаркий сухой климат',
			T: [0, 50],
			H: [1, 50],
			center: {x: 25, y: 80},
			color: {r: 221, g: 142, b: 52}
		},
		beach: {
			title: 'Пляж, жаркий влажный климат',
			T: [20, 50],
			H: [50, 100],
			center: {x: 75, y: 85},
			color: {r: 235, g: 215, b: 162}
		},
		savanna: {
			title: 'Саванна, жаркий умеренно-сухой климат',
			T: [10, 40],
			H: [20, 40],
			center: {x: 30, y: 75},
			color: {r: 172, g: 189, b: 95}
		},

		jungle: {
			title: 'Жаркие джунгли с высокой влажностью',
			T: [25, 45],
			H: [40, 80],
			center: {x: 60, y: 85},
			color: {r: 49, g: 107, b: 15}
		},

		plains: {
			title: 'Теплые умеренно-сухие равнины',
			T: [5, 30],
			H: [10, 30],
			center: {x: 20, y: 68},
			color: {r: 132, g: 165, b: 90}
		},

		warmForest: {
			title: 'Теплые леса с умеренно-влажным климатом',
			T: [5, 35],
			H: [40, 75],
			center: {x: 57, y: 70},
			color: {r: 45, g: 142, b: 73}
		},

		forest: {
			title: 'Лес с повышенной влажностью',
			T: [10, 40],
			H: [60, 85],
			center: {x: 72, y: 75},
			color: {r: 0, g: 56, b: 0}
		},

		swamp: {
			title: 'Болото, прохладный очень влажный климат',
			T: [5, 25],
			H: [85, 100],
			center: {x: 93, y: 55},
			color: {r: 44, g: 69, b: 10}
		},

		coldDesert: {
			title: 'Холодная сухая пустыня',
			T: [-30, 5],
			H: [1, 20],
			center: {x: 10, y: 37},
			color: {r: 179, g: 177, b: 114}
		},

		coldForest: {
			title: 'Холодный умеренно-сухой лес',
			T: [-20, 5],
			H: [20, 50],
			center: {x: 40, y: 43},
			color: {r: 143, g: 161, b: 132}
		},

		taiga: {
			title: 'Холодная умеренно-влажная тайга',
			T: [-20, 5],
			H: [50, 80],
			center: {x: 65, y: 43},
			color: {r: 1, g: 75, b: 56}
		},

		stoneShore: {
			title: 'Холодное каменное побережъе',
			T: [-25, 10],
			H: [75, 100],
			center: {x: 87, y: 42},
			color: {r: 170, g: 163, b: 126}
		},

		wetTundra: {
			title: 'Ледяная умеренно-влажная тундра',
			T: [-35, -20],
			H: [20, 75],
			center: {x: 48, y: 16},
			color: {r: 230, g: 211, b: 255}
		},

		iceCap: {
			title: 'Ледяные пустыни или ледяные пики',
			T: [-49, -30],
			H: [1, 60],
			center: {x: 30, y: 10},
			color: {r: 180, g: 220, b: 220}
		},

		snowCap: {
			title: 'Снег и заснеженные горы',
			T: [-49, -25],
			H: [60, 100],
			center: {x: 80, y: 8},
			color: {r: 228, g: 246, b: 250}
		}
	},

	colors: {
		ocean: {r: 17, g: 0, b: 77},
		plains: {r: 132, g: 165, b: 90},
		desert: {r: 221, g: 142, b: 52},
		coldDesert: {r: 179, g: 177, b: 114},
		mountains: {r: 58, g: 58, b: 58},
		forest: {r: 0, g: 56, b: 0},
		taiga: {r: 1, g: 75, b: 56},
		swamp: {r: 44, g: 39, b: 10},
		river: {r: 1, g: 4, b: 153},
		netherWastes: {r: 119, g: 23, b: 23},
		frozenOcean: {r: 112, g: 60, b: 233},
		frozenRiver: {r: 154, g: 98, b: 243},
		snowyTundra: {r: 226, g: 255, b: 241},
		wetTundra: {r: 230, g: 211, b: 255},
		snowyMountains: {r: 206, g: 206, b: 206},
		beach: {r: 235, g: 215, b: 162},
		desertHills: {r: 175, g: 80, b: 25},
		woodedHills: {r: 31, g: 85, b: 0},
		taigaHills: {r: 0, g: 51, b: 17},
		mountainEdge: {r: 71, g: 82, b: 99},
		jungle: {r: 49, g: 107, b: 15},
		jungleHills: {r: 31, g: 56, b: 28},
		jungleEdge: {r: 74, g: 131, b: 27},
		deepOcean: {r: 1, g: 10, b: 36},
		stoneShore: {r: 170, g: 163, b: 126},
		snowyBeach: {r: 224, g: 212, b: 176},
		birchForest: {r: 52, g: 110, b: 71},
		birchForestHills: {r: 31, g: 68, b: 31},
		darkForest: {r: 48, g: 66, b: 5},
		snowyTaiga: {r: 15, g: 66, b: 58},
		snowyTaigaHills: {r: 8, g: 44, b: 39},
		coldForest: {r: 143, g: 161, b: 132},
		giantTreeTaigaHills: {r: 69, g: 79, b: 62},
		woodedMountains: {r: 80, g: 112, b: 80},
		savanna: {r: 172, g: 189, b: 95},
		savannaPlateau: {r: 167, g: 157, b: 100},
		badlands: {r: 217, g: 69, b: 21},
		woodedBadlandsPlateau: {r: 176, g: 151, b: 101},
		badlandsPlateau: {r: 202, g: 140, b: 101},
		endMidlands: {r: 128, g: 128, b: 255},
		warmOcean: {r: 0, g: 0, b: 172},
		lukewarmOcean: {r: 0, g: 0, b: 144},
		coldOcean: {r: 32, g: 32, b: 112},
		deepWarmOcean: {r: 0, g: 0, b: 80},
		deepLukewarmOcean: {r: 0, g: 0, b: 64},
		deepColdOcean: {r: 32, g: 32, b: 56},
		deepFrozenOcean: {r: 64, g: 64, b: 144},
		theVoid: {r: 0, g: 0, b: 0},
		sunflowerPlains: {r: 181, g: 219, b: 136},
		desertLakes: {r: 255, g: 188, b: 64},
		gravellyMountains: {r: 136, g: 136, b: 136},
		warmForest: {r: 45, g: 142, b: 73},
		taigaMountains: {r: 51, g: 142, b: 129},
		swampHills: {r: 47, g: 255, b: 218},
		iceCap: {r: 180, g: 220, b: 220},
		snowCap: {r: 228, g: 246, b: 250},
		modifiedJungle: {r: 123, g: 163, b: 49},
		modifiedJungleEdge: {r: 138, g: 179, b: 63},
		tallBirchForest: {r: 88, g: 156, b: 108},
		tallBirchHills: {r: 71, g: 135, b: 90},
		darkForestHills: {r: 104, g: 121, b: 66},
		snowyTaigaMountains: {r: 89, g: 125, b: 114},
		giantSpruceTaiga: {r: 129, g: 142, b: 121},
		giantSpruceTaigaHills: {r: 109, g: 119, b: 102},
		shatteredSavanna: {r: 229, g: 218, b: 135},
		shatteredSavannaPlateau: {r: 207, g: 197, b: 140},
		erodedBadlands: {r: 255, g: 109, b: 61},
		modifiedWoodedBadlandsPlateau: {r: 216, g: 191, b: 141},
		modifiedBadlandsPlateau: {r: 242, g: 180, b: 141},
		bambooJungle: {r: 118, g: 142, b: 20},
		bambooJungleHills: {r: 59, g: 71, b: 10},
		soulSandValley: {r: 94, g: 56, b: 48},
		crimsonForest: {r: 221, g: 8, b: 8},
		warpedForest: {r: 73, g: 144, b: 123},
		basaltDeltas: {r: 64, g: 54, b: 54}
	}
};

module.exports = biomes;