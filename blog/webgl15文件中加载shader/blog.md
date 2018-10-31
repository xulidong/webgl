# 从文件中加载shader

随着程序越来越复杂，把shader写在js中不好管理，最好是把shader写在不同的文件中，然后当做资源去加载。

## 一 文件加载

添加一个方法`loadShaderFromFile`，从文件中加载内容，因为加载文件是异步的，因此需要通过回调返回。

```javascript
function loadShaderFromFile(filename, onLoadShader) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(request.readyState === 4 && request.status === 200) {
            onLoadShader(request.responseText);
        }
    };
    request.open("GET", filename, true);
    request.send();
}
```

下面是shader文件的内容，并没有任何修改，只是将上一节中shader字符串中的内容拷贝到了两个文件中

```glsl
// vs
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
```

```glsl
// fs
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
```

## 异步调用

修改上一节中最后代码中的main和initShader两个函数，因为加载shader变成异步的了，所以需要穿入一个回调函数，然后把后面的操作都放在回调函数中进行。

```javascript
/**
 * 从文件中加载shader
 * xu.lidong@qq.com
 * */

var g_LastTime = null;// 上次绘制的时间

function main() {
    var gl = getGL();
    var vsFile = "res/shader/pointlight.vert.glsl";
    var fsFile = "res/shader/pointlight.frag.glsl";
    initShader(gl, vsFile, fsFile, function (sp) {
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
    });
}

function initShader(gl, vsFile, fsFile, cb) {
    var vs = null;
    var fs = null;
    
    var onShaderLoaded = function () {
        if(vs && fs) {
            var sp = createProgram(gl, vs, fs);
            gl.useProgram(sp);
            cb(sp);
        }
    };
    
    loadShaderFromFile(vsFile, function (vsContent) {
        vs = vsContent;
        onShaderLoaded();
    });

    loadShaderFromFile(fsFile, function (fsContent) {
        fs = fsContent;
        onShaderLoaded();
    });
}
```

运行效果跟上一节的都是一样的。