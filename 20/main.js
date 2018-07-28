// 帧缓冲区对象FBO：动态生成纹理，贴在另一个物体上

var SCREEN_WIDTH = 1280;
var SCREEN_HEIGHT = 720;
var OFFSCREEN_WIDTH = 512;
var OFFSCREEN_HEIGHT = 512;

function main() {
	var gl = getGL();
	var vsFile = "./res/shader/vert.glsl";
	var fsFile = "./res/shader/frag.glsl";
	initShader(gl, vsFile, fsFile, function (shaderProgram) {
		gl.program = shaderProgram;

		var cube = initVertexBuffersForCube(gl);
		var plane = initVertexBuffersForPlane(gl);
		initTextures(gl, function (texture) {
			var fbo = initFramebufferObject(gl);
			gl.enable(gl.DEPTH_TEST);

			var pPlane = getPerspectiveProjection(30.0, SCREEN_WIDTH / SCREEN_HEIGHT, 1.0, 100.0);
			var vPlane = lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
			var vpPlane = multiMatrix44(pPlane, vPlane);

			var pCube = getPerspectiveProjection(30.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);
			var vCube = lookAt(0.0, 2.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
			var vpCube = multiMatrix44(pCube, vCube);

			var speed = Math.PI/4;
			var rad = 0.0;
			var listTime = null;
			var tick = function (timestamp) {
				var delta = listTime ? (timestamp - listTime) / 1000 : 0;
				listTime = timestamp;
				rad = (rad + speed * delta) % (2 * Math.PI);
				draw(gl, fbo, plane, cube, texture, vpPlane, vpCube, rad);
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		});
	});
}

function initVertexBuffersForCube(gl) {
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

	var cube = {};
	cube.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	cube.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
	cube.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	cube.numIndices = indices.length;

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return cube;
}

function initVertexBuffersForPlane(gl) {
	var vertices = new Float32Array([
		1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0
	]);

	var texCoords = new Float32Array([1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0]);
	var indices = new Uint8Array([0, 1, 2,   0, 2, 3]);

	var plane = {};
	plane.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	plane.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
	plane.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	plane.numIndices = indices.length;

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return plane;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	buffer.num = num;
	buffer.type = type;

	return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
	buffer.type = type;

	return buffer;
}

function initTextures(gl, cb) {
	var image = new Image();
	image.onload = function() {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
		gl.uniform1i(u_Sampler, 0);

		gl.bindTexture(gl.TEXTURE_2D, null);

		cb(texture);
	};

	image.src = './res/image/bg.jpg';
}

function initFramebufferObject(gl) {
	var framebuffer = gl.createFramebuffer();

	// 新建纹理对象作为帧缓冲区的颜色缓冲区对象
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	framebuffer.texture = texture;

	// 新建渲染缓冲区对象作为帧缓冲区的深度缓冲区对象
	var depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

	// 检测帧缓冲区对象的配置状态是否成功
	var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (gl.FRAMEBUFFER_COMPLETE !== e) {
		console.log('Frame buffer object is incomplete: ' + e.toString());
		return;
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	return framebuffer;
}

function draw(gl, fbo, plane, cube, texture, vpPlane, vpCube, rad) {
	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	var rot = getRotationMatrix(rad, 0.0, 1.0, 0.0);

	// 在帧缓冲区的颜色关联对象即纹理对象中绘制立方体，纹理使用图片
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);// 绑定帧缓冲区对象后绘制就会在绑定帧缓冲区中进行绘制
	gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
	gl.clearColor(0.2, 0.2, 0.4, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var mvpCube = multiMatrix44(vpCube, rot);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpCube);
	drawTexturedObject(gl, cube, texture);// 使用图片纹理绘制立方体

	// 在canvas上绘制矩形，纹理使用上一步在纹理对象中绘制的图像
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);// 接触绑定之后，会在默认的颜色缓冲区中绘制
	gl.viewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	/*
	* 默认绘制图形的正方两个面，所以可以看到平面的正反两个面都贴的有纹理
	* 使用下面代码可以开启消隐功能，不再绘制背面
	* */
	// gl.enable(gl.CULL_FACE);

	var mvpPlane = multiMatrix44(vpPlane, rot);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpPlane);
	drawTexturedObject(gl, plane, fbo.texture);// 使用在帧缓冲绘制的纹理绘制矩形
}

function drawTexturedObject(gl, o, texture) {
	initAttributeVariable(gl, 'a_Position', o.vertexBuffer);
	initAttributeVariable(gl, 'a_TexCoord', o.texCoordBuffer);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
	gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

function initAttributeVariable(gl, attributeName, buffer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	var attribute = gl.getAttribLocation(gl.program, attributeName);
	gl.vertexAttribPointer(attribute, buffer.num, buffer.type, false, 0, 0);
	gl.enableVertexAttribArray(attribute);
}