// 绘制其他图像
// gl.drawArrays 参数说明：
// POINTS：绘制一个个点单；
// LINES：在V0-V1，V2-V3，…之间划线，奇数个点最后一个会被忽略；
// LINE_STRIP: 依次收尾链接v0-v1-v2-v3…；
// LINE_LOOP：在所有点之间两两连线；
// TRIANGLES: 绘制三角形v0-v1-v2， v3-v4-v5，…；
// TRIANGLE_STRIP：任意连续三个点之间绘制三角形；
// TRIANGLE_FAN：复用上一个三角形的一边与下一个点，绘制一个三角形。

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
void main(){
    gl_Position = a_Position;// gl_Position 内置变量，表示点的位置，必须赋值
}`;

// 片段着色器源码
var fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);// gl_FragColor 内置变量，表示片元颜色，必须赋值
}`;

// 初始化使用的shader
function initShader(gl) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
	gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
	gl.compileShader(vertexShader);// 编译定点着色器

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
	gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
	gl.compileShader(fragmentShader);// 编译片段着色器

	var shaderProgram = gl.createProgram();// 创建着色器程序
	gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
	gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
	gl.linkProgram(shaderProgram);// 链接程序
	gl.useProgram(shaderProgram);//使用着色器

	gl.program = shaderProgram;
}

function main() {
	var canvas = document.getElementById("container");
	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	initShader(gl);// 初始化着色器
	var n = initVertexBuffers(gl);// 初始化顶点

	gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
	gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas

	// 取消注释查看不同的图像
	// gl.drawArrays(gl.POINTS, 0, 4);
	// gl.drawArrays(gl.LINES, 0, 4);
	// gl.drawArrays(gl.LINE_STRIP, 0, 4);
	// gl.drawArrays(gl.LINE_LOOP, 0, 4);
	// gl.drawArrays(gl.TRIANGLES, 0, 4);
	// gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function initVertexBuffers(gl) {
	var vertices = new Float32Array([
		-0.5, 0.5,
		-0.5, -0.5,
		0.5, 0.5,
		0.5, -0.5
	]);

	var vertexBuffer = gl.createBuffer();// 创建缓冲区对象
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// 将缓冲区对象绑定到目标
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);// 向缓冲区中写入数据

	var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取a_Position变量
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);// 将缓冲区对象分配给a_Position
	gl.enableVertexAttribArray(a_Position);// 链接a_Position与分配给他的缓冲区对象

	return vertices.length / 2;
}