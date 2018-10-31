# 视图矩阵

## 一 相机状态描述

视点：相机在世界坐标中的位置 eye(eyeX, eyeY, eyeZ)

观测点：被观察的目标点，指明相机的朝向 at(atX, atY, atZ)

视线：从视点出发指向观测点方向的射线 dir(atX - eyeX, atY - eyeY, atZ - eyeZ)

上方向：图像的上方向，指明相机以视线为轴的旋转角 up(upX, upY, upZ)

## 二 相机坐标系

定义： 以视点为原点，以视线为z轴负方向，x轴与y轴与图像的x,y轴平行。

根据定义，首先可得出：

* zAxis：-dir = eye - at = (eyeX - atX, eyeY - atY, eyeZ - atZ) 归一化 N(Nx, Ny, Nz)
* xAxis：up X zAxis 归一化 U(Ux, Uy, Uz)
* yAxis: zAxis X xAxis 归一化 V(Vx, Vy, Vz)

## 三 视图矩阵

姿态矩阵：相机位置变化矩阵。

视图矩阵：将顶点有世界坐标系转到到相机坐标系下的变化矩阵。

当相机位置变化时，可以看作相机不动，被观测物体发生相反的，所以视图矩阵即为姿态矩阵的逆矩阵。

假设相机初始坐标系与世界坐标重合，然后一个旋转变化R，然后经过一个平移变换T，得到相机坐标系。

> 复合变换矩阵C=TR。视图矩阵V=C的逆矩阵c=R的逆矩阵r x T的逆矩阵t，即V=rt;

平移矩阵T：

$$
 \left[
 \begin{matrix}
   1 & 0 & 0 & x\\
   0 & 1 & 0 & y\\
   0 & 0 & 1 & z\\
   0 & 0 & 0 & 1
  \end{matrix}
  \right]
$$

平移矩阵T的逆矩阵t：

$$
 \left[
 \begin{matrix}
   1 & 0 & 0 & -x\\
   0 & 1 & 0 & -y\\
   0 & 0 & 1 & -z\\
   0 & 0 & 0 & 1
  \end{matrix}
  \right]
$$

相机经过r变化之后与世界坐标的原点就重合了，此时对于世界坐标系中的一个点P(X, Y, Z)，求在空间坐标系中的点p(x, y, z)，则：

* p=P * (U， V， N) 即
* X = X * Ux + Y * Uy + Z * Uz;
* Y = X * Vx + Y * Vy + Z * Vz;
* Z = X * Nx + Y * Ny + Z * Nz;

表示为矩阵形式即为R：

$$
 \left[
 \begin{matrix}
   Ux & Vx & Nx & x\\
   Uy & Vy & Ny & y\\
   Uz & Vz & Nz & z\\
   0 & 0 & 0 & 1
  \end{matrix}
  \right]
$$

逆矩阵r就为：

$$
 \left[
 \begin{matrix}
   Ux & Ux & Ux & x\\
   Vy & Vy & Vy & y\\
   Nz & Nz & Nz & z\\
   0 & 0 & 0 & 1
  \end{matrix}
  \right]
$$

可以求出V=rt的值为：

$$
 \left[
 \begin{matrix}
   Ux & Ux & Ux & x\\
   Vy & Vy & Vy & y\\
   Nz & Nz & Nz & z\\
   0 & 0 & 0 & 1
  \end{matrix}
  \right]
$$

## 四 函数实现

```javascript
/**
 * 视图矩阵
 * */
function lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    var zAxis = subVector([centerX, centerY, centerZ], [eyeX, eyeY, eyeZ]);
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
 * 向量减法
 * */
function subVector(v1, v2){
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

/**
 * 向量归一化
 * */
function normalizeVector(v) {
    var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return (len > 0.00001) ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
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

## 五 示例

```javascript
/**
 * 视图矩阵
 * xu.lidong@qq.com
 * */

var g_vs = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ViewMat;
varying vec4 v_Color;
void main() {
    gl_Position = u_ViewMat * a_Position;
    v_Color = a_Color;
}`;

var g_fs = `
precision mediump float;
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}`;

var g_eyeX = 0.0;
var g_eyeY = 0.0;

function main() {
    var gl = getGL();
    var shaderProgram = initShader(gl);
    var n = initVertexBuffers(gl, shaderProgram);
    draw(gl, shaderProgram, n);

    document.onkeydown = function (event) {
        if(event.key === 'a') {
            g_eyeX += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'd') {
            g_eyeX -= 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'w') {
            g_eyeY += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 's') {
            g_eyeY -= 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 'b') {
            g_eyeZ += 0.01;
            draw(gl, shaderProgram, n);
        } else if(event.key === 't') {
            g_eyeZ -= 0.01;
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
        0.0, 0.5, -0.4, 	0.4, 1.0, 0.4,
        -0.5, -0.5, -0.4,	0.4, 1.0, 0.4,
        0.5, -0.5, -0.4,	1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 	1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2,	1.0, 1.0, 0.4,
        0.0, -0.6, -0.2,	1.0, 1.4, 0.4,

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
    var u_ViewMat = gl.getUniformLocation(shaderProgram, "u_ViewMat");
    var viewMat = lookAt(g_eyeX, g_eyeY, 0, 0, 0, -1, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMat, false, viewMat);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
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

```

绘制了三个三角形，通过按键wasd可以修改视点的位置。

参考：
https://baike.baidu.com/item/%E7%9B%B8%E6%9C%BA%E5%9D%90%E6%A0%87%E7%B3%BB
http://www.jikexueyuan.com/course/1451.html
http://www.cnblogs.com/mikewolf2002/archive/2012/11/25/2787636.html



