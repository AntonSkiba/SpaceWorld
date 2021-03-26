const { Router } = require("express");
const Planet = require("./Planet/Planet");

const router = Router();

let planet = null;

router.post("/init", (req, res) => {
	const {noise} = req.body;
	
	planet = new Planet(noise);
	planet.init().then((config) => {
		res.status(200).json(config);
	}).catch((err) => {
		res.status(500).json({err});
	});
});

router.get("/build", (req, res) => {
	if (!planet) res.status(400).json({err: 'Планета еще не инициализирована'});

	planet.build().then((config) => {
		res.status(200).json(config);
	}).catch((err) => {
		res.status(500).json({err});
	});
});

router.post("/chunk", (req, res) => {
	const {params} = req.body;
	const data = planet.createChunk(params);
	
	res.status(200).json({
		data
	});
});

router.get("/getmap/:side", (req, res) => {
	const side = req.params.side;
	if (!side) res.status(400).json({err: 'Не передана сторона, для которой нужно получить карту'});
	if (!planet) res.status(400).json({err: 'Планета еще не инициализирована'});

	planet.getMap(side).then(map => {
		res.status(200).json({map});
	}).catch(err => {
		res.status(500).json({err});
	});
});

module.exports = router;