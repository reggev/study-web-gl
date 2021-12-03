import './index.scss'
import vertexShaderCode from './vertex-shader.glsl'
import fragmentShaderCode from './fragment-shader.glsl'
import {glMatrix, mat4} from 'gl-matrix'
import {makeCanvas} from './make-canvas'
import {loadImage} from './load-img'
import createTexture from 'assets/crate.jpg'

const {canvas, gl, makeShader, makeProgram} = makeCanvas()
const img = loadImage(createTexture)

document.body.appendChild(canvas)

const vertexShader = makeShader('vertexShader', gl.VERTEX_SHADER, vertexShaderCode)
const fragmentShader = makeShader('fragmentShader', gl.FRAGMENT_SHADER, fragmentShaderCode)
const program = makeProgram(vertexShader, fragmentShader)
const boxVertices = [
  // [x, y, z, u, v]
  // TOP
  [-1.0, 1.0, -1.0, 0, 0],
  [-1.0, 1.0, 1.0, 0, 1],
  [1.0, 1.0, 1.0, 1, 1],
  [1.0, 1.0, -1.0, 1, 0],
  // LEFT
  [-1.0, 1.0, 1.0, 0, 0],
  [-1.0, -1.0, 1.0, 1, 0],
  [-1.0, -1.0, -1.0, 1, 1],
  [-1.0, 1.0, -1.0, 0, 1],
  // RIGHT
  [1.0, 1.0, 1.0, 1, 1],
  [1.0, -1.0, 1.0, 0, 1],
  [1.0, -1.0, -1.0, 0, 0],
  [1.0, 1.0, -1.0, 1, 0],
  // FRONT
  [1.0, 1.0, 1.0, 1, 1],
  [1.0, -1.0, 1.0, 1, 0],
  [-1.0, -1.0, 1.0, 0, 0],
  [-1.0, 1.0, 1.0, 0, 1],
  // BACK
  [1.0, 1.0, -1.0, 0, 0],
  [1.0, -1.0, -1.0, 0, 1],
  [-1.0, -1.0, -1.0, 1, 1],
  [-1.0, 1.0, -1.0, 1, 0],
  // BOTTOM
  [-1.0, -1.0, -1.0, 1, 1],
  [-1.0, -1.0, 1.0, 1, 0],
  [1.0, -1.0, 1.0, 0, 0],
  [1.0, -1.0, -1.0, 0, 1],
].flat()

const boxIndices = [
  // Top
  [0, 1, 2],
  [0, 2, 3],
  // Left
  [5, 4, 6],
  [6, 4, 7],
  // Right
  [8, 9, 10],
  [8, 10, 11],
  // Front
  [13, 12, 14],
  [15, 14, 12],
  // Back
  [16, 17, 18],
  [16, 18, 19],
  // Bottom
  [20, 21, 22],
  [22, 20, 23],
].flat()

const vertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW)

const indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW)

const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(
  positionAttribLocation,
  3,
  gl.FLOAT,
  false,
  5 * Float32Array.BYTES_PER_ELEMENT,
  0,
)

const textureCoordinatesAttribLocation = gl.getAttribLocation(program, 'vectTextureCoordinates')
gl.vertexAttribPointer(
  textureCoordinatesAttribLocation,
  2,
  gl.FLOAT,
  false,
  5 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT,
)

gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.enable(gl.CW)
gl.enableVertexAttribArray(positionAttribLocation)
gl.enableVertexAttribArray(textureCoordinatesAttribLocation)

const boxTexture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, boxTexture)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
gl.bindTexture(gl.TEXTURE_2D, null)

gl.useProgram(program)

const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
const matViewUniformLocation = gl.getUniformLocation(program, 'mView')
const matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

const worldMatrix = new Float32Array(16)
const viewMatrix = new Float32Array(16)
const projectionMatrix = new Float32Array(16)
mat4.identity(worldMatrix)
mat4.lookAt(viewMatrix, [0, 10, -10], [0, 0, 0], [0, 1, 0])
mat4.perspective(projectionMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0)

gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
gl.uniformMatrix4fv(matProjUniformLocation, false, projectionMatrix)

let angle = 0
const identityMatrix = new Float32Array(16)
mat4.identity(identityMatrix)

function renderLoop() {
  gl.clearColor(0.75, 0.85, 0.8, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  angle = (performance.now() / 1000 / 6) * 2 * Math.PI
  mat4.rotate(worldMatrix, identityMatrix, angle, [0.5, 1, 0])
  gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
  gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0)
  gl.bindTexture(gl.TEXTURE_2D, boxTexture)
  gl.activeTexture(gl.TEXTURE0)
  requestAnimationFrame(renderLoop)
}
requestAnimationFrame(renderLoop)
