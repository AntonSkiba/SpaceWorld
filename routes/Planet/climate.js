const biomes = require("./biomes/biomes");

const climate = (graph = {tree: {children: []}}, size) => {
	let type = 'user';
	// для начала собираем пользовательские зоны
	let points = userClimate(graph.tree);
	// если их нет, то строим по референсным зонам
	if (!points.length) {
		type = 'reference';
		points = referenceClimate();
	}

	// получаем диаграмму Вороного размера size x size
	const map = voronoiDiagram(points, size);

	for(let x = 0; x < size; x++) {
		for (let y = 0; y < size; y++) {
			const key = map[x][y];
			map[x][y] = biomes.info[key];
			map[x][y].key = key;
		}
	}

	return {
		map,
		type,
		biomes: points.map(point => point.key)
	}
}

function referenceClimate() {
	let points = [];

	for (let key in biomes.info) {
		const biome = biomes.info[key];
		points.push({
			x: biome.center.x,
			y: biome.center.y,
			key
		});
	}

	return points;
}

// расставляем координаты биомов по графу, для построения диаграммы Вороного
function userClimate(node, parent, points = [], ) {
	// если у узла есть зона-родитель и он сам является зоной,
	// то мы рисуем его относительно родителя и дефолтных характеристик температуры и влажности,
	// иначе если узел просто является зоной мы просто берем его координаты из дефолтных характеристик
	if (parent && parent.params.zone && node.params.zone) {
		// биом узла
		const nodeKey = node.params.zone;
		const nodePoint = biomes.info[nodeKey].center;
		// биом родителя
		const parentKey = parent.params.zone;
		const parentPoint = biomes.info[parentKey].center;

		// определяем направление от родительского биома до биома узла
		const vector = {x: nodePoint.x - parentPoint.x, y: nodePoint.y - parentPoint.y};
		//vector.normalize();

		const x = parentPoint.x + vector.x / (node.params.level + 1);
		const y = parentPoint.y + vector.y / (node.params.level + 1);

		console.log(vector);

		points.push({
			x: Math.floor(x),
			y: Math.floor(y),
			key: nodeKey
		});
	} else if (node.params.zone) {
		const key = node.params.zone;
		const biome = biomes.info[key];

		points.push({
			x: biome.center.x,
			y: biome.center.y,
			key
		});
	}

	node.children.forEach(next => {
		userClimate(next, node, points);
	});

	return points;
}

function voronoiDiagram(points, size) {
	// для начала нормализуем все точки
	const x = {max: size, min: 0};
	const y = {max: size, min: 0};

	// находим крайние значения выходящие за рамки
	points.forEach(point => {
		if (point.x > x.max) x.max = point.x;
		if (point.x < x.min) x.min = point.x;
		if (point.y > y.max) y.max = point.y;
		if (point.y < y.min) y.min = point.y;
	});

	// после получения новых крайних значений мы нормализуем точки относительно их
	points.forEach(point => {
		point.x = Math.floor(point.x * size / (x.max - x.min));
		point.y = Math.floor(point.y * size / (y.max - y.min));
	});

	const map = [];
	for (let x = 0; x < size; x++) {
		map[x] = [];
		for (let y = 0; y < size; y++) {
			let dist = size*2;
			let key;

			points.forEach(point => {
				let pointDist = voronoiMetrics(point.x - x, point.y - y, 3);
				if (pointDist < dist) {
					dist = pointDist;
					key = point.key;
				}
			});

			map[x][y] = key;
		}
	}

	return map;
}

// 1 - Евклидова метрика
// 2 - Манхэттенское расстояние
// 3 - Норма Минковского
function voronoiMetrics(x, y, type = 1) {
    if (type === 1) return Math.sqrt(x*x + y*y);
    if (type === 2) return Math.abs(x) + Math.abs(y);
    if (type === 3) return Math.pow(Math.pow(Math.abs(x), 3) + Math.pow(Math.abs(y), 3), 0.33333);
}

module.exports = climate;