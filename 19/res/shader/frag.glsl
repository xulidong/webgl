precision mediump float;
uniform vec3 u_FogColor;
uniform vec2 u_FogRange;
varying vec4 v_Color;
varying float v_Dist;
void main() {
    float fogFactor = clamp((u_FogRange.y - v_Dist) / (u_FogRange.y - u_FogRange.x), 0.0, 1.0);
     vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);
    gl_FragColor = vec4(color, v_Color.a);
}