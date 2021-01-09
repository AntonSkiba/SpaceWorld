/**
 * helper загрузки файлов, проверяет файл, отправляет и получает скриншот объекта
 */

export function LoadShape(file) {
	if (validateFile(file.name)) {
		const formData = new FormData();
		formData.append("shape", file);

		

		// fetch('/api/upload/shape', {
		// 	method: 'POST',
		// 	body: formData
		// }).then(res => {
		// 	return res.blob();
		// }).then(screenshot => {
		// 	console.log(screenshot);
		// })
	}
}

function validateFile(name) {
	const ext = name.split('.').pop();
	if (ext === 'obj') {
		return true;
	}

	return false;
}