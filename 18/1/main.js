// 鼠标点选立方体
// 1 获取鼠标点击的位置；
// 2 将立方体绘制成红色（也可以是其他颜色）；
// 3 判断鼠标点击位置的颜色
// 4 恢复立方体的颜色

function main() {
	var gl = getGL();
	var vsFile = "./res/shader/vert.glsl";
	var fsFile = "./res/shader/frag.glsl";

	initShader(gl, vsFile, fsFile, function (shaderProgram) {
		var n = initVertexBuffers(gl, shaderProgram);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		var u_Clicked = gl.getUniformLocation(shaderProgram, 'u_Clicked');
		gl.uniform1i(u_Clicked, 0);

		var viewMat = lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
		var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);
		var vpMat = multiMatrix44(projMat, viewMat);

		var u_MvpMatrix = gl.getUniformLocation(shaderProgram, 'u_MvpMatrix');
		gl.uniformMatrix4fv(u_MvpMatrix, false, vpMat);

		draw(gl, n);
		var tick = function() {
			draw(gl, n);
			requestAnimationFrame(tick);
		};
		tick();

		var canvas = document.getElementById("container");
		canvas.onmousedown = function(ev) {
			var x = ev.clientX, y = ev.clientY;
			var rect = ev.target.getBoundingClientRect();
			if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
				var x_in_canvas = x - rect.left;
				var y_in_canvas = rect.bottom - y;
				var click = check(gl, shaderProgram, n, x_in_canvas, y_in_canvas);
				if (click){
					console.log('The cube was selected!');
				}
			}
		}
	})
}

function check(gl, shaderProgram, n, x, y) {
	var click = false;

	var u_Clicked = gl.getUniformLocation(shaderProgram, 'u_Clicked');
	gl.uniform1i(u_Clicked, 1);
	draw(gl, n);

	var pixels = new Uint8Array(4);
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	if (pixels[0] === 255){
		click = true;
	}

	gl.uniform1i(u_Clicked, 0);
	draw(gl, n);

	return click;
}

function draw(gl, n) {
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

	var colors = new Float32Array([
		0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82,
		0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,
		0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,
		0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84,
		0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56,
		0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93,
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
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}