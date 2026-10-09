import { Filter, GlProgram } from "pixi.js";
import "pixi.js/filters";

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
void main() {
  vec2 p = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  p.x = p.x * (2.0 / uOutputTexture.x) - 1.0;
  p.y = p.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  gl_Position = vec4(p, 0.0, 1.0);
  vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}`;

/** Chapter-specific fold matte. It never changes sprite poses or original currency colors.
 * Premultiplied RGB/alpha close around the same held seam as the DOM paper cutouts.
 */
const fragment = `
precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform float uFold;
void main() {
  vec2 stage = vTextureCoord * uInputSize.xy / uOutputFrame.zw;
  float seam = 0.574 + sin(stage.x * 6.2831853) * 0.009 * uFold;
  float opening = mix(1.1, 0.026, uFold);
  float feather = mix(0.09, 0.022, uFold);
  float matte = 1.0 - smoothstep(opening, opening + feather, abs(stage.y - seam));
  finalColor = texture(uTexture, vTextureCoord) * matte;
}`;

export class PaperGateFilter extends Filter {
  constructor() {
    super({
      glProgram: GlProgram.from({ vertex, fragment, name: "donate7-paper-fold-matte" }),
      resources: { foldUniforms: { uFold: { value: 0, type: "f32" } } },
      resolution: "inherit",
      padding: 0,
    });
  }
  set fold(value: number) {
    this.resources.foldUniforms.uniforms.uFold = value;
  }
}
