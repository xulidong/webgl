/**
 * 按行显示 4 x 4 矩阵
 * */
function printMatrix (mat) {
	for (var i = 0; i < 4; i++) {
		console.log(mat[i * 4] + "," + mat[i * 4 + 1] + "," + mat[i * 4 + 2] + "," + mat[i * 4 + 3] + ",");
	}
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
 * 视图矩阵
 * */
function lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
	var f = subVector([centerX, centerY, centerZ], [eyeX, eyeY, eyeZ]);
	f = normalizeVector(f);

	var s = crossMultiVector(f, [upX, upY, upZ]);
	s = normalizeVector(s);

	var u = crossMultiVector(s, f);

	var r = new Float32Array([
		s[0], u[0], -f[0], 0,
		s[1], u[1], -f[1], 0,
		s[2], u[2], -f[2], 0,
		0, 0, 0, 1
	]);
	var t = getTranslationMatrix(-eyeX, -eyeY, -eyeZ);
	return multiMatrix44(r, t);
}

/**
 * 正射投影矩阵
 * */
function getOrthoProjection(left, right, bottom, top, near, far) {
	var rw = 1 / (right - left);
	var rh = 1 / (top - bottom);
	var rd = 1 / (far - near);

	return new Float32Array([
		2 * rw, 0, 0, 0,
		0, 2 * rw, 0, 0,
		0, 0, -2 * rd, 0.0,
		-(right + left) * rw, -(top + bottom) * rh, -(far + near) * rd, 1
	]);
}

/**
 * 透视投影矩阵
 * */
function getPerspectiveProjection(fov, aspect, near, far) {
	var fovy = Math.PI * fov / 180 / 2;
	var s = Math.sin(fovy);
	var rd = 1 / (far - near);
	var ct = Math.cos(fovy) / s;

	return new Float32Array([
		ct / aspect, 0, 0, 0,
		0, ct, 0, 0,
		0, 0, -(far + near) * rd, -1,
		0, 0, -2 * near * far * rd, 0,
	]);
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
 * 向量点乘
 * */
function dotMultiVector(v1, v2) {
	var res = 0;
	for (var i = 0; i < v1.length; i++) {
		res += v1[i] * v2[i];
	}
	return res;
}

/**
 * 向量叉乘
 * */
function crossMultiVector(v1, v2) {
	return [
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0]
	];
}

/**
 * 向量减法
 * */
function subVector(v1, v2){
	return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

/**
 * 向量加法
 * */
function addVector(v1, v2){
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

/**
 * 向量归一化
 * */
function normalizeVector(v) {
	var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	return (len > 0.00001) ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
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

/**
 * 求矩阵的逆矩阵
 * */
function inverseMatrix(mat) {
	var inv = new Float32Array(16);
	inv[0] = mat[5] * mat[10] * mat[15] - mat[5] * mat[11] * mat[14] - mat[9] * mat[6] * mat[15]
		+ mat[9] * mat[7] * mat[14] + mat[13] * mat[6] * mat[11] - mat[13] * mat[7] * mat[10];
	inv[4] = -mat[4] * mat[10] * mat[15] + mat[4] * mat[11] * mat[14] + mat[8] * mat[6] * mat[15]
		- mat[8] * mat[7] * mat[14] - mat[12] * mat[6] * mat[11] + mat[12] * mat[7] * mat[10];
	inv[8] = mat[4] * mat[9] * mat[15] - mat[4] * mat[11] * mat[13] - mat[8] * mat[5] * mat[15]
		+ mat[8] * mat[7] * mat[13] + mat[12] * mat[5] * mat[11] - mat[12] * mat[7] * mat[9];
	inv[12] = -mat[4] * mat[9] * mat[14] + mat[4] * mat[10] * mat[13] + mat[8] * mat[5] * mat[14]
		- mat[8] * mat[6] * mat[13] - mat[12] * mat[5] * mat[10] + mat[12] * mat[6] * mat[9];

	inv[1] = -mat[1] * mat[10] * mat[15] + mat[1] * mat[11] * mat[14] + mat[9] * mat[2] * mat[15]
		- mat[9] * mat[3] * mat[14] - mat[13] * mat[2] * mat[11] + mat[13] * mat[3] * mat[10];
	inv[5] = mat[0] * mat[10] * mat[15] - mat[0] * mat[11] * mat[14] - mat[8] * mat[2] * mat[15]
		+ mat[8] * mat[3] * mat[14] + mat[12] * mat[2] * mat[11] - mat[12] * mat[3] * mat[10];
	inv[9] = -mat[0] * mat[9] * mat[15] + mat[0] * mat[11] * mat[13] + mat[8] * mat[1] * mat[15]
		- mat[8] * mat[3] * mat[13] - mat[12] * mat[1] * mat[11] + mat[12] * mat[3] * mat[9];
	inv[13] = mat[0] * mat[9] * mat[14] - mat[0] * mat[10] * mat[13] - mat[8] * mat[1] * mat[14]
		+ mat[8] * mat[2] * mat[13] + mat[12] * mat[1] * mat[10] - mat[12] * mat[2] * mat[9];

	inv[2] = mat[1] * mat[6] * mat[15] - mat[1] * mat[7] * mat[14] - mat[5] * mat[2] * mat[15]
		+ mat[5] * mat[3] * mat[14] + mat[13] * mat[2] * mat[7] - mat[13] * mat[3] * mat[6];
	inv[6] = -mat[0] * mat[6] * mat[15] + mat[0] * mat[7] * mat[14] + mat[4] * mat[2] * mat[15]
		- mat[4] * mat[3] * mat[14] - mat[12] * mat[2] * mat[7] + mat[12] * mat[3] * mat[6];
	inv[10] = mat[0] * mat[5] * mat[15] - mat[0] * mat[7] * mat[13] - mat[4] * mat[1] * mat[15]
		+ mat[4] * mat[3] * mat[13] + mat[12] * mat[1] * mat[7] - mat[12] * mat[3] * mat[5];
	inv[14] = -mat[0] * mat[5] * mat[14] + mat[0] * mat[6] * mat[13] + mat[4] * mat[1] * mat[14]
		- mat[4] * mat[2] * mat[13] - mat[12] * mat[1] * mat[6] + mat[12] * mat[2] * mat[5];

	inv[3] = -mat[1] * mat[6] * mat[11] + mat[1] * mat[7] * mat[10] + mat[5] * mat[2] * mat[11]
		- mat[5] * mat[3] * mat[10] - mat[9] * mat[2] * mat[7] + mat[9] * mat[3] * mat[6];
	inv[7] = mat[0] * mat[6] * mat[11] - mat[0] * mat[7] * mat[10] - mat[4] * mat[2] * mat[11]
		+ mat[4] * mat[3] * mat[10] + mat[8] * mat[2] * mat[7] - mat[8] * mat[3] * mat[6];
	inv[11] = -mat[0] * mat[5] * mat[11] + mat[0] * mat[7] * mat[9] + mat[4] * mat[1] * mat[11]
		- mat[4] * mat[3] * mat[9] - mat[8] * mat[1] * mat[7] + mat[8] * mat[3] * mat[5];
	inv[15] = mat[0] * mat[5] * mat[10] - mat[0] * mat[6] * mat[9] - mat[4] * mat[1] * mat[10]
		+ mat[4] * mat[2] * mat[9] + mat[8] * mat[1] * mat[6] - mat[8] * mat[2] * mat[5];

	var det = mat[0] * inv[0] + mat[1] * inv[4] + mat[2] * inv[8] + mat[3] * inv[12];
	det = 1 / det;

	var d = new Float32Array(16);
	for (var i = 0; i < 16; i++) {
		d[i] = inv[i] * det;
	}
	return d;
}