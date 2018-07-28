// 雾化，即使用雾的颜色与场景中物体的颜色进行叠加。
//
// 线性雾化，会指定一个起点和终点，起点为开始雾化点，终点为完全雾化的点：
//
// 在起点之前的完全清晰，也就是说完全为场景中的物体颜色；
// 在起点和终点之间的点，根据距离计算雾的因子；
// 在终点之后就完成为雾的颜色。
// 物体颜色和雾的颜色叠加公私如下：
//
// 片元颜色 = 物体颜色 * 雾化因子 + 雾的颜色 * （1 - 雾化因子）
// 雾化因子 = (终点 - 当前点与视点的距离) / (终点 - 起点)
// 雾化因子与雾的浓度相反，即第一种情况雾化因子为1，第三种情况雾化因子为0。

function main() {
	var gl = getGL();
	var vsFile = "./res/shader/vert.glsl";
	var fsFile = "./res/shader/frag.glsl";
	initShader(gl, vsFile, fsFile, function (shaderProgram) {
		var n = initVertexBuffers(gl, shaderProgram);

		var fogColor = new Float32Array([0.6, 0.6, 0.6]);
		gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0);
		gl.enable(gl.DEPTH_TEST);

		//model
		var u_ModelMatrix = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
		var scale = getScaleMatrix(10, 10, 10);
		gl.uniformMatrix4fv(u_ModelMatrix, false, scale);

		// mvp
		var eye = new Float32Array([25, 65, 35, 1.0]);
		var viewMat = lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
		var projMat = getPerspectiveProjection(30, 16 / 9, 1, 1000);
		var vpMat = multiMatrix44(projMat, viewMat);
		var mvpMat = multiMatrix44(vpMat, scale);
		var u_MvpMatrix = gl.getUniformLocation(shaderProgram, 'u_MvpMatrix');
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

		// eye
		var u_Eye = gl.getUniformLocation(shaderProgram, 'u_Eye');
		gl.uniform4fv(u_Eye, eye);

		// fog clolr
		var u_FogColor = gl.getUniformLocation(shaderProgram, 'u_FogColor');
		gl.uniform3fv(u_FogColor, fogColor);

		// fog range
		var fogRange = new Float32Array([55, 80]);
		var u_FogRange = gl.getUniformLocation(shaderProgram, 'u_FogRange');
		gl.uniform2fv(u_FogRange, fogRange);

		draw(gl, n);
	});
}

function draw(gl, n) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl, shaderProgram) {
	var vertices = new Float32Array([
		1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
		1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,
		1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1,
		-1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1,
		-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
		1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1
	]);

	var colors = new Float32Array([
		0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,
		0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,
		1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,
		1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0
	]);

	var indices = new Uint8Array([
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);

	initArrayBuffer(gl, shaderProgram, vertices, 3, gl.FLOAT, 'a_Position');
	initArrayBuffer(gl, shaderProgram, colors, 3, gl.FLOAT, 'a_Color');

	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}