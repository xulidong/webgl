// 组合变换

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
uniform mat4 u_Mat;// 旋转矩阵
void main(){
    gl_Position = u_Mat * a_Position;
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

	// 平移矩阵，列主序
	var tran = getTranslationMatrix(0.5, 0.5, 0.0);

	// 旋转矩阵，列主序
	var rot = getRotationMatrix(Math.PI * 0.5, 0.0, 0.0, 1.0);

	// 缩放矩阵，列主序
	var scale = getScaleMatrix(0.5, 0.5, 1.0);

	var mat = multiMatrix44(scale, tran);
	mat = multiMatrix44(mat, rot);
	var u_Mat = gl.getUniformLocation(gl.program, 'u_Mat');
	gl.uniformMatrix4fv(u_Mat, false, mat);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
	gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
	var vertices = new Float32Array([
		0, 0.5,
		-0.5, -0.5,
		0.5, -0.5,
	]);

	var vertexBuffer = gl.createBuffer();// 创建缓冲区对象
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// 将缓冲区对象绑定到目标
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);// 向缓冲区中写入数据

	var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取a_Position变量
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);// 将缓冲区对象分配给a_Position
	gl.enableVertexAttribArray(a_Position);// 链接a_Position与分配给他的缓冲区对象

	return vertices.length / 2;
}

/**
 * 由平移向量获取平移矩阵
 * */
function getTranslationMatrix(x, y, z) {
	return new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		x, y, z, 1.0,
	]);
}

/**
 * 由旋转弧度和旋转轴获取旋转矩阵
 * */
function getRotationMatrix(rad, x, y, z) {
	if (x > 0) {
		// 绕x轴的旋转矩阵
		return new Float32Array([
			1.0, 0.0, 0.0, 0.0,
			0.0, Math.cos(rad), -Math.sin(rad), 0.0,
			0.0, Math.sin(rad), Math.cos(rad), 0.0,
			0.0, 0.0, 0.0, 1.0,
		]);
	} else if (y > 0) {
		// 绕y轴的旋转矩阵
		return new Float32Array([
			Math.cos(rad), 0.0, -Math.sin(rad), 0.0,
			0.0, 1.0, 0.0, 0.0,
			Math.sin(rad), 0.0, Math.cos(rad), 0.0,
			0.0, 0.0, 0.0, 1.0,
		]);
	} else if(z > 0) {
		// 绕z轴的旋转矩阵
		return new Float32Array([
			Math.cos(rad), Math.sin(rad), 0.0, 0.0,
			-Math.sin(rad), Math.cos(rad), 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
		]);
	} else {
		// 没有指定旋转轴，报个错，返回一个单位矩阵
		console.error("error: no axis");
		return new Float32Array([
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
		]);
	}
}

/**
 * 由缩放因子获取缩放矩阵
 * */
function getScaleMatrix(xScale, yScale, zScale) {
	return new Float32Array([
		xScale, 0.0, 0.0, 0.0,
		0.0, yScale, 0.0, 0.0,
		0.0, 0.0, zScale, 0.0,
		0.0, 0.0, 0.0, 1.0,
	]);
}

/**
 * 1 x 1 向量点乘
 * */
function dotMultiVector(v1, v2) {
	var res = 0;
	for (var i = 0; i < v1.length; i++) {
		res += v1[i] * v2[i];
	}
	return res;
}

/**
 * 4 x 4 矩阵的转置
 * */
function transposeMatrix(mat) {
	var res = new Float32Array(16);
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			res[i * 4 + j] = mat[j * 4 + i];
		}
	}
	return res;
}

/**
 * 4 x 4 矩阵乘法
 * */
function multiMatrix44(m1, m2) {
	var mat1 = transposeMatrix(m1);
	var mat2 = transposeMatrix(m2);

	var res = new Float32Array(16);
	for (var i = 0; i < 4; i++) {
		var row = [mat1[i * 4], mat1[i * 4 + 1], mat1[i * 4 + 2], mat1[i * 4 + 3]];
		for (var j = 0; j < 4; j++) {
			var col = [mat2[j], mat2[j + 4], mat2[j + 8], mat2[j + 12]];
			res[i * 4 + j] = dotMultiVector(row, col);
		}
	}
	return transposeMatrix(res);
}