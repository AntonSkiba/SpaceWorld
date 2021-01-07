const {Router} = require('express');
const Shape = require('../models/Shape');
const {check, validationResult} = require('express-validator');
const router = Router();

router.post(
	'/shape', 
	[
		check('name', 'Некорректное имя').exists()
	], 
	async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
				message: 'Неккоректные данные при загрузке объекта'
			});
		}

		const {name, data} = req.body;

		const shape = new Shape({name, uri: '/shapes/shape1'});

		await shape.save();
		res.status(201).json({message: 'Объект сохранен'});

	} catch (error) {
		res.status(500).json({message: 'Ошибка сервера: не удалось загрузить объект'});
	}
});

module.exports = router;
