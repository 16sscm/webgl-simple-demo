// HelloQuad.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position =  u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
  var ANGLE_STEP = 45.0;
var vertexs=[];//顶点数组
var triangles=[]//三角形数组
var canvassize=[canvasSize.maxY,canvasSize.maxX]//canvas大小
var clickVertexNum=10;//一个用来判断点击位置的
var bValue=true;//判断是不是要画边框
var tValue=true;//判断是不是按t
var rotateStatue=false;//判断是不是在旋转
//四边形变成三角形
var polygons=[polygon[0][0],polygon[0][1],polygon[0][3],polygon[0][1],polygon[0][2],polygon[0][3],
polygon[1][0],polygon[1][1],polygon[1][3],polygon[1][1],polygon[1][2],polygon[1][3],
polygon[2][0],polygon[2][1],polygon[2][3],polygon[2][1],polygon[2][2],polygon[2][3],
polygon[3][0],polygon[3][1],polygon[3][3],polygon[3][1],polygon[3][2],polygon[3][3],]
//设置三角形点信息
function setTrianglesVertex(){
for(let i=0;i<polygons.length;i++){
triangles.push(vertexs[2*polygons[i]]);
triangles.push(vertexs[2*polygons[i]+1]);
triangles.push(vertex_color[polygons[i]][0]/255);
triangles.push(vertex_color[polygons[i]][1]/255);
triangles.push(vertex_color[polygons[i]][2]/255);
}
}
//设置边框点信息
function setLine(){
for(let i=0;i<polygons.length;i++){
triangles.push(vertexs[2*polygons[i]]);
triangles.push(vertexs[2*polygons[i]+1]);
triangles.push(1);
triangles.push(0);
triangles.push(0);
}
}
var gl;//webgl
var canvas;//canvas
//监听鼠标
document.addEventListener("mousedown", down);
document.addEventListener("mouseup", up);
document.addEventListener("mousemove", move);
//获取鼠标位置
function getPosition(mouseEvent, canvas) {
    let x, y;
    if (mouseEvent.pageX !== undefined && mouseEvent.pageY !== undefined) {
        x = mouseEvent.pageX;
        y = mouseEvent.pageY;
    } else {
        x = canvas.offsetLeft;
        y = canvas.offsetTop;
    }
console.log({x:x,y:y})
    return {x: x - canvas.offsetLeft, y: y - canvas.offsetTop};

}
//按下鼠标，判断被点击的是哪个点
function getDistance(i, point1) {
    let distance = 1000;
    if ( point1 instanceof Object) {
        let dx = point1.x - vertex_pos[i][0], dy = point1.y - vertex_pos[i][1];
        distance = dx * dx + dy * dy;
        console.log(distance);
    }
    return distance <= 100 ? 1 : -1;
}
//click
function down(e) {
    clickedPoint = getPosition(e, canvas);
    for (let i = 0; i < 9; i++) {
        if (getDistance(i, clickedPoint) > 0) {
            console.log(i);
            clickVertexNum = i;
            return;
        }
    }
    clickVertexNum = 10;
}
//移开鼠标
function up(e) {
    clickVertexNum = 10;
}
//move mouse
function move(e) {

    if (clickVertexNum < 9) {
        let location = getPosition(e, canvas);
        //边界判断,尽量保证在canvas里面

        if (location.x >= 10 && location.x <= canvassize[0] - 10 && location.y >= 10 && location.y <= canvassize[1] - 10) {
           vertex_pos[clickVertexNum][0]=location.x;
           vertex_pos[clickVertexNum][1]=location.y;
           console.log("move")
           vertexs=[];
           triangles=[];
           setVertexs();
           setTrianglesVertex();
           setLine();
           drawTriangle()
        }

    }
}
//加载canvas执行方法
function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  canvas.height=canvassize[0];
  console.log(canvassize[0])
  canvas.width=canvassize[1];
  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  setVertexs();
  setTrianglesVertex();
  setLine();
  drawTriangle();

}
//set vertex
function setVertexs(){
  for(let i=0;i<vertex_pos.length;i++){

     vertexs.push(2*vertex_pos[i][0]/canvassize[0]-1);
     vertexs.push(1-2*vertex_pos[i][1]/canvassize[1]);

  }
 }
var tick;//tick method declaration
var stop;//用来停止动画的变量
var u_ModelMatrix;//model矩阵
var currentAngle;//旋转角度
var modelMatrix;//我的矩阵
function drawTriangle(){

  // Draw the rectangle


    // Write the positions of vertices to a vertex shader
    var n = initVertexBuffers(gl);

    if (n < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }
     u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
     }

    // Current rotation angle
    currentAngle = 0.0;
    // Model matrix
    modelMatrix = new Matrix4()

    //   Start drawing
    tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle

        draw(currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
        stop=requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
     };
    gl.clearColor(0, 0, 0, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    //画初始图形
    draw();



}


//画三角形
function drawTriangles(){

    for(let i=0;i<8;i++){
        // console.log("vvv");
        gl.drawArrays(gl.TRIANGLES, i*3, 3);
    }
}
//画边框
function drawLine(){
    for(let i=0;i<8;i++){
    gl.drawArrays(gl.LINE_LOOP,24+i*3,3)
  }
}
//键盘事件监听
document.onkeydown=function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode==84){ // 按 t
                 if(tValue){
                   tick();
                   tValue=false}
                   else {
                   window.cancelAnimationFrame(stop);
                   tValue=true;
                   rotateStatue=false;
                   }
              }
            if(e && e.keyCode==69){ // 按 e
                  if(!tValue) {
                    window.cancelAnimationFrame(stop);
                  }
                  gl.clear(gl.COLOR_BUFFER_BIT);
                  sXY=1;
                  currentAngle=0;
                  modelMatrix=new Matrix4();
                  draw();
                  tValue=true;
                  rotateStatue=false;
                  }
            if(e && e.keyCode==66){ // b key
               // Clear <canvas>
                   if(bValue){
                     gl.clearColor(0, 0, 0, 1);
                   gl.clear(gl.COLOR_BUFFER_BIT);
                   drawTriangles();
                   bValue=false}
                   else {
                   gl.clearColor(0, 0, 0, 1);
                      gl.clear(gl.COLOR_BUFFER_BIT);
                         drawTriangles();
                   drawLine();
                   bValue=true;
                   }


         }
        };

//绘制函数
function draw() {
  // Set the rotation matrix
  modelMatrix.setRotate(currentAngle, 0, 0, 1);
  modelMatrix.scale(sXY,sXY,1)
  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  drawTriangles();
  drawLine();
}

// Last time that this function was called
var sXY=1;//改变scale
var scaleBig=false;//控制变大还是变小
var g_last = Date.now();
//动态改变值
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  if(!rotateStatue){
  g_last=now;
  rotateStatue=true;
  }
  var elapsed = now - g_last;
  g_last = now;
  //按文档要求，每秒0.2，最小0.2
  if(scaleBig){
  sXY=sXY+0.2*(2*elapsed)/1000;
  if(sXY>=1)scaleBig=false;
  }
  else {
  sXY-=0.2*(2*elapsed)/1000;
  if(sXY<=0.2)scaleBig=true}
  sXY%=8;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
//初始化顶点buffer
function initVertexBuffers(gl) {
  var vertices = new Float32Array(triangles);
console.log(vertices)
var FSIZE = vertices.BYTES_PER_ELEMENT;
  var n = 48; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);



  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
 // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);
  return n;
}
