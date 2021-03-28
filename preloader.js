const canvas = document.querySelector("#canvasPreLoader");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl");
/*========================= SHADERS ========================= */
/*jshint multistr: true */
const shader_vertex_source = `
attribute vec2 position; 
attribute vec3 color;  

varying vec3 vColor;
void main(void) { 
gl_Position = vec4(position, 0., 1.); 
vColor=color;
}`;

const shader_fragment_source = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
float PI = 3.14159;


vec2 center = u_resolution * 0.5;
float radius = min(u_resolution.x, u_resolution.y) * .2;

float circle(vec2 coord, vec2 center, float radius) {
  float distanceToCenter = distance(coord, center);
  return smoothstep(distanceToCenter - 2.,distanceToCenter, radius);
}

bool isAngleBetween(float target, float angle1, float angle2) {
  float startAngle = min(angle1, angle2);
  float endAngle = max(angle1, angle2);

  if (endAngle - startAngle < 0.1) {
    return false;
  }

  target = mod((360. + (mod(target, 360.))), 360.);
  startAngle = mod((3600000. + startAngle), 360.);
  endAngle = mod((3600000. + endAngle), 360.);

  if (startAngle < endAngle) return startAngle <= target && target <= endAngle;
  return startAngle <= target || target <= endAngle;
}

float sector(vec2 coord, vec2 center, float startAngle, float endAngle) {
  vec2 uvToCenter = coord - center;
  float angle = degrees(atan(uvToCenter.y, uvToCenter.x));
  if (isAngleBetween(angle, startAngle, endAngle)) {
    return 1.0;
  } else {
    return 0.;
  }
}

float arc(vec2 uv, vec2 center, float startAngle, float endAngle, float innerRadius, float outerRadius) {
  float result = 0.0;
  result = sector(uv, center, startAngle, endAngle) * circle(uv, center, outerRadius) * (1.0 - circle(uv, center, innerRadius));
  return result;
}



varying vec3 vColor;
void main(void) {

  vec2 coord = vec2(gl_FragCoord);
  float width = 10.;
  
  vec4 orangeColor = vec4(1.0,0.5,0.1,1.0);
  vec4 blueColor = vec4(0.2,0.5,1.0,1.0);

  float halfPI = PI * .5;
  float periodicTime = mod(u_time *0.001, PI) - halfPI;

  float outerRadius = min(u_resolution.x, u_resolution.y) * .15;
 
  float innerRadius = outerRadius - width;
  float innerRadius2 = outerRadius - width + 10.0;
  
  float startX = clamp(periodicTime, -halfPI, 0.);
  float endX = clamp(periodicTime, 0., halfPI);


  float angleVariation = sin(startX) + 1.;
  float endAngleVariation = sin(endX); 

  float angleVariation2 = sin(startX) + 1.;
  float endAngleVariation2 = sin(endX); 

  
  
  float rotation = 180. * (sin(periodicTime) + 1.);

  float startAngle = 360. * angleVariation + rotation - 90.;
  float endAngle = 360. * endAngleVariation + rotation - 90.;

  float startAngle2 = 360. * angleVariation2  + rotation - 85.;
  float endAngle2 = 360. * endAngleVariation2  + rotation - 85.;

  
  float isFilled_orangeColor = arc(coord, center, - startAngle, - endAngle, innerRadius, outerRadius);
  float isFilled_blueColor = arc(coord, center, - startAngle2 , - endAngle2 , innerRadius -11., outerRadius -9.);


  vec4 blueColorBackground = isFilled_blueColor * blueColor;
  vec4 orangeColorBackground = isFilled_orangeColor * orangeColor;
  float color = step(isFilled_orangeColor, isFilled_blueColor);  

  gl_FragColor = vec4( (1.- color) * orangeColorBackground + color * blueColorBackground);
}`;

const get_shader = function(source, type, typeString) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "ERROR IN " + typeString + " SHADER : " + gl.getShaderInfoLog(shader)
    );
    return false;
  }
  return shader;
};

const shader_vertex = get_shader(
  shader_vertex_source,
  gl.VERTEX_SHADER,
  "VERTEX"
);

const shader_fragment = get_shader(
  shader_fragment_source,
  gl.FRAGMENT_SHADER,
  "FRAGMENT"
);

const SHADER_PROGRAM = gl.createProgram();
gl.attachShader(SHADER_PROGRAM, shader_vertex);
gl.attachShader(SHADER_PROGRAM, shader_fragment);

gl.linkProgram(SHADER_PROGRAM);

const _color = gl.getAttribLocation(SHADER_PROGRAM, "color");
const _position = gl.getAttribLocation(SHADER_PROGRAM, "position");
const u_resolution = gl.getUniformLocation(SHADER_PROGRAM, "u_resolution");
const u_time = gl.getUniformLocation(SHADER_PROGRAM, "u_time");

gl.enableVertexAttribArray(_color);
gl.enableVertexAttribArray(_position);

gl.useProgram(SHADER_PROGRAM);

/*========================= THE TRIANglE ========================= */
//POINTS :
const triangle_vertex = [
  -1,
  -1, //first corner: -> bottom left of the viewport
  0,
  0,
  1,
  1,
  -1, //bottom right of the viewport
  1,
  1,
  0,
  1,
  1, //top right of the viewport
  1,
  0,
  0,
  -1,
  1,
  0,
  0,
  0
];

const TRIANGLE_VERTEX = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(triangle_vertex),
  gl.STATIC_DRAW
);

//FACES :
const triangle_faces = [0, 1, 3, 2];
const TRIANGLE_FACES = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(triangle_faces),
  gl.STATIC_DRAW
);

/*========================= DRAWING ========================= */
gl.clearColor(0.0, 0.0, 0.0, 0.0);
gl.uniform2f(u_resolution, canvas.width, canvas.height);
// let time = new Date();

// console.log(time.getTime());

//gl.uniform1f(u_time, time.getTime());
let time_old = 0;
const animate = function(time) {
  //let dt = time - time_old;
  gl.uniform1f(u_time, time);
  time_old = time;

  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);

  gl.vertexAttribPointer(_position, 2, gl.FLOAT, false, 4 * (2 + 3), 0);
  gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 4 * (2 + 3), 2 * 4);

  //console.log(new Date().getTime());
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
  gl.flush();

  window.requestAnimationFrame(animate);
};

animate(0);
