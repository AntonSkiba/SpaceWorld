const { Router } = require("express");
const router = Router();
const climate = require("../Planet/climate");
const Jimp = require("jimp");
const fs = require("fs");

router.post("/climate", (req, res) => {
	const {graph} = req.body;

	const info = climate(graph, 100);

	createImage(100).then(image => {
		for (let x = 0; x < 100; x++) {
			for (let y = 0; y < 100; y++) {
				const biome = info.map[x][y];
				const color = biome.color;
				const hex = Jimp.rgbaToInt(color.r, color.g, color.b, 255);
				image.setPixelColor(hex, x, y);
			}
		}
		image.getBase64Async(Jimp.AUTO).then(base64 => {
			res.status(200).json({
				image: base64
			});
		})
	});
});

router.post("/save", (req, res) => {
	const {name, structure} = req.body;

	fs.writeFile(`../SpaceWorldData/Graphs/${name}.json`, JSON.stringify(structure, null, 2), 'utf8', (err) => {
		res.status(200).json({
			name
		});
	});
});

router.get("/list", (req, res) => {
	fs.readdir('../SpaceWorldData/Graphs', (err, files) => {
		res.status(200).json({
			list: files.map(file => {
				const key = file.slice(0, -5);

				return {
					key,
					caption: key,
					title: key,
					style: {
						background: 'rgba(11, 25, 53, 0.4)'
					}
				};
			})
		});
	})
});

router.get("/load/:name", (req, res) => {
	const name = req.params.name;
	fs.readFile(`../SpaceWorldData/Graphs/${name}.json`, 'utf8', (err, data) => {
		if (err) console.log(err);
		const structure = JSON.parse(data);
		const vertices = {};

		const promises = structure.map(info => {
			return getConfig(info.config);
		});

		return Promise.all(promises).then(configs => {
			structure.forEach((info, idx) => {
				info.config = configs[idx];
				vertices[info.key] = info;
			});

			res.status(200).json(vertices);
		});
	});
});

function getConfig(path) {
	return new Promise(resolve => {
		if (typeof path === 'string') {
			fs.readFile(`../SpaceWorldData/Vertices/configs${path}/settings.json`, 'utf8', (err, data) => {
				const config = JSON.parse(data);
				
				return Jimp.read(`../SpaceWorldData/Vertices/configs${path}/screenshot.png`).then(image => {
					return image.getBase64Async(Jimp.AUTO).then(base64 => {
						config.screenshot = base64;
	
						return resolve(config);
					})
				});
			});
		} else {
			resolve(path);
		}
	});
}

function createImage (size) {
	return new Promise((resolve, reject) => {
		new Jimp(size, size, (err, image) => {
			if (err) reject(err);
			else {
				resolve(image);
			}
		});
	});
}

module.exports = router;