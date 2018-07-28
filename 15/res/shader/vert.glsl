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