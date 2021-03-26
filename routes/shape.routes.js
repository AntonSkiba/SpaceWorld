const { Router } = require("express");
const fs = require("fs");
const Shape = require("../models/Shape");
const multer = require('multer');
const router = Router();

const upload = multer();

router.post("/upload", (req, res) => {
    console.log('Method: /upload');
    const { name, screenshot, settings, path } = req.body;
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

    // если нету пути, значит пришел новый объект, иначе просто запишем обновляемый конфиг
    if (!path) {
        let dirs = name.split('/');
        dirs = dirs.filter(dir => !!dir.length && dir !== '..');
        dirs.pop();
        dirs.push(`shape_${Date.now()}`);
    
        makeDirs('../SpaceWorldData/Shapes/configs', dirs).then(genPath => {
            console.log(genPath);
            writeConfigs(res, genPath, settings, screenshot);
        });
    } else {
        writeConfigs(res, `../SpaceWorldData/Shapes/configs${path}`, settings, screenshot);
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
                path: path.replace('../SpaceWorldData/Shapes/configs', '')
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

router.post("/saveFile", upload.single('shape'), (req, res) => {
    console.log('Method: /saveFile');
    const shapeId = Date.now();
    const ext = req.file.originalname.split('.').pop();
    
    const link = `object_${shapeId}.${ext}`;
    fs.writeFile(`../SpaceWorldData/Shapes/files/${link}`, req.file.buffer, (err) => {
        if (err) return fileError(res, err);

        res.status(201).json({
            message: "Файл сохранен",
            link
        });
    });
});

function fileError(res, err) {
	console.error(err);
    return res.status(500).json({error: "Не удалось загрузить приложение, попробуйте позже"});
}

module.exports = router;
