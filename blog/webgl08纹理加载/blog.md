# 纹理映射

当传入几个顶点及其颜色后，虽然会对剩余的顶点进行插值，绘制出渐变的图像，但同要绘制的图像更加复杂时，就需要用到另一种方式——纹理映射，来确定每个点的颜色。

当需要绘制一个点的颜色时，不在是通过计算得到，而是去一张事先保存好的图像中，对应的坐标取纹理的颜色。纹理的坐标st(或者叫uv)范围是0-1。

示例：

```javascript
/**
 * 纹理映射
 * xu.lidong@qq.com
 * */

var vertexShaderSrc = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main(){
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
}`;

var fragmentShaderSrc = `
precision mediump float;// 必须声明浮点数精度，否则会出错
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main(){
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}`;

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);
    var n = initVertexBuffers(gl);
    initTextures(gl, n);
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
    var verticesTexCoords = new Float32Array([
        // 顶点坐标	对应的纹理坐标
        -1.0, 1.0,	0.0, 1.0,
        -1.0, -1.0, 0.0, 0.0,
        1.0, 1.0, 	1.0, 1.0,
        1.0, -1.0, 1.0, 0.0
    ]);
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return verticesTexCoords.length/4;
}

function initTextures (gl, n) {
    var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");

    var image = new Image();
    image.onload = function () {
        loadTexture(gl, n, u_Sampler, image);
    };
    image.src = "./sky.jpg";
}

function loadTexture(gl, n, u_Sampler, image) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);// 图像坐标与纹理坐标Y轴方向相反，需进行Y轴反转

    var texture = gl.createTexture();// 创建纹理
    gl.activeTexture(gl.TEXTURE0);// 激活0号纹理单元（0号是默认激活的纹理单元）
    gl.bindTexture(gl.TEXTURE_2D, texture);// 绑定纹理对象到激活的纹理单元

    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);// 纹理放大方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);// 纹理缩小方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);// 纹理水平填充方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);// 纹理垂直填充方式

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);// 配置纹理图像

    gl.uniform1i(u_Sampler, 0);// 将0号纹理传递给着色器
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

```

如图：



加载图片的方法由浏览器提供，是异步的，需要在加载完成之后的回调中进行绘制。

```javascript
/**
 * 纹理叠加
 * xu.lidong@qq.com
 * */

var vertexShaderSrc = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main(){
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
}`;

var fragmentShaderSrc = `
precision mediump float;// 必须声明浮点数精度，否则会出错
uniform sampler2D u_Sampler;
uniform sampler2D u_Sampler1;
varying vec2 v_TexCoord;
void main(){
    vec4 color = texture2D(u_Sampler, v_TexCoord);
    vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
    if (color1.a > 0.0) {
		gl_FragColor.r = color1.r;
		gl_FragColor.g = color1.g;
		gl_FragColor.b = color1.b;
		gl_FragColor.a = color1.a;
    } else {
		gl_FragColor.r = color.r;
		gl_FragColor.g = color.g;
		gl_FragColor.b = color.b;
		gl_FragColor.a = color.a;
    }
}`;

var g_LoadImage = false;
var g_LoadImage1 = false;

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    initShader(gl);
    var n = initVertexBuffers(gl);
    initTextures(gl, n);
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
    var verticesTexCoords = new Float32Array([
        // 顶点坐标	对应的纹理坐标
        -1.0, 1.0,	0.0, 1.0,
        -1.0, -1.0, 0.0, 0.0,
        1.0, 1.0, 	1.0, 1.0,
        1.0, -1.0, 1.0, 0.0
    ]);
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return verticesTexCoords.length/4;
}

function initTextures (gl, n) {
    var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
    var u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");

    var image = new Image();
    var image1 = new Image();

    image.onload = function () {
        loadTexture(gl, n, u_Sampler, image, 0);
    };

    image1.onload = function () {
        loadTexture(gl, n, u_Sampler1, image1, 1);
    };

    image.src = "./sky.jpg";
    image1.src = "./girl.png";
}

function loadTexture(gl, n, u_Sampler, image, texUnit) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);// 图像坐标与纹理坐标Y轴方向相反，需进行Y轴反转

    var texture = gl.createTexture();// 创建纹理
    if (texUnit === 0) {
        gl.activeTexture(gl.TEXTURE0);// 激活0号纹理单元（0号是默认激活的纹理单元）
        g_LoadImage = true;
    } else {
        gl.activeTexture(gl.TEXTURE1);// 激活0号纹理单元（0号是默认激活的纹理单元）
        g_LoadImage1 = true;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);// 绑定纹理对象到激活的纹理单元
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);// 纹理放大方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);// 纹理缩小方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);// 纹理水平填充方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);// 纹理垂直填充方式

    var color = (texUnit === 0) ? gl.RGB: gl.RGBA;
    gl.texImage2D(gl.TEXTURE_2D, 0, color, color, gl.UNSIGNED_BYTE, image);// 配置纹理图像

    gl.uniform1i(u_Sampler, texUnit);

    if (g_LoadImage && g_LoadImage1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}
```

如图：



背景是jpg格式，任务为png格式，在两个纹理颜色叠加时，优先使用人物的颜色。
