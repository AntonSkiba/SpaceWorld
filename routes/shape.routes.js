const {Router} = require('express');
const fs = require('fs');
const path = require('path');
const Shape = require('../models/Shape');
const multer = require('multer');
const router = Router();
const {v4: uuid} = require('uuid');

const upload = multer();
router.post('/upload', upload.single('shape'), async (req, res) => {
	try {
		const shapeId = uuid();

		// сохраняем файл на сервере
		fs.mkdir(`./shapes/${shapeId}`, (folderErr) => {
			if (folderErr) {
				return res.status(500).json({message: 'Ошибка сервера: не удалось создать папку для объекта'});
			}

			fs.writeFile(`./shapes/${shapeId}/${req.file.originalname}`, req.file.buffer, (err) => {
				if (err) {
					return res.status(500).json({message: 'Ошибка сервера: не удалось сохранить объект'});
				}
				
				// отправляем ссылку для загрузки объекта
				res.status(201).json({
					message: 'Объект сохранен',
					link: `${shapeId}&&${req.file.originalname}`
				});
			});
		})

		// const shape = new Shape({name, uri: '/shapes/shape1'});

		// await shape.save();
		

	} catch (error) {
		res.status(500).json({message: 'Ошибка сервера: не удалось загрузить объект'});
	}
});

router.get('/load/:shapePath', (req, res) => {
	const shapePath = req.params.shapePath.replace('&&', '/');
	res.sendFile(path.join(__dirname, '..', 'shapes', shapePath));
});

module.exports = router;
