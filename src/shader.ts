import { Renderer } from "./renderer";

export class Shader {
    private _program: GPUShaderModule | WebGLShader;

    constructor(url: RequestInfo | URL, ren: Renderer) {
        if (ren.ctx instanceof GPUCanvasContext) {
            this._program = this.loadShaderWGPU(url, ren.device);
        } else {
            this._program = this.loadShaderGL(url, ren.ctx);
        }
    }

    async loadShaderWGPU(url: RequestInfo | URL, device: GPUDevice): Promise<GPUShaderModule> {
        const response = await fetch(url);
        const source = await response.text();
        return device.createShaderModule({ code: source });
    }

    async loadShaderGL(url: RequestInfo | URL, gl: WebGL2RenderingContext | any): Promise<WebGLShader | null> {
        const response = await fetch(url);
        const source = await response.text();
        const [vertexShaderSource, fragmentShaderSource] = source.split("//Fragment shader");
        
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        let shader = gl.createProgram();

        if (shader) {
            gl.attachShader(shader, vertexShader);
            gl.attachShader(shader, fragmentShader);
            gl.linkProgram(shader);
            return shader;
        }

        return null;
    }

    get program() {
        return this._program;
    }
}