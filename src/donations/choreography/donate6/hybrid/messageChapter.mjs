import * as THREE from "three";

// Comic speech grown out of the donor's blue extrusion. No independent clock.
export function createMessageChapter(rig, message, nickname, amount) {
  const state = { open: 0, donorMix: 0 };
  const group = new THREE.Group();
  group.visible = false;
  group.position.set(120, -225, -460);
  rig.add(group);
  const shape = new THREE.Shape();
  // A shallow folded ribbon, with a small return pointing to the SAME reaction O.
  // Three lines/page give gameplay back without shrinking the reading type.
  shape.moveTo(-350, 96);
  shape.bezierCurveTo(-373, 94, -377, 65, -376, 41);
  shape.bezierCurveTo(-389, 41, -405, 54, -415, 69);
  shape.bezierCurveTo(-419, 34, -405, 5, -375, 3);
  shape.bezierCurveTo(-377, -72, -361, -94, -317, -96);
  shape.bezierCurveTo(-120, -104, 174, -96, 330, -94);
  shape.bezierCurveTo(364, -93, 373, -66, 374, -20);
  shape.bezierCurveTo(375, 28, 365, 80, 341, 91);
  shape.bezierCurveTo(194, 99, -158, 104, -350, 96);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 18,
    bevelEnabled: true,
    bevelSize: 5,
    bevelThickness: 4,
    bevelSegments: 3,
    curveSegments: 20,
  });
  const face = new THREE.MeshStandardMaterial({
    color: 0xfffaf1,
    roughness: 0.38,
    metalness: 0.08,
  });
  const side = new THREE.MeshStandardMaterial({ color: 0x173fa5, roughness: 0.4, metalness: 0.08 });
  group.add(new THREE.Mesh(geometry, [face, side]));
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 660;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const inkGeometry = new THREE.PlaneGeometry(690, 222, 50, 8);
  const inkMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  inkGeometry.translate(0, 0, 23);
  const ink = new THREE.Mesh(inkGeometry, inkMaterial);
  group.add(ink);
  const originals = new Map(
    [geometry, inkGeometry].map((g) => [g, Float32Array.from(g.attributes.position.array)]),
  );
  const text = message || "Dzięki za wsparcie!";
  ctx.font = "650 114px VoiceGrotesk";
  // Preserve every code point and explicit newline. Hard-wrap unbroken tokens too.
  const lines = [];
  let line = "";
  for (const char of [...text]) {
    if (char === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    if (ctx.measureText(line + char).width > 1840 && line) {
      const split = line.lastIndexOf(" ");
      if (split > 0) {
        lines.push(line.slice(0, split + 1));
        line = line.slice(split + 1);
      } else {
        lines.push(line);
        line = "";
      }
    }
    line += char;
  }
  lines.push(line);
  const pages = [];
  for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
  const weights = pages.map((p) => Math.max(1, p.join("").length));
  const total = weights.reduce((a, b) => a + b, 0);
  let page = -1,
    disposed = false,
    lastOpen;
  function update(elapsed, reading, window) {
    group.visible = state.open > 0.00001;
    const start = window?.start ?? 0;
    const duration = Math.max(0.01, window?.duration ?? reading);
    const fraction = Math.max(0, Math.min(1, (elapsed - start) / duration));
    let index = 0,
      weight = 0;
    while (index < pages.length - 1 && fraction >= (weight + weights[index]) / total) {
      weight += weights[index++];
    }
    if (index !== page) {
      page = index;
      ctx.clearRect(0, 0, 2048, 660);
      ctx.fillStyle = "#142b68";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.font = "650 114px VoiceGrotesk";
      pages[page].forEach((s, i) => {
        ctx.fillText(s, 90, 196 + i * 148);
      });
      if (pages.length > 1) {
        ctx.font = "750 36px VoiceGrotesk";
        ctx.textAlign = "right";
        ctx.fillText(`${page + 1} / ${pages.length}`, 1950, 585);
      }
      texture.needsUpdate = true;
    }
    // Both the bevelled solid AND its ink unfold from the same blue spine.
    if (lastOpen === state.open) return;
    lastOpen = state.open;
    const angle = (1 - state.open) * Math.PI * 0.32;
    for (const [g, original] of originals) {
      const p = g.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const x = original[i] + 375,
          z = original[i + 2];
        p[i] = Math.cos(angle) * x - Math.sin(angle) * z - 375;
        p[i + 1] = original[i + 1] * Math.max(0.035, state.open);
        p[i + 2] = Math.sin(angle) * x + Math.cos(angle) * z;
      }
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
      g.computeBoundingSphere();
      g.computeBoundingBox();
    }
  }
  function snapshot() {
    return {
      open: state.open,
      page: page + 1,
      pages: pages.length,
      fullMessage: text,
      lines,
      pageLines: pages[page] ?? [],
      position: group.position.toArray(),
      rotation: group.rotation.toArray().slice(0, 3),
      stableFrontFacing: state.open === 1 && group.rotation.x === 0 && group.rotation.y === 0,
      fontSizeWorld: (114 * 690) / 2048,
      donorNameLines: donorLines,
      donorNameSizeWorld: (donorNameSize * 900) / 1200,
      donorAmountSizeWorld: (164 * 900) / 1200,
      disposed,
    };
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    geometry.dispose();
    inkGeometry.dispose();
    face.dispose();
    side.dispose();
    inkMaterial.dispose();
    texture.dispose();
    donorTexture.dispose();
    group.removeFromParent();
  }
  // The existing donor flip stays the same physical object. Only its ink hierarchy
  // morphs during handoff: a full-size nickname and a secondary amount for reading.
  const donorCanvas = document.createElement("canvas");
  donorCanvas.width = 1200;
  donorCanvas.height = 480;
  const donorCtx = donorCanvas.getContext("2d");
  donorCtx.fillStyle = "#fff";
  donorCtx.textAlign = "center";
  donorCtx.textBaseline = "middle";
  let donorNameSize = 106;
  donorCtx.font = `800 ${donorNameSize}px VoiceGrotesk`;
  const chars = [...nickname];
  const long = donorCtx.measureText(nickname).width > 1100;
  const cut = Math.ceil(chars.length / 2);
  const donorLines = long ? [chars.slice(0, cut).join(""), chars.slice(cut).join("")] : [nickname];
  while (
    Math.max(...donorLines.map((s) => donorCtx.measureText(s).width)) > 1100 &&
    donorNameSize > 54
  ) {
    donorNameSize--;
    donorCtx.font = `800 ${donorNameSize}px VoiceGrotesk`;
  }
  donorLines.forEach((s, i) => {
    donorCtx.fillText(s, 600, long ? [89, 192][i] : 145);
  });
  donorCtx.font = "950 164px VoiceGrotesk";
  donorCtx.fillText(`${amount} zł`, 600, 340);
  const donorTexture = new THREE.CanvasTexture(donorCanvas);
  donorTexture.colorSpace = THREE.SRGBColorSpace;
  return { state, group, texture, donorTexture, update, snapshot, dispose };
}
