const { Router } = require("express");
const fs = require("fs");
const router = Router();

// сохраняем новую вершину графа
router.post('/save', (req, res) => {
    console.log('Method: vertex/save');
    const config = req.body;
    const name = config.name;
    const screenshot = config.screenshot;

    config.screenshot = null;

    if (!config.path) {
        let dirs = name.split('/');
        dirs = dirs.filter(dir => !!dir.length && dir !== '..');
        dirs.pop();
        dirs.push(`vertex_${Date.now()}`);
    
        makeDirs('../SpaceWorldData/Vertices/configs', dirs).then(genPath => {
            genPath;
            writeConfigs(res, genPath, config, screenshot);
        });
    } else {
        writeConfigs(res, `../SpaceWorldData/Vertices/configs${config.path}`, config, screenshot);
    }
});

function writeConfigs(res, path, config, screenshot) {
    // Сохраняем настройки модели
    config.path = path.replace('../SpaceWorldData/Vertices/configs', '');
    fs.writeFile(`${path}/settings.json`, JSON.stringify(config, null, 2),"utf8",(err) => {
        if (err) return fileError(res, err);
        
        // Сохраняем фоновое изображение
        const image = screenshot.replace(/^data:image\/png;base64,/, "");
        fs.writeFile(`${path}/screenshot.png`, image, "base64", (err) => {
            if (err) return fileError(res, err);

            res.status(201).json({
                message: "Объект сохранен",
                path: config.path
            });
        });
    });
}

function makeDirs(tempPath, dirs) {
    return new Promise((resolve, reject) => {
        fs.readdir(tempPath, readErr => {
            const recursiveCall = () => {
                if (dirs.length) {
                    const tempDir = dirs.shift();
                    resolve(makeDirs(`${tempPath}/${tempDir}`, dirs));
                }
                resolve(tempPath);
            }
    
            if (readErr) {
                fs.mkdir(tempPath, makeErr => {
                    if (makeErr) {
                        reject(fileError(res, makeErr));
                    } else {
                        recursiveCall();
                    }
                });
            } else {
                recursiveCall();
            }
        });
    }) 
}


function fileError(res, err) {
	console.error(err);
    return res.status(500).json({error: "Не удалось загрузить приложение, попробуйте позже"});
}

module.exports = router;
