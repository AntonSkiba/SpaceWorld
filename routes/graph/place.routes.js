const { Router } = require("express");
const fs = require("fs");
const router = Router();
const biomes = require("../Planet/biomes/biomes");

// Возвращает список всех возможных типов местности, их цвета и нескольких рандомных соседей
router.get("/zones", (req, res) => {
	const names = [];
	const T = biomes.map.length; // длина карты по температуры
	const H = biomes.map[0].length; // длина карты по влажности

	for (let t = 0; t < T; t++) {
		for (let h = 0; h < H; h++) {
			const name = biomes.map[t][h];
			if (!names.includes(name)) {
				names.push(name);
			}
		}
	}


	const list = names.map((name) => {
		return {
			name,
			color: biomes.colors[name]
		};
	});

	res.status(200).json({list});
});

module.exports = router;