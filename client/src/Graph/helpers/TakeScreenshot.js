/**
 * helper создает скриншот объекта, по хорошему нужно делать на Сервере
 */
import * as THREE from 'three';

export function TakeScreenshot(shape) {
	const width = 500;
	const height = 500;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffff);
	
	const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 10000);
	camera.position.z = 500;
	camera.position.x = 300;
	camera.position.y = 500;

	const renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true
	});

	renderer.setSize(width, height);
	
}