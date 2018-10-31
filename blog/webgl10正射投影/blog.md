# 正射投影

要将三维物体在二维的平面上显示，必须经过投影，投影分为两种：

* 正射投影 长方体的可视空间 物体大小不随位置变化
* 透视投影 四棱锥的可是空间 近大远小

下面的例子绘制了三个三角形，可以通过wasd修改远近界面。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>WebGL</title>
    <style>
        body { background-color: gray; }
        canvas { border: 2px solid; }
    </style>
</head>
<body onload="main()">
    <canvas id="container" width="1280px" height="720px"></canvas>
    <p id="nearFar"></p>
</body>
</html>
<script type="text/javascript" src="js/oproj.js"></script>
```

```javscript
/**
 * 正射投影矩阵
 * xu.lidong@qq.com
 * */

var g_vs = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ProjMat;
varying vec4 v_Color;
void main() {
    gl_Position = u_ProjMat * a_Position;
    v_Color = a_Color;
}`;

var g_fs = `
precision mediump float;
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}`;

var g_near = 0.0;
var g_far = 0.5;
var g_nf;

function main() {
    g_nf = document.getElementById("nearFar");

    var gl = getGL();
    var shaderProgram = initShader(gl);
    var n = initVertexBuffers(gl, shaderProgram);
    draw(gl, shaderProgram, n);

    document.onkeydown = function (event) {
        if(event.key === 'a') {
            g_near += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'd') {
            g_near -= 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'w') {
            g_far += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 's') {
            g_far -= 0.01;
            draw(gl, shaderProgram, n);
        } else {

        }
    }
}

function getGL() {
    var canvas = document.getElementById("container");
    return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
}

function initShader(gl) {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource( vs, g_vs);
    gl.compileShader(vs);

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource( fs, g_fs);
    gl.compileShader(fs);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function initVertexBuffers(gl, shaderProgram) {
    var verticesColors = new Float32Array([
        // 顶点坐标			颜色
        0.0, 0.6,-0.4,		0.4, 1.0, 0.4,
        -0.5, -0.4, -0.4,	0.4, 1.0, 0.4,
        0.5, -0.4, -0.4,	1.0, 0.4, 0.4,

        0.5, 0.4, -0.2,	1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2,	1.0, 1.0, 0.4,
        0.0, -0.6, -0.2,	1.0, 1.0, 0.4,

        0.0, 0.5, 0.0,		0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0,	0.4, 0.4, 1.0,
        0.5, -0.5, 0.0,		1.0, 0.4, 0.4,
    ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(shaderProgram, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    return verticesColors.length / 6;
}

function draw(gl, shaderProgram, n) {
    g_nf.innerHTML = "near:" + g_near + ",far:" + g_far;

    var u_ProjMat = gl.getUniformLocation(shaderProgram, "u_ProjMat");
    var viewMat = getOrthoProjection(-1, 1, -1, 1, g_near, g_far);
    gl.uniformMatrix4fv(u_ProjMat, false, viewMat);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

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

```

如图：


下面的例子是先将图像变换到相机空间中，然后在进行投影变换。

```javascript
/**
 * 正射投影矩阵
 * xu.lidong@qq.com
 * */

var g_vs = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ViewMat;
uniform mat4 u_ProjMat;
varying vec4 v_Color;
void main() {
    gl_Position = u_ProjMat * u_ViewMat * a_Position;
    v_Color = a_Color;
}`;

var g_fs = `
precision mediump float;
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}`;

var g_near = 0.0;
var g_far = 0.5;
var g_nf;

function main() {
    g_nf = document.getElementById("nearFar");

    var gl = getGL();
    var shaderProgram = initShader(gl);
    var n = initVertexBuffers(gl, shaderProgram);
    draw(gl, shaderProgram, n);

    document.onkeydown = function (event) {
        if(event.key === 'a') {
            g_near += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'd') {
            g_near -= 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'w') {
            g_far += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 's') {
            g_far -= 0.01;
            draw(gl, shaderProgram, n);
        } else {

        }
    }
}

function getGL() {
    var canvas = document.getElementById("container");
    return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
}

function initShader(gl) {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource( vs, g_vs);
    gl.compileShader(vs);

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource( fs, g_fs);
    gl.compileShader(fs);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function initVertexBuffers(gl, shaderProgram) {
    var verticesColors = new Float32Array([
        // 顶点坐标			颜色
        0.0, 0.6,-0.4,		0.4, 1.0, 0.4,
        -0.5, -0.4, -0.4,	0.4, 1.0, 0.4,
        0.5, -0.4, -0.4,	1.0, 0.4, 0.4,

        0.5, 0.4, -0.2,	1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2,	1.0, 1.0, 0.4,
        0.0, -0.6, -0.2,	1.0, 1.0, 0.4,

        0.0, 0.5, 0.0,		0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0,	0.4, 0.4, 1.0,
        0.5, -0.5, 0.0,		1.0, 0.4, 0.4,
    ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(shaderProgram, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    return verticesColors.length / 6;
}

function draw(gl, shaderProgram, n) {
    g_nf.innerHTML = "near:" + g_near + ",far:" + g_far;

    var u_ProjMat = gl.getUniformLocation(shaderProgram, "u_ProjMat");
    var projMat = getOrthoProjection(-1, 1, -1, 1, g_near, g_far);
    gl.uniformMatrix4fv(u_ProjMat, false, projMat);

    var u_ViewMat = gl.getUniformLocation(shaderProgram, "u_ViewMat");
    var viewMat = lookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMat, false, viewMat);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

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
 *  以下代码为lookAt的实现
 * */

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
    var zAxis = subVector([eyeX, eyeY, eyeZ], [centerX, centerY, centerZ]);
    var N = normalizeVector(zAxis);

    var xAxis = crossMultiVector(N, [upX, upY, upZ]);
    var U = normalizeVector(xAxis);

    var V = crossMultiVector(U, N);

    // 旋转的逆矩阵
    var r = new Float32Array([
        U[0], V[0], -N[0], 0,
        U[1], V[1], -N[1], 0,
        U[2], V[2], -N[2], 0,
        0, 0, 0, 1
    ]);
    // 平移的逆矩阵
    var t = getTranslationMatrix(-eyeX, -eyeY, -eyeZ);

    return multiMatrix44(r, t);
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
```

如图，也可以修改远近界面。


