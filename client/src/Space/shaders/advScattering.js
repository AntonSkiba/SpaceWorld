export const scattering_shader = (function() {

	const vertexShader = `
	#define saturate(a) clamp( a, 0.0, 1.0 )
  
	out vec2 vUv;
  
	void main() {
	  vUv = uv;
	  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
	`;
	
  
	const fragmentShader = `
		const float planetRadius = 1;

		float height01 = vUv
	`;
  
	return {
	  vertexShader,
	  fragmentShader
	};
})();