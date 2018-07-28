// 在不同象限画不同颜色的点

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
attribute float a_PointSize;// 接收传入位置坐标，必须声明为全局，绘制单个点时才生效
void main(){
    gl_Position = a_Position;// gl_Position 内置变量，表示点的位置，必须赋值
    gl_PointSize = a_PointSize;// gl_PointSize 内置变量，表示点的大小（单位像素），可以不赋值，默认为1.0
}`;

// 片段着色器源码
var fragmentShaderSrc = `
precision mediump float;// 设置精度
uniform vec4 u_FragColor;// 接收传入的颜色参数
void main(){
    gl_FragColor = u_FragColor;// gl_FragColor 内置变量，表示片元颜色，必须赋值
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

	var a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");// 获取shader中的a_PointSize变量
	gl.vertexAttrib1f(a_PointSize, 10.0);// 给a_PointSize赋值

	var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");// 获取shader中的u_FragColor变量
	var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取shader中的a_Position变量
	canvas.onmousedown = function (event) {
		onClick(event, gl, canvas, a_Position, u_FragColor);
	};

	gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
	gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
}
g_points = [];
g_colors = [];
function onClick(event, gl, canvas, a_Position, u_FragColor) {
	// 记录鼠标点击过的位置
	var rect = event.target.getBoundingClientRect();
	var x = ((event.clientX - rect.left) - canvas.width * 0.5) / (canvas.width * 0.5);
	var y = (canvas.height * 0.5 - (event.clientY - rect.top)) / (canvas.height * 0.5);
	g_points.push([x, y]);

	// 记录颜色
	if(x >= 0 && y >= 0) {
		g_colors.push([1.0, 0.0, 0.0, 1.0]);// 第一象限
	} else if (x < 0 && y > 0) {
		g_colors.push([0.0, 1.0, 0.0, 1.0]);// 第二象限
	} else if (x < 0 && y < 0) {
		g_colors.push([0.0, 0.5, 1.0, 1.0]);// 第三象限
	} else {
		g_colors.push([1.0, 1.0, 0.0, 1.0]);// 第四象限
	}

	gl.clear(gl.COLOR_BUFFER_BIT);
	for (var i = 0; i < g_points.length; i++) {
		var pos = g_points[i];
		var rgba = g_colors[i];

		gl.vertexAttrib4f(a_Position, pos[0], pos[1], 0.0, 1.0);
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		gl.drawArrays(gl.POINTS, 0, 1);
	}
}