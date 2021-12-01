export function makeCanvas({width = 500, height = 500} = {}) {
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

  function makeShader(shaderName: string, shaderType: number, source: string) {
    const shader = gl.createShader(shaderType) as WebGLShader
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(
        `${shaderName} compilation error: ${gl.getShaderInfoLog(shader)}` ??
          'error compiling shader',
      )
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
