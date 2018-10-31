# WebGL之旅（一）

## 一 canvas

canvas（翻译为画布）是HTML5的一个标签，canvas可以使用JavaScript在网页上绘制图像，例如下面的代码就使用canvas绘制一个简单的矩形。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>WebGL</title>
</head>
<body onload="main()">
    <canvas id="container" width="1280px" height="720px"></canvas>
</body>
</html>
<script type="text/javascript" src="main.js"></script>

```

main.js中的代码如下：

```javascript
function main() {
    var canvas = document.getElementById("container");
    var context = canvas.getContext("2d");
    context.fillStyle = "rgba(0, 0, 255, 1.0)";
    context.fillRect(120, 10, 150, 150);
}
```

canvas只支持一些简单的2d绘制，不支持3d，更重要的是性能有限，WebGL弥补了这两方便的不足。

## 二 WebGL是什么

>WebGL（全写Web Graphics Library）是一种3D绘图标准，这种绘图技术标准允许把JavaScript和OpenGL ES 2.0结合在一起，通过增加OpenGL ES 2.0的一个JavaScript绑定，WebGL可以为HTML5 Canvas提供硬件3D加速渲染。（摘自百度百度）

修改main.js中的代码如下：

```javascript
function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
}
```

上面是一个最简单的WebGL程序，将canvas的颜色设置为黑色。

## 三 Shader

使用WebGL绘制，依赖于着色器（shader）；

1. 顶点着色器（Vertex shader）: 绘制每个定点都会调用一次；
2. 片段着色器（Fragment shader）: 每个片源（可以简单的理解为像素）都会调用一次；

下面是一个简单的例子：

```javascript
/**
 * 使用WebGL画点
 * xu.lidong@qq.com
 * */

// 顶点着色器源码
var vertexShaderSrc = `
void main(){
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);// gl_Position 内置变量，表示点的位置，必须赋值
    gl_PointSize = 10.0;// gl_PointSize 内置变量，表示点的大小（单位像素），可以不赋值，默认为1.0
}`;

// 片段着色器源码
var fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);// 内存变量，表示片元颜色RGBA
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
}

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);// 初始化着色器
    gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
    gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
    gl.drawArrays(gl.POINTS, 0, 1);// 画点
}
```

## 四 坐标系

WebGL使用的是右手系，x水平（右为正），y竖直（上为正），z垂直屏幕（外为正）。

WebGL的宽高范围是从-1到1。

将前面vertexShaderSrc代码中的`gl_Position = vec4(0.0, 0.0, 0.0, 1.0);`分别修改为:

* gl_Position = vec4(1.0, 0.0, 0.0, 1.0);
* gl_Position = vec4(-1.0, 0.0, 0.0, 1.0);
* gl_Position = vec4(0.0, 1.0, 0.0, 1.0);
* gl_Position = vec4(0.0, -1.0, 0.0, 1.0);
* gl_Position = vec4(1.0, 1.0, 0.0, 1.0);
* gl_Position = vec4-(1.0, 1.0, 0.0, 1.0);
* gl_Position = vec4(1.0, -1.0, 0.0, 1.0);
* gl_Position = vec4(-1.0, -1.0, 0.0, 1.0);

可以看到点会被绘制在不同的位置。

## 五 向shader中传值

向shader中传值有两种方式：

1. attribute变量，传递与顶点相关的数组，只能在顶点着色器中使用；
2. uniform变量，传递与顶点无关的数据；

前面的代码将点的位置和大小都直接写在了顶点着色器中，现在将其改为由外面的程序传入。首先修改顶点着色器：

```javascript
var vertexShaderSrc = `
attribute vec4 a_Position;// 接收传入位置坐标，必须声明为全局
attribute float a_PointSize;// 接收传入位置坐标，必须声明为全局
void main(){
    gl_Position = a_Position;// gl_Position 内置变量，表示点的位置，必须赋值
    gl_PointSize = a_PointSize;// gl_PointSize 内置变量，表示点的大小（单位像素），可以不赋值，默认为1.0
}`;

```

然后在initShader的最后给这两个变量赋值：

```javascript
    var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");// 获取shader中的a_Position变量
    gl.vertexAttrib4f(a_Position, 0.0, 0.0, 0.0, 1.0);// 给变量a_Position赋值

    var a_PointSize = gl.getAttribLocation(shaderProgram, "a_PointSize");// 获取shader中的a_PointSize变量
    gl.vertexAttrib1f(a_PointSize, 10.0);// a_PointSize

```

最终的效果跟前面看到的是一样的。
