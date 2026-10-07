import type { AudioFeatures, EffectParameters, Motif, QualityTier } from "../types";
import { qualityBudgets } from "../quality";
import { atmosphereBinding, glintBinding, mapAudio } from "../../audio/motion/audioBindings";
import { seededRandom } from "../random";

const vertex = `#version 300 es
precision highp float;
precision highp int;
out vec2 uv;
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); uv=p; gl_Position=vec4(p*2.-1.,0.,1.); }`;
const atmosphere = `#version 300 es
precision highp float;
precision highp int;
in vec2 uv; out vec4 outColor;
uniform vec2 resolution;
uniform vec3 color; uniform vec3 secondary;
uniform float time; uniform float light; uniform float burst; uniform float tension; uniform float ring; uniform float travel;
uniform int motif;
void main(){
 vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);
 float r=length(p); float angle=atan(p.y,p.x);
 float aperture=exp(-r*r*4.5);
 float rays=motif>=4 && motif!=6 ? pow(max(0.,sin(angle*12.+time*.12)),24.)*exp(-r*2.) : 0.;
 float shockRadius=motif==6 ? length(p*vec2(.45,1.)) : r;
 float shock=exp(-pow((shockRadius-ring)*55.,2.))*burst;
 float geometry=0.;
 if(motif==0) geometry=exp(-abs(p.y)*130.)*exp(-abs(p.x)*1.6);
 if(motif==1) geometry=pow(max(0.,sin(p.x*9.+p.y*7.-travel*3.)),28.)*.12;
 if(motif==2) geometry=exp(-abs(abs(p.x)+abs(p.y)-.40-tension*.15)*90.);
 if(motif==3) geometry=exp(-abs(abs(p.x)-.25-travel*.4)*75.)*(1.-smoothstep(.25,.5,abs(p.y)));
 if(motif>=4) geometry=exp(-abs(r-(.35+tension*.08))*95.)*(.5+.5*pow(abs(sin(angle*12.)),3.));
 if(motif==6) geometry=exp(-abs(abs(p.y)-(.18+travel*.34))*95.)+exp(-abs(p.y-.065*sin(p.x*6.))*70.)*burst;
 if(motif==0) shock=exp(-abs(abs(p.y)-ring*.20)*95.)*burst;
 if(motif==2) shock=exp(-abs(abs(p.x)+abs(p.y)-ring)*80.)*burst;
 float ambient=motif<4 ? .24 : (motif==6 ? .35 : 1.);
 float a=clamp(aperture*light*ambient + rays*burst*.24 + shock*.48+geometry*light*(motif==2?2.5:1.6),0.,.62);
 vec3 c=mix(color,secondary,clamp(r+.3*sin(angle),0.,1.));
 outColor=vec4(c*a,a);
}`;
const particleVertex = `#version 300 es
precision highp float;
precision highp int;
out vec2 particleUV; out float opacity;
uniform vec2 resolution;
uniform float time; uniform float seed; uniform float burst; uniform float density; uniform int motif;
float hash(float x){return fract(sin(x*127.1+seed*311.7)*43758.5453);}
void main(){
 float id=float(gl_InstanceID); float h=hash(id+1.); float h2=hash(id+81.);
 vec2 corners[6]=vec2[6](vec2(-1.,-1.),vec2(1.,-1.),vec2(-1.,1.),vec2(-1.,1.),vec2(1.,-1.),vec2(1.,1.));
 vec2 corner=corners[gl_VertexID]; particleUV=corner;
 float angle=h*6.283185; float age=mod(time*.28+h2,1.);
 vec2 pos=vec2(cos(angle),sin(angle))*(age*.85+burst*.22);
 float size=(.002+h2*.006)*(1.+burst);
 if(motif>=5){ pos=vec2(h*2.-1.,1.2-mod(time*(.12+h2*.16)+h2*2.,2.4)); size=.007+h2*.009; }
 float spin=time*(h-.5)+h2*6.28;
 mat2 rotation=mat2(cos(spin),sin(spin),-sin(spin),cos(spin));
 vec2 offset=rotation*corner*vec2(size*(motif>=5?2.:.35),size);
 pos.x*=resolution.y/resolution.x;
 gl_Position=vec4(pos+offset,0.,1.);
 opacity=(.16+burst*.6)*(1.-smoothstep(.7,1.,age))*step(h,density);
}`;
const particleFragment = `#version 300 es
precision highp float;
precision highp int;
in vec2 particleUV; in float opacity; out vec4 outColor;
uniform vec3 color; uniform int motif;
void main(){
 float a;
 if(motif>=5){
  vec2 edge=abs(particleUV);
  float border=step(.75,max(edge.x,edge.y));
  float seal=1.-smoothstep(.13,.23,length(particleUV*vec2(1.7,1.)));
  a=(.15+border*.7+seal*.5)*opacity;
 }else a=(1.-smoothstep(.25,1.,length(particleUV)))*opacity;
 outColor=vec4(color*a,a);
}`;
const motifs: Motif[] = ["signal", "ember", "prism", "vault", "holy", "halo", "takeover", "name"];
function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

/** Two bounded draw calls; all particles derive their positions from absolute music time. */
export class OverlayRenderer {
  private gl: WebGL2RenderingContext;
  private programs: WebGLProgram[] = [];
  private shaders: WebGLShader[] = [];
  private locations = new Map<WebGLProgram, Map<string, WebGLUniformLocation>>();
  private vao: WebGLVertexArrayObject;
  private seed: number;
  private lost = false;
  private onLost: (event: Event) => void;
  constructor(
    private canvas: HTMLCanvasElement,
    private motif: Motif,
    private colors: [string, string],
    seed: string,
    private quality: QualityTier,
    onFallback: () => void,
  ) {
    this.gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!this.gl) throw new Error("WebGL2 unavailable");
    this.seed = seededRandom(seed)() * 100;
    this.onLost = (event) => {
      event.preventDefault();
      this.lost = true;
      canvas.style.visibility = "hidden";
      onFallback();
    };
    canvas.addEventListener("webglcontextlost", this.onLost);
    try {
      this.programs.push(this.program(vertex, atmosphere));
      this.programs.push(this.program(particleVertex, particleFragment));
      this.vao = this.gl.createVertexArray();
      this.gl.bindVertexArray(this.vao);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.clearColor(0, 0, 0, 0);
      this.resize();
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  private program(vs: string, fs: string): WebGLProgram {
    const gl = this.gl;
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type);
      this.shaders.push(shader);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compilation failed");
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Shader link failed: ${info}`);
    }
    return program;
  }
  private location(program: WebGLProgram, name: string): WebGLUniformLocation {
    if (!this.locations.has(program)) this.locations.set(program, new Map());
    const locations = this.locations.get(program);
    if (!locations.has(name)) locations.set(name, this.gl.getUniformLocation(program, name));
    return locations.get(name);
  }
  setQuality(quality: QualityTier): void {
    this.quality = quality;
    this.resize();
  }
  resize(): void {
    const scale = qualityBudgets[this.quality].scale;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(rect.width * scale));
    this.canvas.height = Math.max(1, Math.round(rect.height * scale));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  render(time: number, params: EffectParameters, features: AudioFeatures, intensity: number): void {
    if (this.lost || this.quality === "safe") return;
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const [index, program] of this.programs.entries()) {
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook.
      gl.useProgram(program);
      const float = (name: string, value: number) =>
        gl.uniform1f(this.location(program, name), value);
      gl.uniform2f(this.location(program, "resolution"), this.canvas.width, this.canvas.height);
      gl.uniform3fv(this.location(program, "color"), rgb(this.colors[0]));
      gl.uniform3fv(this.location(program, "secondary"), rgb(this.colors[1]));
      gl.uniform1i(this.location(program, "motif"), motifs.indexOf(this.motif));
      float("time", time);
      float("seed", this.seed);
      float(
        "light",
        params.atmosphere + mapAudio(features.loudness, atmosphereBinding) * params.atmosphere,
      );
      float("burst", params.burst);
      float("tension", params.tension);
      float("ring", params.ring);
      float("travel", params.travel);
      float(
        "density",
        (0.58 + intensity * 0.2 + mapAudio(features.brilliance, glintBinding)) *
          Math.min(1, params.atmosphere * 3 + params.burst),
      );
      if (index === 0) gl.drawArrays(gl.TRIANGLES, 0, 3);
      else
        gl.drawArraysInstanced(
          gl.TRIANGLES,
          0,
          6,
          Math.min(
            qualityBudgets[this.quality].particles,
            [70, 110, 170, 200, 260, 380, 520, 400][motifs.indexOf(this.motif)],
          ),
        );
    }
  }
  clear(): void {
    if (!this.lost) this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  dispose(): void {
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    for (const program of this.programs) this.gl.deleteProgram(program);
    for (const shader of this.shaders) this.gl.deleteShader(shader);
    if (this.vao) this.gl.deleteVertexArray(this.vao);
    this.programs = [];
    this.shaders = [];
    this.locations.clear();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
