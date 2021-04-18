const { Router } = require("express");
const fs = require("fs");
const router = Router();

// сохраняем новую вершину графа
router.post('/save', (req, res) => {
    console.log('Method: vertex/save');
    const {name, screenshot, settings, path} = req.body;
    if (!name) {
        return res.status(400).json({ message: "Отсутствует имя" });
    }

    if (!screenshot) {
        return res.status(400).json({ message: "Отсутствует фоновое изображение" });
    }

    if (!settings) {
        return res.status(400).json({ message: "Отсутствуют настройки объекта" });
    }

    settings.name = name;

    if (!path) {
        let dirs = name.split('/');
        dirs = dirs.filter(dir => !!dir.length && dir !== '..');
        dirs.pop();
        dirs.push(`vertex_${Date.now()}`);
    
        makeDirs('../SpaceWorldData/Vertices/configs', dirs).then(genPath => {
            console.log(genPath);
            writeConfigs(res, genPath, settings, screenshot);
        });
    } else {
        writeConfigs(res, `../SpaceWorldData/Vertices/configs${path}`, settings, screenshot);
    }
});

function writeConfigs(res, path, settings, screenshot) {
    // Сохраняем настройки модели
    fs.writeFile(`${path}/settings.json`, JSON.stringify(settings, null, 2),"utf8",(err) => {
        if (err) return fileError(res, err);
        
        // Сохраняем фоновое изображение
        const image = screenshot.replace(/^data:image\/png;base64,/, "");
        fs.writeFile(`${path}/screenshot.png`, image, "base64", (err) => {
            if (err) return fileError(res, err);

            res.status(201).json({
                message: "Объект сохранен",
                path: path.replace('../SpaceWorldData/Vertices/configs', '')
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
