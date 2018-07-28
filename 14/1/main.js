// 点光源

var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;// 顶点法向量
uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;// 入射光颜色
uniform vec3 u_LightPosition;// 点光源位置
uniform vec3 u_LightColorAmbient;// 环境光颜色
varying vec4 v_Color;
varying vec3 v_Position;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(a_Normal));// 归一化法向量
    vec3 dir = normalize(u_LightPosition - vec3(a_Position));// 计算入射光线反方向并归一化
    float cos = max(dot(dir, normal), 0.0);// 计算入射角余弦值
    vec3 diffuse = u_LightColor * vec3(a_Color) * cos;// 计算平行光漫反射颜色
    vec3 ambient = u_LightColorAmbient * a_Color.rgb;// 计算环境光反射颜色
    v_Color = vec4(diffuse + ambient, a_Color.a);// 叠加作为最终的颜色
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

	// 设置mvp
	var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);
	var viewMat = lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
	var mvpMat = multiMatrix44(projMat, viewMat);
	var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

	// 设置入射光
	var u_LightColor = gl.getUniformLocation(sp, "u_LightColor");
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
	var u_LightPosition = gl.getUniformLocation(sp, "u_LightPosition");
	gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

	// 设置环境光
	var u_LightColorAmbient = gl.getUniformLocation(sp, "u_LightColorAmbient");
	gl.uniform3f(u_LightColorAmbient, 0.2, 0.2, 0.2);

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
	var vertices = new Float32Array([
		2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0,
		2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0,
		2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, 2.0,
		-2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0,
		-2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0,
		2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0
	]);

	var colors = new Float32Array([
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
	]);

	var normals = new Float32Array([
		0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
		-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
		0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
		0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
	]);

	var indices = new Uint8Array([
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);

	initArrayBuffer(gl, sp, vertices, 3, gl.FLOAT, "a_Position");
	initArrayBuffer(gl, sp, normals, 3, gl.FLOAT, "a_Normal");
	initArrayBuffer(gl, sp, colors, 3, gl.FLOAT, "a_Color");

	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}

function initArrayBuffer(gl, sp, data, num, type, attribute) {
	var buff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buff);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	var attr = gl.getAttribLocation(sp, attribute);
	gl.vertexAttribPointer(attr, num, type, false, 0, 0);
	gl.enableVertexAttribArray(attr);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function draw(gl, n) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, 0);

	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}