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