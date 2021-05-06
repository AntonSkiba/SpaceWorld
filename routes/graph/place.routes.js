const { Router } = require("express");
const fs = require("fs");
const router = Router();
const biomes = require("../Planet/biomes/biomes");

// Возвращает список всех возможных типов местности, их цвета и нескольких рандомных соседей
router.get("/zones", (req, res) => {
	const list = [];
	for (let key in biomes.info) {
		list.push({
			key,
			caption: key
				.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                .toUpperCase(),
			title: biomes.info[key].title,
			color: biomes.info[key].color,
			style: {
				background: `rgba(${biomes.info[key].color.r},${biomes.info[key].color.g},${biomes.info[key].color.b}, 0.4)`,
			}
		})
	}

	res.status(200).json({list});
});

module.exports = router;