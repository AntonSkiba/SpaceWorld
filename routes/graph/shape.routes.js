const { Router } = require("express");
const fs = require("fs");
const multer = require('multer');
const router = Router();

const upload = multer();

// загружаем файл на сервер
router.post("/upload", upload.single('shape'), (req, res) => {
    console.log('Method: shape/upload');
    const shapeId = Date.now();
    const ext = req.file.originalname.split('.').pop();
    
    const link = `object_${shapeId}.${ext}`;
    fs.writeFile(`../SpaceWorldData/Vertices/files/${link}`, req.file.buffer, (err) => {
        if (err) return fileError(res, err);

        res.status(201).json({
            message: "Файл сохранен",
            link
        });
    });
});

// отправляем файл с сервера
router.get("/download/:file", (req, res) => {
    console.log('Method: shape/download');
    const name = req.params.file;

    if (name.includes('..')) {
        res.status(404).json({err: 'No'});
    } else {
        fs.readFile(`../SpaceWorldData/Vertices/files/${name}`, 'utf8', (err, file) => {
            if (err) res.status(404).json({err});
            else res.status(200).json({file});
        });
    }
    
});

function fileError(res, err) {
	console.error(err);
    return res.status(500).json({error: "Не удалось загрузить приложение, попробуйте позже"});
}

module.exports = router;