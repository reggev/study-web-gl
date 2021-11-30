import './index.scss'
import vertexShaderCode from './vertex-shader.glsl'
import fragmentShaderCode from './fragment-shader.glsl'
import {glMatrix, mat4} from 'gl-matrix'

function makeCanvas({width = 500, height = 500} = {}) {
  const {canvas, gl} = (() => {
    const _canvas = document.createElement('canvas')
    _canvas.width = width
    _canvas.height = height
    _canvas.setAttribute('id', 'canvas')
    const _gl = _canvas.getContext('webgl2')
    if (!_gl) {
      throw new Error('Could not get context')
    }
    return {gl: _gl, canvas: _canvas}
  })()

  function makeShader(shaderType: number, source: string) {
    const shader = gl.createShader(shaderType) as WebGLShader
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? 'error compiling shader')
    }
    return shader
  }

  function makeProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram() as WebGLProgram
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'error linking program')
    }
    gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'error validating program')
    }
    return program
  }

  return {canvas, gl, makeShader, makeProgram}
}

const {canvas, gl, makeShader, makeProgram} = makeCanvas()
document.body.appendChild(canvas)

const vertexShader = makeShader(gl.VERTEX_SHADER, vertexShaderCode)
const fragmentShader = makeShader(gl.FRAGMENT_SHADER, fragmentShaderCode)
const program = makeProgram(vertexShader, fragmentShader)
const triangleVertices = [
  // [x, y,z,  r, g, b]
  [0.0, 0.5, 0.0, 1.0, 1.0, 0.0],
  [-0.5, -0.5, 0.0, 0.7, 0.0, 1.0],
  [0.5, -0.5, 0.0, 0.1, 1.0, 0.6],
].flat()

const vertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(
  positionAttribLocation,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  0,
)

const colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
gl.vertexAttribPointer(
  colorAttribLocation,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT,
)

gl.enableVertexAttribArray(positionAttribLocation)
gl.enableVertexAttribArray(colorAttribLocation)
gl.useProgram(program)

const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
const matViewUniformLocation = gl.getUniformLocation(program, 'mView')
const matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

const worldMatrix = new Float32Array(16)
const viewMatrix = new Float32Array(16)
const projectionMatrix = new Float32Array(16)
mat4.identity(worldMatrix)
mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0])
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
  mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0])
  gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  requestAnimationFrame(renderLoop)
}
requestAnimationFrame(renderLoop)
