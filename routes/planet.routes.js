const { Router } = require("express");
const Planet = require("./Planet/Planet");

const router = Router();

let planet = null;

router.post("/init", (req, res) => {
	const {radius, height, graph} = req.body;
	
	planet = new Planet(graph, radius, height);
	planet.init().then((config) => {
		res.status(200).json(config);
	}).catch((err) => {
		res.status(500).json({err});
	});
});

router.get("/build", (req, res) => {
	if (!planet) res.status(400).json({err: 'Планета еще не инициализирована'});

	res.status(200).json(planet.build());
});

// router.get("/climate", (req, res) => {
// 	if (!planet) res.status(400).json({err: 'Планета еще не инициализирована'});

// 	planet.climate().then(info => {
// 		res.status(200).json(info);
// 	});
// });

// router

router.post("/chunk", (req, res) => {
	const {params} = req.body;
	const data = planet.chunk(params);
	
	res.status(200).json({
		data
	});
});

module.exports = router;