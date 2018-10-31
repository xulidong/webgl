# 漫反射

## 一 相关概念

* 光：方向 + 颜色(包含了强度)

* 光源
	1. 平行光：同方向 + 颜色
	2. 点光源：方向（光源位置到照射位置） + 颜色
	3. 环境光：颜色

* 入射角：入射光反方向与平面法线的夹角

* 反射：
	1. 漫反射： 反射的光在各个方向上均匀，反射光颜色=入射光颜色 X 基底色 X cos(a)，a为入射角
	2. 环境反射： 反射光颜色=环境光颜色 X 基底色
	3. 漫反射 + 环境反射: 反射光颜色= 漫反射光颜色+ 环境光颜色


## 二 表面颜色相同的立方体

```javascript
/**
 * 同色立方体
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
    if (!gl.getProgramParameter(sp, gl.LINK_STATUS)) {
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
    // 立方体的六个面及每个面的两个三角形
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    // 每个顶点的颜色
    var colors = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ]);

    // 立方体的六个面，每个面有两个三角形组成
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(sp, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var cbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(sp, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
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

如图，可以看到，因为颜色相同，很慢直观感受出，这是一个立方体，与实际情况不符。

## 三 平行光漫反射下的立方体

```javascript
/**
 * 平行光下(directional light)的漫反射(diffuse reflection)
 * xu.lidong@qq.com
 * */

var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;// 顶点法向量
uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;// 入射光颜色
uniform vec3 u_LightDir;// 入射光方向
varying vec4 v_Color;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(a_Normal));// 归一化法向量
    float cos = max(dot(u_LightDir, normal), 0.0);// 计算入射角余弦值
    vec3 diffuse = u_LightColor * vec3(a_Color) * cos;// 计算漫反射颜色
    v_Color = vec4(diffuse, a_Color.a);
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

    // 设置mvp
    var projMat = getPerspectiveProjection(30, 16/9, 1, 100);
    var viewMat = lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    var mvpMat = multiMatrix44(projMat, viewMat);
    var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

    // 设置入射光
    var u_LightColor = gl.getUniformLocation(sp, "u_LightColor");
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

    var dir = normalizeVector([0.5, 3.0, 4.0]);
    var u_LightDir = gl.getUniformLocation(sp, "u_LightDir");
    gl.uniform3f(u_LightDir, dir[0], dir[1], dir[2]);

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
    if (!gl.getProgramParameter(sp, gl.LINK_STATUS)) {
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
    // 立方体的六个面及每个面的两个三角形
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);

    // 每个顶点的法向量
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);

    // 每个顶点的颜色
    var colors = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
    ]);

    // 立方体的六个面，每个面有两个三角形组成
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

function initArrayBuffer(gl, sp, data, num, type, attribute) {
    var buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var attr = gl.getAttribLocation(sp, attribute);
    gl.vertexAttribPointer(attr, num, type, false, 0, 0);
    gl.enableVertexAttribArray(attr);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function draw(gl, n) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BYTE, 0);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
```

如图，加入光照之后的立方体就很清晰了，每个表面都程序出了不同的明暗程度。



## 四 环境光漫反射下的立方体

修改上面的代码，加入环境光。

```javascript
var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;// 顶点法向量
uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;// 入射光颜色
uniform vec3 u_LightDir;// 入射光方向
uniform vec3 u_LightColorAmbient;// 环境光颜色
varying vec4 v_Color;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(a_Normal));// 归一化法向量
    float cos = max(dot(u_LightDir, normal), 0.0);// 计算入射角余弦值
    vec3 diffuse = u_LightColor * vec3(a_Color) * cos;// 计算平行光漫反射颜色
    vec3 ambient = u_LightColorAmbient * a_Color.rgb;// 计算环境光反射颜色
    v_Color = vec4(diffuse + ambient, a_Color.a);
}

function main() {
    var gl = getGL();
    var sp = initShader(gl, gl_SrcVS, gl_SrcFS);

    // 设置mvp
    var projMat = getPerspectiveProjection(30, 16/9, 1, 100);
    var viewMat = lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    var mvpMat = multiMatrix44(projMat, viewMat);
    var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

    // 设置入射光
    var u_LightColor = gl.getUniformLocation(sp, "u_LightColor");
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

    var dir = normalizeVector([0.5, 3.0, 4.0]);
    var u_LightDir = gl.getUniformLocation(sp, "u_LightDir");
    gl.uniform3f(u_LightDir, dir[0], dir[1], dir[2]);

    // 设置环境光
    var u_LightColorAmbient = gl.getUniformLocation(sp, "u_LightColorAmbient");
    gl.uniform3f(u_LightColorAmbient, 0.2, 0.2, 0.2);

    var n = initVertexBuffers(gl, sp);
    draw(gl, n)
}
`;
```
如图，可以发现立方体较暗的一面光纤增强了。
