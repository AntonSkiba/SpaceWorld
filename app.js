const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const fs = require("fs");

const app = express();

app.use(express.static('public'));

app.use(express.json({limit: '300mb', extended: true }));
app.use(express.urlencoded({limit: '300mb', extended: true}));

app.use('/api/vertex', require('./routes/graph/vertex.routes'));
app.use('/api/shape', require('./routes/graph/shape.routes'));
app.use('/api/place', require('./routes/graph/place.routes'));
app.use('/api/graph', require('./routes/graph/graph.routes'));

app.use('/api/planet', require('./routes/planet.routes'));

const PORT = config.get('port') || 5000;

async function start() {
	try {
		await mongoose.connect(config.get('mongoUri'), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		});

		await createProjectDirectory();

		app.listen(PORT, () => console.log(`App has been started on port: ${PORT}...`));
	} catch (error) {
		console.log('Server Error', error.message);
		process.exit(1);
	}
}

start();

// Создаем рядом с проектом директорию с предустановленными папками и информационными файлами
async function createProjectDirectory() {
	await createDir('../SpaceWorldData');
	await createDir('../SpaceWorldData/Planets');
	await createDir('../SpaceWorldData/Vertices');
	await createDir('../SpaceWorldData/Vertices/files');
	await createDir('../SpaceWorldData/Vertices/configs');
	await createDir('../SpaceWorldData/Graphs');
}

function createDir(path) {
	return new Promise((resolve, reject) => {
		readDir(path).then(() => {
			resolve();
			console.log('Exist: ', path);
		}).catch(() => {
			fs.mkdir(path, (err) => {
				if (err) reject(err);
				console.log('Created: ', path);
				resolve();
			});
		});
		
	});
}

function readDir(path) {
	return new Promise((resolve, reject) => {
		fs.readdir(path, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}
