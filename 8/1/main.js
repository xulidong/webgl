// 纹理映射

var vertexShaderSrc = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main(){
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
}`;

var fragmentShaderSrc = `
precision mediump float;// 必须声明浮点数精度，否则会出错
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main(){
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}`;

function main() {
	var canvas = document.getElementById("container");
	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	initShader(gl);
	var n = initVertexBuffers(gl);
	initTextures(gl, n);
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
	var verticesTexCoords = new Float32Array([
		// 顶点坐标 对应的纹理坐标
		-1.0, 1.0,  0.0, 1.0,
		-1.0, -1.0, 0.0, 0.0,
		1.0, 1.0,   1.0, 1.0,
		1.0, -1.0, 1.0, 0.0
	]);
	var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

	var vertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
	gl.enableVertexAttribArray(a_Position);

	var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
	gl.enableVertexAttribArray(a_TexCoord);

	return verticesTexCoords.length/4;
}

function initTextures (gl, n) {
	var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");

	var image = new Image();
	image.onload = function () {
		loadTexture(gl, n, u_Sampler, image);
	};
	image.src = "./bg.jpg";
}

function loadTexture(gl, n, u_Sampler, image) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);// 图像坐标与纹理坐标Y轴方向相反，需进行Y轴反转

	var texture = gl.createTexture();// 创建纹理
	gl.activeTexture(gl.TEXTURE0);// 激活0号纹理单元（0号是默认激活的纹理单元）
	gl.bindTexture(gl.TEXTURE_2D, texture);// 绑定纹理对象到激活的纹理单元

	// 配置纹理参数
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);// 纹理放大方式
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);// 纹理缩小方式
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);// 纹理水平填充方式
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);// 纹理垂直填充方式

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);// 配置纹理图像

	gl.uniform1i(u_Sampler, 0);// 将0号纹理传递给着色器
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}