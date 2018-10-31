# WebGL之旅（十四）平行光和漫反射

## 点光源的方向

对于平行光，直接指定颜色和方向，对于电光鱼的方向则需要通过位置来计算。对于已知坐标的点，其点光源的方向为：

* 入射光线(反)方向 = 光源位置 - 顶点位置

已知方向之后，反射光线的计算就跟平行光一样了。

## 点光源示例

```javascript
/**
 * 点光源
 * xu.lidong@qq.com
 * */

var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;// 顶点法向量
uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;// 入射光颜色
uniform vec3 u_LightPosition;// 点光源位置
uniform vec3 u_LightColorAmbient;// 环境光颜色
varying vec4 v_Color;
varying vec3 v_Position;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(a_Normal));// 归一化法向量
    vec3 dir = normalize(u_LightPosition - vec3(a_Position));// 计算入射光线反方向并归一化
    float cos = max(dot(dir, normal), 0.0);// 计算入射角余弦值
    vec3 diffuse = u_LightColor * vec3(a_Color) * cos;// 计算平行光漫反射颜色
    vec3 ambient = u_LightColorAmbient * a_Color.rgb;// 计算环境光反射颜色
    v_Color = vec4(diffuse + ambient, a_Color.a);// 叠加作为最终的颜色
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
    var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);
    var viewMat = lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
    var mvpMat = multiMatrix44(projMat, viewMat);
    var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

    // 设置入射光
    var u_LightColor = gl.getUniformLocation(sp, "u_LightColor");
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    var u_LightPosition = gl.getUniformLocation(sp, "u_LightPosition");
    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

    // 设置环境光
    var u_LightColorAmbient = gl.getUniformLocation(sp, "u_LightColorAmbient");
    gl.uniform3f(u_LightColorAmbient, 0.2, 0.2, 0.2);

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
    var vertices = new Float32Array([
        2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0,
        2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0,
        2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, 2.0,
        -2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0,
        -2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0,
        2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0
    ]);

    var colors = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
    ]);

    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);

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

如图，在点光源对的照射下，立方体不同位置的反射颜色(包括强度)有不同的差距。为了将这种差距看地更清楚，加一个旋转动画。

```javascript
/**
 * 点光源照射下立方体动画
 * xu.lidong@qq.com
 * */

var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;// 顶点法向量
uniform mat4 u_NormalMatrix;// 模型矩阵的逆转置矩阵
uniform mat4 u_ModelMatrix;// 模型矩阵
uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;// 入射光颜色
uniform vec3 u_LightPosition;// 点光源位置
uniform vec3 u_LightColorAmbient;// 环境光颜色
varying vec4 v_Color;
varying vec3 v_Position;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));// 变换后的法向量为法向量乘以模型矩阵的逆转置矩阵
    vec4 pos = u_ModelMatrix * a_Position;// 计算变换后的坐标
    vec3 dir = normalize(u_LightPosition - vec3(pos));// 计算入射光线反方向并归一化
    float cos = max(dot(dir, normal), 0.0);// 计算入射角余弦值
    vec3 diffuse = u_LightColor * vec3(a_Color) * cos;// 计算平行光漫反射颜色
    vec3 ambient = u_LightColorAmbient * a_Color.rgb;// 计算环境光反射颜色
    v_Color = vec4(diffuse + ambient, a_Color.a);// 叠加作为最终的颜色
}
`;

var gl_SrcFS = `
precision lowp float;
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}
`;

var g_LastTime = null;// 上次绘制的时间

function main() {
    var gl = getGL();
    var sp = initShader(gl, gl_SrcVS, gl_SrcFS);
    var n = initVertexBuffers(gl, sp);

    // 设置入射光
    var u_LightColor = gl.getUniformLocation(sp, "u_LightColor");
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    var u_LightPosition = gl.getUniformLocation(sp, "u_LightPosition");
    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

    // 设置环境光
    var u_LightColorAmbient = gl.getUniformLocation(sp, "u_LightColorAmbient");
    gl.uniform3f(u_LightColorAmbient, 0.2, 0.2, 0.2);

    // mvp矩阵
    var u_ModelMatrix = gl.getUniformLocation(sp, "u_ModelMatrix");
    var u_MvpMatrix = gl.getUniformLocation(sp, "u_MvpMatrix");

    // 逆转置矩阵
    var u_NormalMatrix = gl.getUniformLocation(sp, "u_NormalMatrix");


    var viewMat = lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
    var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var speed = Math.PI/4;// 角速度
    var rad = 0.0;// 启始角度
    var tick = function (timestamp) {
        var delta = g_LastTime ? (timestamp - g_LastTime) / 1000 : 0;// 上次绘制到本次绘制过去的时间(单位转换算成秒)
        g_LastTime = timestamp;// 保存本次时间
        rad = (rad + speed * delta) % (2 * Math.PI);// 当前的弧度
        draw(gl, n, rad, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix, viewMat, projMat);
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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
    var vertices = new Float32Array([
        2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0,
        2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0,
        2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, 2.0,
        -2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0,
        -2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0,
        2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0
    ]);

    var colors = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
    ]);

    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);

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

function draw(gl, n, rad, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix, viewMat, projMat) {
    // 模型矩阵
    var modelMat = getRotationMatrix(rad, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat);

    // 逆转置矩阵
    var inverseMat = inverseMatrix(modelMat);
    var inverseTranposeMat = transposeMatrix(inverseMat);
    gl.uniformMatrix4fv(u_NormalMatrix, false, inverseTranposeMat);

    // mvp矩阵
    var vpMat = multiMatrix44(projMat, viewMat);
    var mvpMat = multiMatrix44(vpMat, modelMat);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BYTE, 0);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
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
```

当立方体开始旋转之后，每个平面法向量就会改变，变换之后的平面法向量可以下面的公司求得：

* 变换后的法向量 = 法向量 x 模型矩阵的逆转置矩阵

因此，新增了一个`inverseMatrix`用于计算矩阵的逆矩阵。

如图，可以看到立方体对着光源的方向，亮度一直更高。



上面这种方式，是通过计算各个顶点的颜色之后，通过插值，得出其他顶点的颜色，有时候这种方法不是很准确，为了得到更加准确的颜色，可以在片元着色器中，对每个顶点的颜色进行计算，只需要将上面代码中的shader修改下即可。

```javascript
var gl_SrcVS = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;// 顶点法向量
uniform mat4 u_NormalMatrix;// 模型矩阵的逆转置矩阵
uniform mat4 u_ModelMatrix;// 模型矩阵
uniform mat4 u_MvpMatrix;
varying vec3 v_Normal;// 顶点法线
varying vec3 v_Position;// 顶点位置
varying vec4 v_Color;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Color = a_Color;
}
`;

var gl_SrcFS = `
precision lowp float;
uniform vec3 u_LightColor;// 入射光颜色
uniform vec3 u_LightPosition;// 点光源位置
uniform vec3 u_LightColorAmbient;// 环境光颜色
varying vec3 v_Normal;// 顶点法线
varying vec3 v_Position;// 顶点位置
varying vec4 v_Color;
void main(){
    vec3 dir = normalize(u_LightPosition - v_Position);
    float cos = max(dot(dir, v_Normal), 0.0);// 计算入射角余弦值
    vec3 diffuse = u_LightColor * vec3(v_Color) * cos;// 计算平行光漫反射颜色
    vec3 ambient = u_LightColorAmbient * v_Color.rgb;// 计算环境光反射颜色
    gl_FragColor = vec4(diffuse + ambient, v_Color.a);// 叠加作为最终的颜色
}
`;
```

如图，课件画面更加细腻真是了。