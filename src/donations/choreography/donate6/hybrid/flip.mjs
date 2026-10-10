import * as THREE from "three";

// Same curved transparent ink surface; no backing rectangle or independent copy entrances.
export function flipSurface(nickname, amount, readingTexture) {
  const front = document.createElement("canvas");
  front.width = 1200;
  front.height = 480;
  const f = front.getContext("2d");
  f.font = "950 195px VoiceGrotesk";
  f.fillStyle = "#fff";
  f.textAlign = "center";
  f.textBaseline = "middle";
  f.fillText("CO JEST?!", 600, 240);
  const back = document.createElement("canvas");
  back.width = 1200;
  back.height = 480;
  const b = back.getContext("2d");
  b.fillStyle = "#fff";
  b.textAlign = "center";
  b.textBaseline = "middle";
  let nameSize = 76;
  b.font = `800 ${nameSize}px VoiceGrotesk`;
  const long = b.measureText(nickname).width > 1100,
    chars = [...nickname],
    cut = Math.ceil(chars.length / 2);
  const lines = long ? [chars.slice(0, cut).join(""), chars.slice(cut).join("")] : [nickname];
  if (long) nameSize = 60;
  b.font = `800 ${nameSize}px VoiceGrotesk`;
  while (Math.max(...lines.map((x) => b.measureText(x).width)) > 1100 && nameSize > 38) {
    nameSize--;
    b.font = `800 ${nameSize}px VoiceGrotesk`;
  }
  lines.forEach((s, i) => {
    b.fillText(s, 600, long ? [98, 158][i] : 128);
  });
  let size = 226;
  b.font = `950 ${size}px VoiceGrotesk`;
  while (b.measureText(amount).width > 970 && size > 110) {
    size--;
    b.font = `950 ${size}px VoiceGrotesk`;
  }
  const width = b.measureText(amount).width;
  b.font = "900 88px VoiceGrotesk";
  const cw = b.measureText(" zł").width;
  b.textAlign = "left";
  b.textBaseline = "alphabetic";
  b.font = `950 ${size}px VoiceGrotesk`;
  const x = (1200 - width - cw) / 2;
  b.fillText(amount, x, 365);
  b.font = "900 88px VoiceGrotesk";
  b.fillText(" zł", x + width, 365);
  const texture = new THREE.CanvasTexture(front),
    backTexture = new THREE.CanvasTexture(back);
  texture.colorSpace = THREE.SRGBColorSpace;
  backTexture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(900, 360, 80, 8),
    original = Float32Array.from(geometry.attributes.position.array);
  const group = new THREE.Group(),
    materials = [];
  for (let i = 6; i >= 0; i--) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uFront: { value: texture },
        uBack: { value: backTexture },
        uReading: { value: backTexture },
        uReadingMix: { value: 0 },
        uColor: {
          value: new THREE.Color(i === 0 ? 0xfffaf1 : i < 3 ? 0xf33540 : 0x173fa5),
        },
        uBackColor: {
          value: new THREE.Color(i === 6 ? 0xfffaf1 : i > 3 ? 0xf33540 : 0x173fa5),
        },
      },
      transparent: true,
      side: THREE.DoubleSide,
      forceSinglePass: true,
      vertexShader:
        "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:
        "uniform sampler2D uFront;uniform sampler2D uBack;uniform sampler2D uReading;uniform float uReadingMix;uniform vec3 uColor;uniform vec3 uBackColor;varying vec2 vUv;void main(){vec4 ink=gl_FrontFacing?texture2D(uFront,vUv):texture2D(uBack,vec2(vUv.x,1.0-vUv.y));if(!gl_FrontFacing&&uReadingMix>0.0)ink=mix(ink,texture2D(uReading,vec2(vUv.x,1.0-vUv.y)),uReadingMix);if(ink.a<.3)discard;gl_FragColor=vec4(ink.rgb*(gl_FrontFacing?uColor:uBackColor),ink.a);\n#include <colorspace_fragment>\n}",
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -i * 3.4;
    group.add(mesh);
  }
  return {
    group,
    geometry,
    materials,
    texture,
    backTexture,
    width: 900,
    height: 360,
    nameTypography: {
      fontSize: (nameSize * 900) / 1200,
      lines: lines.length,
      horizontalDistortion: false,
    },
    readingMix(value) {
      for (const material of materials) {
        material.uniforms.uReading.value = value > 0 ? readingTexture : backTexture;
        material.uniforms.uReadingMix.value = value;
      }
    },
    bend(value) {
      const p = geometry.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const x = original[i],
          u = x / 900;
        p[i] = value === 0 ? x : (Math.sin(u * value * 2) * 900) / (value * 2);
        p[i + 1] = original[i + 1];
        p[i + 2] = value === 0 ? 0 : ((Math.cos(u * value * 2) - 1) * 900) / (value * 2);
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
    },
  };
}
