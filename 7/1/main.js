// varying类型变量： vs给fs传递数据
// 变量类型：
// attribute: 用在顶点着色器中接收顶点相关信息；
// uniform: 可以同时在顶点着色器和片元着色器中使用，接收无顶点无关的数据。
// varying 同时在顶点着色器和片元着色器中定义，用于在两者之间传递数据。

var vertexShaderSrc = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
void main(){
    gl_Position = a_Position;
    v_Color = a_Color;
}`;

var fragmentShaderSrc = `
precision mediump float;// float变量没有默认精度，所以使用前必须声明，否则会出错
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}`;

function main() {
	var canvas = document.getElementById("container");
	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	initShader(gl);
	var n = initVertexBuffers(gl);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initShader(gl) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSrc);
	gl.compileShader(fragmentShader);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);

	gl.program = shaderProgram;
}

function initVertexBuffers(gl) {
	// 顶点位置和颜色
	var verticesColors = new Float32Array([
		0.0, 0.5, 1.0, 0.0, 0.0,
		-0.5, -0.5, 0.0, 1.0, 0.0,
		0.5, -0.5, 0.0, 0.0, 1.0,
	]);
	var FSIZE = verticesColors.BYTES_PER_ELEMENT;

	var vertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
	gl.enableVertexAttribArray(a_Position);

	var a_Color = gl.getAttribLocation(gl.program, "a_Color");
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
	gl.enableVertexAttribArray(a_Color);

	return verticesColors.length/5;
}