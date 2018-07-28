// 正射投影矩阵：长方体的可视空间 物体大小不随位置变化
// 可以通过wasd修改远近界面

var g_vs = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ProjMat;
varying vec4 v_Color;
void main() {
    gl_Position = u_ProjMat * a_Position;
    v_Color = a_Color;
}`;

var g_fs = `
precision mediump float;
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}`;

var g_near = 0.0;
var g_far = 0.5;
var g_nf;

function main() {
	g_nf = document.getElementById("nearFar");

	var gl = getGL();
	var shaderProgram = initShader(gl);
	var n = initVertexBuffers(gl, shaderProgram);
	draw(gl, shaderProgram, n);

	document.onkeydown = function (event) {
		if(event.key === 'a') {
			g_near += 0.01;
			draw(gl, shaderProgram, n);
		} else if(event.key === 'd') {
			g_near -= 0.01;
			draw(gl, shaderProgram, n);
		} else if(event.key === 'w') {
			g_far += 0.01;
			draw(gl, shaderProgram, n);
		} else if(event.key === 's') {
			g_far -= 0.01;
			draw(gl, shaderProgram, n);
		} else {

		}
	}
}

function getGL() {
	var canvas = document.getElementById("container");
	return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
}

function initShader(gl) {
	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource( vs, g_vs);
	gl.compileShader(vs);

	var fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource( fs, g_fs);
	gl.compileShader(fs);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vs);
	gl.attachShader(shaderProgram, fs);
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);

	return shaderProgram;
}

function initVertexBuffers(gl, shaderProgram) {
	var verticesColors = new Float32Array([
		// 顶点坐标         颜色
		0.0, 0.6,-0.4,      0.4, 1.0, 0.4,
		-0.5, -0.4, -0.4,   0.4, 1.0, 0.4,
		0.5, -0.4, -0.4,    1.0, 0.4, 0.4,

		0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
		-0.5, 0.4, -0.2,    1.0, 1.0, 0.4,
		0.0, -0.6, -0.2,    1.0, 1.0, 0.4,

		0.0, 0.5, 0.0,      0.4, 0.4, 1.0,
		-0.5, -0.5, 0.0,    0.4, 0.4, 1.0,
		0.5, -0.5, 0.0,     1.0, 0.4, 0.4,
	]);
	var FSIZE = verticesColors.BYTES_PER_ELEMENT;

	var vertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);

	var a_Color = gl.getAttribLocation(shaderProgram, "a_Color");
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);

	return verticesColors.length / 6;
}

function draw(gl, shaderProgram, n) {
	g_nf.innerHTML = "near:" + g_near + ",far:" + g_far;

	// 正射投影矩阵
	var u_ProjMat = gl.getUniformLocation(shaderProgram, "u_ProjMat");
	var viewMat = getOrthoProjection(-1, 1, -1, 1, g_near, g_far);
	gl.uniformMatrix4fv(u_ProjMat, false, viewMat);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function getOrthoProjection(left, right, bottom, top, near, far) {
	var rw = 1 / (right - left);
	var rh = 1 / (top - bottom);
	var rd = 1 / (far - near);

	return new Float32Array([
		2 * rw, 0, 0, 0,
		0, 2 * rw, 0, 0,
		0, 0, -2 * rd, 0.0,
		-(right + left) * rw, -(top + bottom) * rh, -(far + near) * rd, 1
	]);
}