// Iridescent glass blob (raymarched deformed torus) rendered to an offscreen WebGL canvas.
window.Blob3D = (function () {
  const S = 900;
  const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const gl = cv.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, alpha: true });
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;
uniform float T;uniform float M;uniform vec2 R;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
float map(vec3 p){
  p.yz*=rot(1.05+0.12*sin(T*0.7));p.xz*=rot(T*0.55+0.6);p.xy*=rot(0.35+0.1*sin(T*0.5));
  vec3 q=p;
  q+=0.13*sin(2.6*q.yzx+vec3(T*1.3,T*0.9,T*1.1))*M;
  float minor=0.42+0.12*sin(atan(q.z,q.x)*2.0+T*1.2)*M;
  float d=sdTorus(q,vec2(0.92,minor));
  return d*0.7;
}
vec3 nor(vec3 p){vec2 e=vec2(0.0015,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
vec3 pal(float x){
  // mint / aqua / blue / soft gold / white thin-film palette
  vec3 a=vec3(0.62,0.5,0.55),b=vec3(0.48,0.5,0.45),c=vec3(1.0,1.0,1.0),d=vec3(0.0,0.1,0.3);
  return clamp(a+b*cos(6.28318*(c*x+d)),0.,1.);
}
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*R)/R.y;
  vec3 ro=vec3(0.,0.,5.6),rd=normalize(vec3(uv,-1.55));
  float t=0.;float d;bool hit=false;
  for(int i=0;i<110;i++){d=map(ro+rd*t);if(d<0.0007){hit=true;break;}t+=d;if(t>7.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t;vec3 n=nor(p);vec3 r=reflect(rd,n);
  float fr=pow(1.-max(dot(n,-rd),0.),1.6);
  float film=dot(n,vec3(0.35,0.55,0.75))*0.9+fr*1.1+r.y*0.35+T*0.06;
  vec3 iri=pal(film);
  float band=smoothstep(-0.25,0.15,r.y)*0.75+0.25;
  float dark=smoothstep(0.55,0.05,fr)*smoothstep(0.2,-0.4,r.x+r.y*0.5);
  vec3 col=mix(iri*band,vec3(0.02,0.03,0.07),dark*0.85);
  vec3 L=normalize(vec3(-0.5,0.8,0.6));
  float sp=pow(max(dot(r,L),0.),28.)*1.4+pow(max(dot(r,normalize(vec3(0.7,-0.2,0.7))),0.),60.)*0.8;
  col+=vec3(1.)*sp;
  col+=pal(film+0.3)*fr*0.55;
  gl_FragColor=vec4(col,1.);
}`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.log('SH', gl.getShaderInfoLog(o)); return o; }
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uT = gl.getUniformLocation(pr, 'T'), uM = gl.getUniformLocation(pr, 'M'), uR = gl.getUniformLocation(pr, 'R');
  return {
    canvas: cv,
    render(t, morph) { gl.viewport(0, 0, S, S); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(uT, t); gl.uniform1f(uM, morph); gl.uniform2f(uR, S, S); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); return cv; },
  };
})();
