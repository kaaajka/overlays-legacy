import * as THREE from "three";
import { gsap } from "gsap";
import { headlineGeometry, oContours, treatments } from "./typography.mjs";
import { flipSurface } from "./flip.mjs";
import { createMessageChapter } from "./messageChapter.mjs";

const cream = 0xfffaf1,
  red = 0xf33540,
  blue = 0x173fa5;
const rad = Math.PI / 180;

function loftGeometry(rows = 2) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(65 * rows * 3), 3));
  const index = [];
  for (let i = 0; i < 64; i++)
    for (let j = 0; j < rows - 1; j++) {
      const a = i * rows + j,
        b = a + rows;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  geometry.setIndex(index);
  return geometry;
}

function contourInset(points, distance) {
  return points.map(([x, y], i) => {
    const before = points[(i + 63) % 64],
      after = points[(i + 1) % 64];
    const dx = after[0] - before[0],
      dy = after[1] - before[1];
    const length = Math.hypot(dx, dy);
    // Authored contours are clockwise: right-hand normal points inward.
    return [x + (dy / length) * distance, y - (dx / length) * distance];
  });
}

function sourceGeometry() {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(66 * 3), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(66 * 2), 2));
  const index = [];
  for (let i = 1; i <= 64; i++) index.push(0, i, i + 1);
  g.setIndex(index);
  return g;
}

function textSurface(
  text,
  font,
  maxWidth,
  height,
  layers = 7,
  currency = false,
  uniformFit = false,
) {
  const canvas = document.createElement("canvas");
  const c = canvas.getContext("2d");
  c.font = font;
  const digits = currency ? text.slice(0, -3) : text;
  const lines = digits.split("\n");
  const lineWidth = () => Math.max(...lines.map((line) => c.measureText(line).width));
  if (uniformFit) {
    let size = Number(font.match(/([\d.]+)px/)[1]);
    while (lineWidth() > maxWidth - 32 && size > 36) {
      size--;
      font = font.replace(/[\d.]+px/, `${size}px`);
      c.font = font;
    }
  }
  const digitWidth = lineWidth();
  c.font = "900 66px VoiceGrotesk, sans-serif";
  const measured = currency ? digitWidth + c.measureText(" zł").width : digitWidth;
  canvas.width = Math.ceil(measured + 32);
  canvas.height = height;
  c.font = font;
  c.fillStyle = "#ffffff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  if (currency) {
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
    c.fillText(digits, 16, height / 2 + 55);
    c.font = "900 66px VoiceGrotesk, sans-serif";
    c.fillText(" zł", 16 + digitWidth, height / 2 + 55);
  } else {
    lines.forEach((line, i) => {
      c.fillText(line, canvas.width / 2, height / 2 + (i - (lines.length - 1) / 2) * 50);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const width = Math.min(maxWidth, canvas.width);
  const group = new THREE.Group(),
    geometry = new THREE.PlaneGeometry(width, height, 40, 1);
  const original = Float32Array.from(geometry.attributes.position.array);
  const materials = [];
  for (let i = layers - 1; i >= 0; i--) {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: i === 0 ? cream : i < 3 ? red : blue,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      forceSinglePass: true,
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
    width,
    height,
    fontSize: Number(font.match(/([\d.]+)px/)[1]),
    horizontalDistortion: canvas.width > maxWidth,
    lines: lines.length,
    bend(value) {
      const p = geometry.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const x = original[i],
          u = x / width;
        p[i] = value === 0 ? x : (Math.sin(u * value * 2) * width) / (value * 2);
        p[i + 1] = original[i + 1];
        p[i + 2] = value === 0 ? 0 : ((Math.cos(u * value * 2) - 1) * width) / (value * 2);
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
    },
  };
}

export function buildScene(container, video, image, nickname, amount, options = {}) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: options.antialias ?? true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(1);
  renderer.setSize(1920, 1080);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39.598, 1920 / 1080, 1, 5000);
  const rig = new THREE.Group();
  scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xfffaf1, 0x23306c, 2.1));
  const light = new THREE.DirectionalLight(0xffe5db, 3.2);
  light.position.set(-350, 800, 900);
  scene.add(light);
  const sideLight = new THREE.DirectionalLight(0x9cafee, 2.2);
  sideLight.position.set(600, 100, 450);
  scene.add(sideLight);
  const face = new THREE.MeshStandardMaterial({
    color: cream,
    roughness: 0.38,
    metalness: 0.08,
  });
  const side = new THREE.MeshStandardMaterial({
    color: blue,
    roughness: 0.4,
    metalness: 0.08,
  });
  const inside = new THREE.MeshStandardMaterial({
    color: blue,
    roughness: 0.4,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const outer = new THREE.MeshStandardMaterial({
    color: blue,
    roughness: 0.4,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: cream,
    roughness: 0.38,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const candidate = "punch";
  const treatment = treatments[candidate] ? candidate : "punch";
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: treatments[treatment].outline,
  });
  function displayLetter(char) {
    const geometry = headlineGeometry(char, treatment);
    const group = new THREE.Group();
    const outline = new THREE.Mesh(geometry, outlineMaterial);
    const expansion = treatments[treatment].expansion;
    outline.scale.set(expansion, expansion, 1);
    geometry.computeBoundingBox();
    outline.position.set(
      (-geometry.boundingBox.max.x * (expansion - 1)) / 2,
      -109 * (expansion - 1),
      -3,
    );
    group.add(outline, new THREE.Mesh(geometry, [face, side]));
    return group;
  }
  const hal = new THREE.Group();
  rig.add(hal);
  for (const [char, x] of [
    ["H", 0],
    ["A", 175],
    ["L", 384],
  ]) {
    const mesh = displayLetter(char);
    mesh.position.x = x;
    hal.add(mesh);
  }
  const bang = displayLetter("!");
  rig.add(bang);
  const aperture = new THREE.Group();
  rig.add(aperture);
  const glyph = oContours(treatment);
  const frontG = loftGeometry(),
    innerG = loftGeometry(),
    outerG = loftGeometry(),
    rearG = loftGeometry(),
    keylineG = loftGeometry();
  const bevels = Array.from({ length: 4 }, () => loftGeometry(4));
  aperture.add(
    new THREE.Mesh(outerG, outer),
    new THREE.Mesh(innerG, inside),
    new THREE.Mesh(rearG, rimMaterial),
    new THREE.Mesh(keylineG, outlineMaterial),
    new THREE.Mesh(frontG, rimMaterial),
    ...bevels.map((g) => new THREE.Mesh(g, rimMaterial)),
  );
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  const imageTexture = new THREE.Texture(image);
  imageTexture.colorSpace = THREE.SRGBColorSpace;
  const sourceMaterial = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: videoTexture } },
    transparent: true,
    side: THREE.DoubleSide,
    forceSinglePass: true,
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      "uniform sampler2D uMap; varying vec2 vUv; void main(){gl_FragColor=texture2D(uMap,vUv);\n#include <colorspace_fragment>\n}",
  });
  const source = new THREE.Mesh(sourceGeometry(), sourceMaterial);
  aperture.add(source);
  const chapter = createMessageChapter(rig, options.message, nickname, amount);
  const reply = flipSurface(nickname, amount, chapter.donorTexture);
  rig.add(reply.group);
  const second = textSurface("HALO!", "950 224px VoiceGrotesk, sans-serif", 820, 280, 5);
  rig.add(second.group);
  // Children are rear-to-front: the old materials[0] coloured only the rear slab.
  second.group.children.forEach((mesh, index) => {
    const layer = second.group.children.length - 1 - index;
    mesh.material.color.set(layer === 0 ? red : blue);
    mesh.position.set(layer * 1.8, -layer * 2, -layer * 6.5);
  });
  const state = {
    alpha: 0,
    rx: 98,
    ry: 109,
    thick: 26,
    depth: treatment === "marker" ? 38 : 46,
    opening: 0,
    cameraX: 100,
    cameraY: 80,
    cameraZ: 1500,
    targetY: 0,
    replyBend: 1.1,
    valueBend: 0.75,
  };
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out", immediateRender: false },
  });
  tl.set(rig.position, { x: 80, y: 0, z: -90 }, 0);
  tl.set(rig.rotation, { z: -3 * rad }, 0);
  tl.set(rig.scale, { x: 0.85, y: 0.85, z: 0.85 }, 0);
  tl.set(hal.position, { x: -570, y: 70, z: 0 }, 0);
  tl.set(aperture.position, { x: 77, y: 179, z: treatment === "marker" ? 40.5 : 48.5 }, 0);
  tl.set(bang.position, { x: 207, y: 70, z: 0 }, 0);
  tl.set(reply.group.scale, { x: 0.01, y: 0.01, z: 0.01 }, 0);
  tl.set(reply.group.position, { x: 0, y: 115, z: -210 }, 0);
  tl.set(second.group.scale, { x: 0.01, y: 0.01, z: 0.01 }, 0);
  tl.set(second.group.position, { x: -85, y: -78, z: -120 }, 0);
  tl.to(state, { alpha: 1, duration: 0.12 }, 0.06966);
  // A single bonded word settles. The rear call indexes the same vocal space.
  tl.to(rig.position, { z: 0, duration: 0.86, ease: "power4.out" }, 0.06966);
  tl.to(rig.scale, { x: 1, y: 1, z: 1, duration: 0.86 }, 0.06966);
  tl.to(rig.rotation, { z: 0, duration: 0.86 }, 0.06966);
  tl.to(second.group.scale, { x: 1, y: 1, z: 1, duration: 0.65 }, 0.55728);
  tl.to(second.group.rotation, { z: -7 * rad, y: 12 * rad, duration: 0.65 }, 0.55728);
  tl.to(state, { cameraX: 20, cameraY: 45, duration: 1.0, ease: "power2.inOut" }, 2.11302);
  // Look into the depth of the O before opening it. No separate screen shake.
  tl.to(
    state,
    {
      cameraX: -320,
      cameraY: 165,
      targetY: 80,
      duration: 0.78,
      ease: "power2.inOut",
    },
    3.01859,
  );
  tl.to(
    state,
    {
      rx: 91,
      ry: 101.21428571428571,
      depth: 68,
      duration: 0.29,
      ease: "power2.in",
    },
    3.6,
  );
  tl.to(rig.rotation, { y: -7 * rad, z: -2 * rad, duration: 0.29, ease: "power2.in" }, 3.6);
  // The authored O and its counter continuously open into the baseline voice chamber.
  tl.to(
    state,
    {
      rx: 172,
      ry: (172 * 109) / 98,
      thick: 26,
      depth: 84,
      opening: 1,
      duration: 0.68,
      ease: "power4.out",
    },
    3.90095,
  );
  tl.to(aperture.position, { x: 45, y: 142, z: 78, duration: 0.68 }, 3.90095);
  tl.to(rig.position, { x: 0, duration: 0.68 }, 3.90095);
  tl.to(rig.rotation, { y: 0, z: 0, duration: 0.74 }, 3.90095);
  tl.to(hal.position, { x: -530, y: 115, z: -42, duration: 0.78 }, 3.90095);
  tl.to(hal.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 0.78 }, 3.90095);
  tl.to(hal.rotation, { y: 18 * rad, z: -4 * rad, duration: 0.78 }, 3.90095);
  tl.to(bang.position, { x: 245, y: 150, z: 0, duration: 0.78 }, 3.90095);
  tl.to(bang.scale, { x: 0.65, y: 0.65, z: 0.65, duration: 0.78 }, 3.90095);
  tl.to(bang.rotation, { y: -15 * rad, duration: 0.78 }, 3.90095);
  tl.to(second.group.position, { x: 45, y: 142, z: -290, duration: 0.7 }, 3.90095);
  tl.to(second.group.scale, { x: 0.44, y: 0.17, z: 0.44, duration: 0.7 }, 3.90095);
  tl.to(
    state,
    {
      cameraX: 0,
      cameraY: 50,
      targetY: 0,
      duration: 1.04,
      ease: "power2.inOut",
    },
    4.18,
  );
  // A bowed, thick reply is emitted through the actual aperture, then rolls into a broad shout.
  tl.to(
    reply.group.scale,
    { x: 0.58, y: 0.58, z: 0.58, duration: 0.24, ease: "power2.in" },
    5.01551,
  );
  tl.to(reply.group.position, { y: 215, z: 205, duration: 0.32, ease: "power2.in" }, 5.01551);
  tl.fromTo(
    reply.group.rotation,
    { x: -58 * rad, y: -15 * rad },
    { x: 0, y: 0, duration: 0.82, ease: "power3.out" },
    5.01551,
  );
  tl.to(reply.group.position, { y: 315, z: 135, duration: 0.62, ease: "power4.out" }, 5.24);
  tl.to(reply.group.scale, { x: 1.02, y: 1.02, z: 1.02, duration: 0.62, ease: "power4.out" }, 5.24);
  tl.to(
    state,
    {
      replyBend: 0.15,
      rx: 158,
      ry: (158 * 109) / 98,
      depth: 54,
      opening: 0.65,
      duration: 0.85,
      ease: "power2.inOut",
    },
    5.24,
  );
  tl.to(aperture.position, { x: 25, y: 128, duration: 0.85, ease: "power2.inOut" }, 5.24);
  tl.to(hal.position, { x: -515, y: 122, z: -50, duration: 0.85 }, 5.24);
  tl.to(hal.rotation, { y: 25 * rad, z: 0, duration: 0.85 }, 5.24);
  tl.to(bang.position, { x: 240, z: 0, duration: 0.85 }, 5.24);
  tl.to(second.group.scale, { x: 0.34, y: 0.08, z: 0.34, duration: 0.85 }, 5.24);
  tl.to(second.group.position, { x: 25, duration: 0.85 }, 5.24);
  // Only transplant: same CO surface turns over, revealing donor ink on its reverse.
  // Microphone proof used absolute5.85–6.85, local4.05–5.05 (+capture lead).
  // Here the baseline's6.57125 cue deliberately authors a new absolute flip.
  tl.to(reply.group.rotation, { x: -0.13, duration: 0.22, ease: "power2.in" }, 6.35);
  tl.to(reply.group.rotation, { x: Math.PI / 2, y: 0, duration: 0.24, ease: "power2.in" }, 6.57125);
  // Cross the edge quickly, then decelerate into a readable upright reverse.
  // The shallow back-facing pose is transit, never a low-screen holding pose.
  tl.to(reply.group.rotation, { x: Math.PI, duration: 0.26, ease: "power3.out" }, 6.81125);
  tl.to(reply.group.position, { y: -170, z: 112, duration: 0.6, ease: "power2.inOut" }, 6.57125);
  tl.to(reply.group.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power3.inOut" }, 6.57125);
  tl.to(
    state,
    {
      replyBend: 0,
      cameraY: 0,
      cameraZ: 1530,
      duration: 1.02,
      ease: "power2.inOut",
    },
    6.57125,
  );
  tl.to({}, { duration: 0.01 }, 8.7);

  function updateLoft(g, rows) {
    const p = g.attributes.position.array;
    for (let i = 0; i <= 64; i++)
      for (let j = 0; j < rows.length; j++) {
        const k = (i * rows.length + j) * 3;
        p[k] = rows[j].points[i][0];
        p[k + 1] = rows[j].points[i][1];
        p[k + 2] = rows[j].z;
      }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    g.computeBoundingBox();
  }
  function render(mediaState) {
    const { rx, ry, depth, opening } = state;
    const scaled = (points) => points.map(([x, y]) => [(x * rx) / 98, (y * ry) / 109]);
    const outerPoints = scaled(glyph.outer),
      counter = scaled(glyph.inner);
    // The counter breathes along its own normals; it never morphs into the outer boundary.
    // Uniform scaling preserves the O's accepted optical proportions throughout the shot.
    const innerPoints = contourInset(counter, -26 * opening);
    const rearScale = 1 - 0.035 * opening;
    const rearOuter = outerPoints.map(([x, y]) => [x * rearScale, y * rearScale]);
    const rearInner = innerPoints.map(([x, y]) => [x * rearScale, y * rearScale]);
    const frontOuter = contourInset(outerPoints, 2.5),
      frontInner = contourInset(innerPoints, -2.5);
    const rearOuterFace = contourInset(rearOuter, 2.5),
      rearInnerFace = contourInset(rearInner, -2.5);
    updateLoft(frontG, [
      { points: frontOuter, z: 0 },
      { points: frontInner, z: 0 },
    ]);
    updateLoft(outerG, [
      { points: outerPoints, z: -2.5 },
      { points: rearOuter, z: -depth - 2.5 },
    ]);
    updateLoft(innerG, [
      { points: innerPoints, z: -2.5 },
      { points: rearInner, z: -depth - 2.5 },
    ]);
    updateLoft(rearG, [
      { points: rearOuterFace, z: -depth - 5 },
      { points: rearInnerFace, z: -depth - 5 },
    ]);
    const expansion = treatments[treatment].expansion;
    updateLoft(keylineG, [
      {
        points: outerPoints.map(([x, y]) => [x * expansion, y * expansion]),
        z: -3,
      },
      {
        points: innerPoints.map(([x, y]) => [x * expansion, y * expansion]),
        z: -3,
      },
    ]);
    for (let side = 0; side < 4; side++) {
      const rear = side >= 2,
        inner = side % 2;
      const contour = rear ? (inner ? rearInner : rearOuter) : inner ? innerPoints : outerPoints;
      const rows = Array.from({ length: 4 }, (_, i) => {
        const angle = ((i / 3) * Math.PI) / 2;
        return {
          points: contourInset(contour, (inner ? -1 : 1) * 2.5 * Math.cos(angle)),
          z: rear ? -depth - 5 + 2.5 * Math.sin(angle) : -2.5 * Math.sin(angle),
        };
      });
      updateLoft(bevels[side], rows);
    }
    inside.color.copy(side.color).lerp(new THREE.Color(red), opening * 0.18);
    const p = source.geometry.attributes.position.array,
      uv = source.geometry.attributes.uv.array;
    const extent = Math.max(...rearInner.flat().map(Math.abs));
    p[0] = 0;
    p[1] = 0;
    p[2] = 0;
    uv[0] = 0.5;
    uv[1] = 0.5;
    rearInner.forEach(([x, y], i) => {
      const vertex = i + 1;
      p[vertex * 3] = x;
      p[vertex * 3 + 1] = y;
      p[vertex * 3 + 2] = 0;
      uv[vertex * 2] = x / (extent * 2) + 0.5;
      uv[vertex * 2 + 1] = y / (extent * 2) + 0.5;
    });
    source.geometry.attributes.position.needsUpdate = true;
    source.geometry.attributes.uv.needsUpdate = true;
    source.geometry.computeBoundingSphere();
    source.geometry.computeBoundingBox();
    source.position.z = -depth - 4.5;
    if (mediaState !== "ready") {
      imageTexture.needsUpdate = true;
      sourceMaterial.uniforms.uMap.value = imageTexture;
    } else {
      videoTexture.needsUpdate = true;
      sourceMaterial.uniforms.uMap.value = videoTexture;
    }
    rig.visible = state.alpha > 0.001;
    reply.bend(state.replyBend);
    reply.readingMix(chapter.state.donorMix);
    camera.position.set(state.cameraX, state.cameraY, state.cameraZ);
    camera.lookAt(0, state.targetY, 0);
    renderer.render(scene, camera);
  }
  const project = new THREE.Vector3();
  function bounds(object) {
    object.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(object),
      points = [];
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) {
          project.set(x, y, z).project(camera);
          points.push([(project.x + 1) * 960, (1 - project.y) * 540]);
        }
    return {
      left: Math.min(...points.map((p) => p[0])),
      right: Math.max(...points.map((p) => p[0])),
      top: Math.min(...points.map((p) => p[1])),
      bottom: Math.max(...points.map((p) => p[1])),
    };
  }
  function snapshot() {
    const readingType = chapter.snapshot();
    const projectedTypeHeight = (object, height) => {
      object.updateWorldMatrix(true, false);
      const a = new THREE.Vector3(0, 0, 0).applyMatrix4(object.matrixWorld).project(camera);
      const b = new THREE.Vector3(0, height, 0).applyMatrix4(object.matrixWorld).project(camera);
      return Math.abs(b.y - a.y) * 540;
    };
    return {
      state: Object.fromEntries(Object.entries(state).filter(([, v]) => typeof v === "number")),
      rig: rig.visible,
      objects: [rig, hal, aperture, bang, reply.group, second.group].map((o) => ({
        position: o.position.toArray(),
        rotation: o.rotation.toArray().slice(0, 3),
        scale: o.scale.toArray(),
      })),
      bounds: {
        donorFlip: bounds(reply.group),
        reply: bounds(reply.group),
        aperture: bounds(aperture),
        message: bounds(chapter.group),
      },
      nameTypography: reply.nameTypography,
      typography: treatments[treatment].name,
      oGlyph: {
        construction: "PUNCH authored cubic outer and counter",
        capHeight: 218,
        width: 196,
        bevel: 2.5,
        bevelSegments: 3,
        initialDepth: treatment === "marker" ? 38 : 46,
        opening: state.opening,
        counterExpansion: 26 * state.opening,
        aspectRatio: state.rx / state.ry,
      },
      baseline: "donate6-a-execution/final/concept-A-execution-1x.mp4",
      renderInfo: {
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        calls: renderer.info.render.calls,
      },
      contextLost: renderer.getContext().isContextLost(),
      messageChapter: readingType,
      readingTypePixels1080: {
        message: projectedTypeHeight(chapter.group, readingType.fontSizeWorld),
        nickname: projectedTypeHeight(reply.group, readingType.donorNameSizeWorld),
        amount: projectedTypeHeight(reply.group, readingType.donorAmountSizeWorld),
      },
    };
  }
  function dispose() {
    tl.kill();
    chapter.dispose();
    const geometries = new Set(),
      materials = new Set();
    scene.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material)
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m);
    });
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    for (const t of [videoTexture, imageTexture, reply.texture, reply.backTexture, second.texture])
      t.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }
  // Compile the actual materials before the audio-driven first visible frame.
  // This does not sample a pose, draw pixels, or create an animation loop.
  renderer.compile(scene, camera);
  return {
    timeline: tl,
    render,
    snapshot,
    dispose,
    renderer,
    state,
    chapter,
    objects: { rig, hal, aperture, bang, reply: reply.group, second: second.group },
    title: "A hybrid polish — typographic O, red/blue call, upright donor flip",
  };
}
