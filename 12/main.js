// 绘制立方体
// ibo(index buffer objec)：使用下标复用顶点数据

var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_MvpMatrix;
varying vec4 v_Color;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
}
`;

var gl_SrcFS = `
precision lowp float;
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}
`;

function main() {
	var gl = getGL();
	var sp = initShader(gl, gl_SrcVS, gl_SrcFS);

	var projMat = getPerspectiveProjection(30, 1, 1, 100);
	var viewMat = lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
	var mvpMat = multiMatrix44(projMat, viewMat);

	var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

	var n = initVertexBuffers(gl, sp);
	draw(gl, n)
}

function getGL() {
	var cavans = document.getElementById("container");
	return cavans.getContext("webgl") || cavans.getContext("experimental-webgl");
}

function initShader(gl, srcVS, srcFS) {
	var sp = createProgram(gl, srcVS, srcFS);
	gl.useProgram(sp);
	return sp;
}

function createProgram(gl, srcVS, srcFS) {
	var vs = loadShader(gl, gl.VERTEX_SHADER, srcVS);
	var fs = loadShader(gl, gl.FRAGMENT_SHADER, srcFS);

	var sp = gl.createProgram();
	gl.attachShader(sp, vs);
	gl.attachShader(sp, fs);

	// 1 对应vs和fs的vary变量 2 vs中varying变量必须赋值 3 共享vs和fs中相同的uniform变量 4 各种类型变量的数量检查
	gl.linkProgram(sp);
	if(!gl.getProgramParameter(sp, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(sp));
		return;
	}
	return sp;
}

function loadShader(gl, type, shaderSrc) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, shaderSrc);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		return;
	}
	return shader;
}

function initVertexBuffers(gl, sp) {
	// 立方体的六个面及其颜色
	var verticesColors = new Float32Array([
		1.0,  1.0,  1.0,     1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,     1.0,  0.0,  1.0,
		-1.0, -1.0,  1.0,     1.0,  0.0,  0.0,
		1.0, -1.0,  1.0,     1.0,  1.0,  0.0,
		1.0, -1.0, -1.0,     0.0,  1.0,  0.0,
		1.0,  1.0, -1.0,     0.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,     0.0,  0.0,  1.0,
		-1.0, -1.0, -1.0,     0.0,  0.0,  0.0
	]);

	// 立方体的六个面，每个面有两个三角形组成
	var indices = new Uint8Array([
		0, 1, 2,   0, 2, 3,
		0, 3, 4,   0, 4, 5,
		0, 5, 6,   0, 6, 1,
		1, 6, 7,   1, 7, 2,
		7, 4, 3,   7, 3, 2,
		4, 7, 6,   4, 6, 5
	]);
	var FSIZE = verticesColors.BYTES_PER_ELEMENT;

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(sp, "a_Position");
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);

	var a_Color = gl.getAttribLocation(sp, "a_Color");
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);

	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}

function draw(gl, n) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, 0);

	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}