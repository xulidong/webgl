// 从文件中加载shader

var g_LastTime = null;// 上次绘制的时间

function main() {
	var gl = getGL();
	var vsFile = "res/shader/vert.glsl";
	var fsFile = "res/shader/frag.glsl";
	initShader(gl, vsFile, fsFile, function (sp) {
		var n = initVertexBuffers(gl, sp);

		// 设置入射光
		var u_LightColor = gl.getUniformLocation(sp, "u_LightColor");
		gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
		var u_LightPosition = gl.getUniformLocation(sp, "u_LightPosition");
		gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

		// 设置环境光
		var u_LightColorAmbient = gl.getUniformLocation(sp, "u_LightColorAmbient");
		gl.uniform3f(u_LightColorAmbient, 0.2, 0.2, 0.2);

		// mvp矩阵
		var u_ModelMatrix = gl.getUniformLocation(sp, "u_ModelMatrix");
		var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");

		// 逆转置矩阵
		var u_NormalMatrix = gl.getUniformLocation(sp, "u_NormalMatrix");


		var viewMat = lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
		var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		var speed = Math.PI/4;// 角速度
		var rad = 0.0;// 启始角度
		var tick = function (timestamp) {
			var delta = g_LastTime ? (timestamp - g_LastTime) / 1000 : 0;// 上次绘制到本次绘制过去的时间(单位转换算成秒)
			g_LastTime = timestamp;// 保存本次时间
			rad = (rad + speed * delta) % (2 * Math.PI);// 当前的弧度
			draw(gl, n, rad, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix, viewMat, projMat);
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	});
}

function initShader(gl, vsFile, fsFile, cb) {
	var vs = null;
	var fs = null;

	var onShaderLoaded = function () {
		if(vs && fs) {
			var sp = createProgram(gl, vs, fs);
			gl.useProgram(sp);
			cb(sp);
		}
	};

	loadShaderFromFile(vsFile, function (vsContent) {
		vs = vsContent;
		onShaderLoaded();
	});

	loadShaderFromFile(fsFile, function (fsContent) {
		fs = fsContent;
		onShaderLoaded();
	});
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

function draw(gl, n, rad, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix, viewMat, projMat) {
	// 模型矩阵
	var modelMat = getRotationMatrix(rad, 0, 1, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat);

	// 逆转置矩阵
	var inverseMat = inverseMatrix(modelMat);
	var inverseTranposeMat = transposeMatrix(inverseMat);
	gl.uniformMatrix4fv(u_NormalMatrix, false, inverseTranposeMat);

	// mvp矩阵
	var vpMat = multiMatrix44(projMat, viewMat);
	var mvpMat = multiMatrix44(vpMat, modelMat);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, 0);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}