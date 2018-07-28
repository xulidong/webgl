// 绘制带纹理的立方体

function main() {
	var gl = getGL();
	var vsFile = "./res/shader/vert.glsl";
	var fsFile = "./res/shader/frag.glsl";
	initShader(gl, vsFile, fsFile, function (shaderProgram) {
		var n = initVertexBuffers(gl, shaderProgram);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		initTextures(gl, shaderProgram, n);
	});
}

function initTextures(gl, shaderProgram, n) {
	var texture = gl.createTexture();
	var u_Sampler = gl.getUniformLocation(shaderProgram, 'u_Sampler');
	var image = new Image();
	image.onload = function () {
		onLoadTexture(gl, shaderProgram, n, texture, u_Sampler, image);
	};
	image.src = "res/image/bg.jpg";
	return true;
}

function onLoadTexture(gl, shaderProgram, n, texture, u_Sampler, image) {
	var u_MvpMatrix = gl.getUniformLocation(shaderProgram, 'u_MvpMatrix');
	var viewMat = lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);
	var mvpMat = multiMatrix44(projMat, viewMat);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.bindTexture(gl.TEXTURE_2D, texture);// 绑定纹理对象到激活的纹理单元
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);// 纹理放大方式
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);// 纹理缩小方式
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);// 纹理水平填充方式
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);// 纹理垂直填充方式
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	gl.uniform1i(u_Sampler, 0);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl, shaderProgram) {
	var vertices = new Float32Array([
		1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
		-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
		1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
	]);

	var texCoords = new Float32Array([
		1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
		0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
		1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
		1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
	]);

	var indices = new Uint8Array([
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);

	var indexBuffer = gl.createBuffer();
	initArrayBuffer(gl, shaderProgram, vertices, 3, gl.FLOAT, 'a_Position');
	initArrayBuffer(gl, shaderProgram, texCoords, 2, gl.FLOAT, 'a_TexCoord');
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	return indices.length;
}
