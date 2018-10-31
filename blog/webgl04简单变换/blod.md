# WebGL之旅（四）变换

变换又叫仿射变换，包括平移，缩放，旋转。

## 一 变换前

首先，我们绘制一个三角形，后面对齐进行变换，代码：

```javascript
/**
 * 变换前
 * xu.lidong@qq.com
 * */

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
void main(){
    gl_Position = a_Position;// gl_Position 内置变量，表示点的位置，必须赋值
}`;

// 片段着色器源码
var fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);// gl_FragColor 内置变量，表示片元颜色，必须赋值
}`;

// 初始化使用的shader
function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
    gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
    gl.compileShader(vertexShader);// 编译定点着色器

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
    gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
    gl.compileShader(fragmentShader);// 编译片段着色器

    var shaderProgram = gl.createProgram();// 创建着色器程序
    gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
    gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
    gl.linkProgram(shaderProgram);// 链接程序
    gl.useProgram(shaderProgram);//使用着色器

    gl.program = shaderProgram;
}

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);// 初始化着色器
    var n = initVertexBuffers(gl);// 初始化顶点

    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.5,
        -0.5, -0.5,
        0.5, -0.5,
    ]);

    var vertexBuffer = gl.createBuffer();// 创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// 将缓冲区对象绑定到目标
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);// 向缓冲区中写入数据

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);// 将缓冲区对象分配给a_Position
    gl.enableVertexAttribArray(a_Position);// 链接a_Position与分配给他的缓冲区对象

    return vertices.length / 2;
}
```

如图：




## 二 平移变换

平移是指将所有顶点的分量按照某个向量分量进行移动。下面是将上面的三角形沿向量（0.5, 0.5, 0.0）移动的示例。

```javascript
/**
 * VBO
 * xu.lidong@qq.com
 * */

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
uniform vec4 u_Translation;// 平移向量
void main(){
    gl_Position = a_Position + u_Translation;// gl_Position 内置变量，表示点的位置，必须赋值
}`;

// 片段着色器源码
var fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);// gl_FragColor 内置变量，表示片元颜色，必须赋值
}`;

// 初始化使用的shader
function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
    gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
    gl.compileShader(vertexShader);// 编译定点着色器

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
    gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
    gl.compileShader(fragmentShader);// 编译片段着色器

    var shaderProgram = gl.createProgram();// 创建着色器程序
    gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
    gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
    gl.linkProgram(shaderProgram);// 链接程序
    gl.useProgram(shaderProgram);//使用着色器

    gl.program = shaderProgram;
}

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);// 初始化着色器
    var n = initVertexBuffers(gl);// 初始化顶点

    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');// 获取u_Translation变量
    // 将u_Translation变量的值设置为(0.5, 0.5, 0.0, 0.0)，最后一个分量为0.0
    // 其次坐标最后一个分量为0.0时，前三个分量表示一个三维坐标点
    // a_Position的最后一个分量会默认设置为1.0，为了使相加之后仍然表示一个点，所以最后一个分量置为0.0
    gl.uniform4f(u_Translation, 0.5, 0.5, 0.0, 0.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.5,
        -0.5, -0.5,
        0.5, -0.5,
    ]);

    var vertexBuffer = gl.createBuffer();// 创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// 将缓冲区对象绑定到目标
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);// 向缓冲区中写入数据

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);// 将缓冲区对象分配给a_Position
    gl.enableVertexAttribArray(a_Position);// 链接a_Position与分配给他的缓冲区对象

    return vertices.length / 2;
}
```

平移之后如图：


## 三 旋转

旋转比移动复杂一点，需要三个变量才能表示：

1. 旋转轴
2. 旋转方向（右手法则旋转：右手握拳，大拇指指向旋转轴正向，其余手指指向旋转的正方向）
3. 旋转角度

计算原理可以参考我之前的[这篇博客](http://blog.csdn.net/xufeng0991/article/details/52017695)。

且看示例：

```javascript
/**
 * VBO
 * xu.lidong@qq.com
 * */

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
uniform float u_Sin, u_Cos;// 旋转角的正余弦值
void main(){
    gl_Position.x = a_Position.x * u_Cos - a_Position.y * u_Sin;
    gl_Position.y = a_Position.x * u_Sin + a_Position.y * u_Cos;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;
}`;

// 片段着色器源码
var fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);// gl_FragColor 内置变量，表示片元颜色，必须赋值
}`;

// 初始化使用的shader
function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
    gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
    gl.compileShader(vertexShader);// 编译定点着色器

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
    gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
    gl.compileShader(fragmentShader);// 编译片段着色器

    var shaderProgram = gl.createProgram();// 创建着色器程序
    gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
    gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
    gl.linkProgram(shaderProgram);// 链接程序
    gl.useProgram(shaderProgram);//使用着色器

    gl.program = shaderProgram;
}

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);// 初始化着色器
    var n = initVertexBuffers(gl);// 初始化顶点

    var rad = Math.PI * 0.5;// 旋转角90度
    var u_Sin = gl.getUniformLocation(gl.program, 'u_Sin');
    gl.uniform1f(u_Sin, Math.sin(rad));

    var u_Cos = gl.getUniformLocation(gl.program, 'u_Cos');
    gl.uniform1f(u_Cos, Math.cos(rad));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.5,
        -0.5, -0.5,
        0.5, -0.5,
    ]);

    var vertexBuffer = gl.createBuffer();// 创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// 将缓冲区对象绑定到目标
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);// 向缓冲区中写入数据

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);// 将缓冲区对象分配给a_Position
    gl.enableVertexAttribArray(a_Position);// 链接a_Position与分配给他的缓冲区对象

    return vertices.length / 2;
}
```

结果如图：


## 四 缩放

缩放比较简单，将顶点的每个分乘以一个缩放因子即可。

代码：

```javascript
/**
 * VBO
 * xu.lidong@qq.com
 * */

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
uniform float u_Rate;// 旋转角的正余弦值
void main(){
    gl_Position.x = a_Position.x * u_Rate;
    gl_Position.y = a_Position.y * u_Rate;
    gl_Position.z = a_Position.z * u_Rate;
    gl_Position.w = 1.0;
}`;

// 片段着色器源码
var fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);// gl_FragColor 内置变量，表示片元颜色，必须赋值
}`;

// 初始化使用的shader
function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
    gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
    gl.compileShader(vertexShader);// 编译定点着色器

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
    gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
    gl.compileShader(fragmentShader);// 编译片段着色器

    var shaderProgram = gl.createProgram();// 创建着色器程序
    gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
    gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
    gl.linkProgram(shaderProgram);// 链接程序
    gl.useProgram(shaderProgram);//使用着色器

    gl.program = shaderProgram;
}

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);// 初始化着色器
    var n = initVertexBuffers(gl);// 初始化顶点

    var u_Rate = gl.getUniformLocation(gl.program, 'u_Rate');
    gl.uniform1f(u_Rate, 0.5);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.5,
        -0.5, -0.5,
        0.5, -0.5,
    ]);

    var vertexBuffer = gl.createBuffer();// 创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// 将缓冲区对象绑定到目标
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);// 向缓冲区中写入数据

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");// 获取a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);// 将缓冲区对象分配给a_Position
    gl.enableVertexAttribArray(a_Position);// 链接a_Position与分配给他的缓冲区对象

    return vertices.length / 2;
}
```

结果:

