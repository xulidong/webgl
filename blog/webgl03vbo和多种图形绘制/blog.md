# VBO和多种图形绘制

通过gl.vertexAttribXX和gl.uniformXX函数，一次只能向shader中传递一个变量，要一次性向shader中传递多个数据就要用到顶点缓冲区对象(VBO)。

## 一 VBO

VBO使用步骤:

1. 创建缓冲区对象（gl.createBuffer()）；
2. 绑定缓冲区对象（gl.bindBuffer()）；
3. 将数据写入缓冲区（gl.bufferData()）；
4. 将缓冲区对象分配给一个attribute变量（gl.vetextAttribPointer()）；
5. 开启attribute变量（gl。enableVetextAttribArray()）。

示例：

```javascript
/**
 * VBO
 * xu.lidong@qq.com
 * */

// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
attribute float a_PointSize;// 接收传入位置坐标，必须声明为全局
void main(){
    gl_Position = a_Position;// gl_Position 内置变量，表示点的位置，必须赋值
    gl_PointSize = a_PointSize;// gl_PointSize 内置变量，表示点的大小（单位像素），可以不赋值，默认为1.0
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

    var a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");// 获取shader中的a_PointSize变量
    gl.vertexAttrib1f(a_PointSize, 10.0);// 给a_PointSize赋值

    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
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



通过initVertexBuffers函数，一次性向缓冲区写入了三个顶点，绘制每个顶点时，都会执行一次顶点着色器程序。

另外，需要注意的时，通过vertexAttribPointer函数，我们只给a_Position传递了两个值，另外两个值将被自动填充为0.0和1.0f。

## 多种图形的绘图

前面我们通过`gl.drawArrays(gl.POINTS, 0, 3);`绘制了三个点，将分别修改为：

1. gl.drawArrays(gl.POINTS, 0, 2); 绘制2个点
1. gl.drawArrays(gl.POINTS, 0, 1); 绘制1个点

可以看到，可以通过修改第三个参数来控制绘制点的个数。

修改第一个参数呢?将代码做个小得调整：

1. 删掉gl_PointSize相关代码，gl_PointSize只在绘制点时生效
2. gl.POINTS修改为gl.TRANGLES

如下：

```javascript
/**
 * 绘制多种图形
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
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
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


参数说明：

* POINTS：绘制一个个点单；
* LINES：在V0-V1，V2-V3，...之间划线，奇数个点最后一个会被忽略；
* LINE_STRIP: 依次收尾链接v0-v1-v2-v3...；
* LINE_LOOP：在所有点之间两两连线；
* TRIANGLES: 绘制三角形v0-v1-v2， v3-v4-v5，...；
* TRIANGLE_STRIP：任意连续三个点之间绘制三角形；
* TRIANGLE_FAN：复用上一个三角形的一边与下一个点，绘制一个三角形。

为了测试这些类型，将定点数扩展到4个。修改vertices的值为：

```javascript
    var vertices = new Float32Array([
        -0.5, 0.5,
        -0.5, -0.5,
        0.5, 0.5,
        0.5, -0.5
    ]);
```

然后修改参数的值，就可以看到绘制出不同的图形， 如下：


