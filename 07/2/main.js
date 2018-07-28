// 颜色红色分量和蓝色分量，是根据位置计算

var vertexShaderSrc = `
attribute vec4 a_Position;
void main(){
    gl_Position = a_Position;
}`;

var fragmentShaderSrc = `
precision mediump float;// 必须声明浮点数精度，否则会出错
uniform float u_Width;
uniform float u_Height;
void main(){
    gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
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
	var verticesColors = new Float32Array([
		0.0, 0.5,
		-0.5, -0.5,
		0.5, -0.5,
	]);
	var FSIZE = verticesColors.BYTES_PER_ELEMENT;

	var vertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 2, 0);
	gl.enableVertexAttribArray(a_Position);

	var u_Width = gl.getUniformLocation(gl.program, "u_Width");
	gl.uniform1f(u_Width, gl.drawingBufferWidth);

	var u_Height = gl.getUniformLocation(gl.program, "u_Height");
	gl.uniform1f(u_Height, gl.drawingBufferHeight);

	return verticesColors.length/2;
}