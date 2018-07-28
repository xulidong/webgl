function getGL() {
	var cavans = document.getElementById("container");
	return cavans.getContext("webgl") || cavans.getContext("experimental-webgl");
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

function loadShaderFromFile(filename, onLoadShader) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		if(request.readyState === 4 && request.status === 200) {
			onLoadShader(request.responseText);
		}
	};
	request.open("GET", filename, true);
	request.send();
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

function initArrayBuffer(gl, sp, data, num, type, attribute) {
	var buff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buff);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	var attr = gl.getAttribLocation(sp, attribute);
	gl.vertexAttribPointer(attr, num, type, false, 0, 0);
	gl.enableVertexAttribArray(attr);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
