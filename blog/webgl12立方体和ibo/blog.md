# 绘制立方体

在计算机中，所有的图像都是有三角形组成，绘制立方也是通过绘制三角形。立方体有6个面，每个面需要2个三角形，每个三角形3个定点，因此需要绘制12个三角形即36个点。但立方体本来只有6个定点定点就可以确定了，如何优化点这些冗余的数据呢？答案就是IBO(index buffer object)，在一个vbo中，保存这6个定点，指定36个定点时，通过索引从这6个定点中取值。

另外，为了是代码更加简洁，将一些向量和矩阵的计算抽离到了功能的文件`MathUtils.js`文件中，内容如下

```javascript
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
```

在html中，先引入上面的脚本，修改html如下：

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
</body>
</html>
<script type="text/javascript" src="js/MathUtils.js"></script>
<script type="text/javascript" src="js/cube.js"></script>

```

然后，绘制立方体的代码如下：

```javascript
/**
 * 绘制立方体:ibo
 * xu.lidong@qq.com
 * */

var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_MvpMatrix;
varying vec4 v_Color;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
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

    var projMat = getPerspectiveProjection(30, 1, 1, 100);
    var viewMat = lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    var mvpMat = multiMatrix44(projMat, viewMat);

    var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

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
    if(!gl.getProgramParameter(sp, gl.LINK_STATUS)){
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
    // 立方体的六个面及其颜色
    var verticesColors = new Float32Array([
        1.0,  1.0,  1.0,     1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,
        1.0, -1.0,  1.0,     1.0,  1.0,  0.0,
        1.0, -1.0, -1.0,     0.0,  1.0,  0.0,
        1.0,  1.0, -1.0,     0.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0
    ]);

    // 立方体的六个面，每个面有两个三角形组成
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,
        0, 3, 4,   0, 4, 5,
        0, 5, 6,   0, 6, 1,
        1, 6, 7,   1, 7, 2,
        7, 4, 3,   7, 3, 2,
        4, 7, 6,   4, 6, 5
    ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(sp, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(sp, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function draw(gl, n) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BYTE, 0);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

```

绘制结果如图：


