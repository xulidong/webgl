# varying变量

前面已经说过的变量类型：

* attribute: 用在顶点着色器中接收顶点相关信息；
* uniform: 可以同时在顶点着色器和片元着色器中使用，接收无顶点无关的数据。

现在来看一个新的变量类型：

* varying 同时在顶点着色器和片元着色器中定义，用于在两者之间传递数据。

示例：

```javascript
/**
 * varing变量
 * xu.lidong@qq.com
 * */

var vertexShaderSrc = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
void main(){
    gl_Position = a_Position;
    v_Color = a_Color;
}`;

var fragmentShaderSrc = `
precision mediump float;// 必须声明浮点数精度，否则会出错
varying vec4 v_Color;
void main(){
    gl_FragColor = v_Color;
}`;

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);
    var n = initVertexBuffers(gl);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.program = shaderProgram;
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.0, 0.5, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 1.0,
    ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);

    return verticesColors.length/5;
}
```

运行结果如图：



在定义三个顶点时，分别制定了红绿蓝，绘制出来的确是一个渐变三角形。这是因为，在光栅化的过程中进行了插值，传入片元着色器的是经过插值之后的颜色。

每个片源(可以理解为像素)都是执行一次片元着色器，修改程序如下：

```javascript
/**
 * varing变量
 * xu.lidong@qq.com
 * */

var vertexShaderSrc = `
attribute vec4 a_Position;
void main(){
    gl_Position = a_Position;
}`;

var fragmentShaderSrc = `
precision mediump float;// 必须声明浮点数精度，否则会出错
uniform float u_Width;
uniform float u_Height;
void main(){
    gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
}`;

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);
    var n = initVertexBuffers(gl);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.program = shaderProgram;
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5,
    ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 2, 0);
    gl.enableVertexAttribArray(a_Position);

    var u_Width = gl.getUniformLocation(gl.program, "u_Width");
    gl.uniform1f(u_Width, gl.drawingBufferWidth);

    var u_Height = gl.getUniformLocation(gl.program, "u_Height");
    gl.uniform1f(u_Height, gl.drawingBufferHeight);

    return verticesColors.length/2;
}
```

程序中颜色红色分量和蓝色分量，是根据位置计算得出的，可以见到该颜色是渐变的，即随着位置不同颜色是不一样的，从而证明每个片源都会执行一次片元着色器。
