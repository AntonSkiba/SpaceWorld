const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const fs = require("fs");

const app = express();

app.use(express.static('public'));

app.use(express.json({limit: '300mb', extended: true }));
app.use(express.urlencoded({limit: '300mb', extended: true}));

app.use('/api/shape', require('./routes/shape.routes'));
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
function createProjectDirectory() {
	const exists = '\x1b[32mExists\x1b[37m';
	const notExists = '\x1b[34mNot exists\x1b[37m'
	return new Promise((resolve, reject) => {
		fs.readdir('../SpaceWorldData', (err) => {
			if (err) {
				console.log(`\n../SpaceWorldData: ${notExists}\n`);
				console.log('Creating data directory:');
				
				fs.mkdir('../SpaceWorldData', (err) => {
					if (err) reject(err);

					console.log('SpaceWorldData');
					fs.mkdir('../SpaceWorldData/Planets', (err) => {
						if (err) reject(err);

						console.log('-> Planets');
						fs.mkdir('../SpaceWorldData/Shapes', (err) => {
							if (err) reject(err);

							console.log('-> Shapes');
							fs.mkdir('../SpaceWorldData/Shapes/files', (err) => {
								if (err) reject(err);
								
								console.log('--> files');

								fs.mkdir('../SpaceWorldData/Shapes/configs', (err) => {
									if (err) reject(err);
									
									console.log('--> configs');
									console.log('\x1b[35mSpaceWorld\x1b[37m\n');
									resolve();
								});
							});
						});
					});
				})
			} else {
				console.log(`../SpaceWorldData: ${exists}`);
				fs.readdir('../SpaceWorldData/Planets', (err) => {
					if (err) reject(err);
					console.log(`../SpaceWorldData/Planets: ${exists}`);
					fs.readdir('../SpaceWorldData/Shapes', (err) => {
						if (err) reject(err);
						console.log(`../SpaceWorldData/Shapes: ${exists}`);
						fs.readdir('../SpaceWorldData/Shapes/files', (err) => {
							if (err) reject(err);
							console.log(`../SpaceWorldData/Shapes/files: ${exists}`);
							fs.readdir('../SpaceWorldData/Shapes/configs', (err) => {
								if (err) reject(err);
								console.log(`../SpaceWorldData/Shapes/configs: ${exists}`);
								resolve();
							});
						});
					});
				});
			}
		})
	});
	
}
