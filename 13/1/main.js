// 先绘制没有光照的立方体

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
	if (!gl.getProgramParameter(sp, gl.LINK_STATUS)) {
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
	// 立方体的六个面及每个面的两个三角形
	var vertices = new Float32Array([
		1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
		-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
		1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
	]);
	var FSIZE = vertices.BYTES_PER_ELEMENT;

	// 每个顶点的颜色
	var colors = new Float32Array([
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
	]);

	// 立方体的六个面，每个面有两个三角形组成
	var indices = new Uint8Array([
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(sp, "a_Position");
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	var cbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

	var a_Color = gl.getAttribLocation(sp, "a_Color");
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
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