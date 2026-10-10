import * as THREE from "three";

// Three authored display treatments; same cap envelope and baseline slots.
// Quadratic curves are the letter outlines themselves, not a bevel on block glyphs.
function draw(commands) {
  const s = new THREE.Shape();
  for (const [op, ...p] of commands) {
    if (op === "M") s.moveTo(...p);
    if (op === "L") s.lineTo(...p);
    if (op === "Q") s.quadraticCurveTo(...p);
    if (op === "C") s.bezierCurveTo(...p);
  }
  s.closePath();
  return s;
}

function punch(char) {
  if (char === "O") {
    // The same soft, broad-shouldered ink construction as H/A/L.
    // An authored letter and counter, not an ellipse fitted around the footage.
    const s = draw([
      ["M", 98, 0],
      ["C", 26, 0, 0, 22, 0, 105],
      ["C", 0, 187, 22, 218, 98, 218],
      ["C", 176, 218, 196, 187, 196, 111],
      ["C", 196, 28, 169, 0, 98, 0],
    ]);
    const counter = draw([
      ["M", 98, 46],
      ["C", 65, 46, 49, 67, 49, 109],
      ["C", 49, 158, 66, 173, 98, 173],
      ["C", 130, 173, 145, 158, 145, 111],
      ["C", 145, 67, 130, 46, 98, 46],
    ]);
    s.holes.push(counter);
    return s;
  }
  if (char === "H")
    return draw([
      ["M", 24, 0],
      ["Q", 0, 0, 2, 26],
      ["L", 8, 193],
      ["Q", 10, 218, 31, 218],
      ["Q", 52, 222, 53, 194],
      ["L", 51, 140],
      ["Q", 74, 130, 101, 140],
      ["L", 99, 195],
      ["Q", 99, 220, 120, 218],
      ["Q", 146, 217, 144, 192],
      ["L", 138, 22],
      ["Q", 137, -3, 116, 0],
      ["Q", 99, -1, 97, 21],
      ["L", 98, 90],
      ["Q", 73, 102, 52, 90],
      ["L", 53, 22],
      ["Q", 55, -2, 24, 0],
    ]);
  if (char === "L")
    return draw([
      ["M", 26, 0],
      ["Q", 2, -2, 2, 26],
      ["L", 8, 193],
      ["Q", 7, 218, 30, 218],
      ["Q", 52, 220, 53, 191],
      ["L", 49, 61],
      ["Q", 75, 65, 106, 60],
      ["Q", 139, 60, 139, 33],
      ["Q", 144, 1, 110, 0],
      ["L", 26, 0],
    ]);
  if (char === "!")
    return [
      draw([
        ["M", 13, 70],
        ["Q", 0, 71, 1, 89],
        ["L", -6, 191],
        ["Q", -6, 218, 19, 218],
        ["Q", 47, 218, 43, 190],
        ["L", 35, 87],
        ["Q", 33, 70, 13, 70],
      ]),
      draw([
        ["M", 18, 0],
        ["C", 46, 0, 47, 40, 18, 40],
        ["C", -9, 40, -10, 0, 18, 0],
      ]),
    ];
  const s = draw([
    ["M", 22, 0],
    ["Q", -2, 0, 5, 24],
    ["L", 55, 192],
    ["Q", 60, 217, 88, 218],
    ["Q", 112, 222, 121, 194],
    ["L", 175, 24],
    ["Q", 187, -2, 160, 0],
    ["L", 141, 1],
    ["Q", 131, 0, 126, 21],
    ["L", 120, 48],
    ["Q", 84, 52, 55, 46],
    ["L", 47, 20],
    ["Q", 42, -2, 22, 0],
  ]);
  const h = new THREE.Path();
  h.moveTo(71, 91);
  h.quadraticCurveTo(85, 140, 88, 152);
  h.quadraticCurveTo(92, 160, 96, 145);
  h.lineTo(112, 88);
  h.quadraticCurveTo(93, 93, 71, 91);
  h.closePath();
  s.holes.push(h);
  return s;
}

function rounded(points, r = 12) {
  const s = new THREE.Shape();
  points.forEach((v, i) => {
    const a = points[(i + points.length - 1) % points.length],
      b = points[(i + 1) % points.length];
    const da = Math.hypot(a[0] - v[0], a[1] - v[1]),
      db = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const q = Math.min(r, da * 0.35, db * 0.35);
    const before = [v[0] + ((a[0] - v[0]) * q) / da, v[1] + ((a[1] - v[1]) * q) / da];
    const after = [v[0] + ((b[0] - v[0]) * q) / db, v[1] + ((b[1] - v[1]) * q) / db];
    if (i === 0) s.moveTo(...before);
    else s.lineTo(...before);
    s.quadraticCurveTo(...v, ...after);
  });
  s.closePath();
  return s;
}

export function headlineGeometry(char, treatment) {
  let shape;
  if (treatment === "round") {
    if (char === "H")
      shape = rounded(
        [
          [0, 0],
          [46, 0],
          [46, 83],
          [103, 83],
          [103, 0],
          [146, 0],
          [146, 218],
          [103, 218],
          [103, 136],
          [46, 136],
          [46, 218],
          [0, 218],
        ],
        16,
      );
    else if (char === "L")
      shape = rounded(
        [
          [0, 0],
          [139, 0],
          [139, 49],
          [48, 49],
          [48, 218],
          [0, 218],
        ],
        16,
      );
    else shape = punch(char);
  } else shape = punch(char);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: treatment === "marker" ? 38 : 46,
    bevelEnabled: true,
    bevelThickness: 2.5,
    bevelSize: 2.5,
    bevelSegments: 3,
    curveSegments: 16,
  });
  g.computeBoundingBox();
  const box = g.boundingBox;
  const widths = { H: 146, A: 180, L: 139, O: 196, "!": 45 };
  g.translate(-box.min.x, -box.min.y, 0);
  g.scale(widths[char] / (box.max.x - box.min.x), 218 / (box.max.y - box.min.y), 1);
  if (treatment === "marker") {
    const p = g.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) p[i] += (p[i + 1] - 109) * 0.1;
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
  }
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

export function oContours(treatment) {
  const glyph = punch("O");
  const sample = (path) =>
    path
      .getSpacedPoints(64)
      .map(({ x, y }) => [x - 98 + (treatment === "marker" ? (y - 109) * 0.1 : 0), y - 109]);
  return { outer: sample(glyph), inner: sample(glyph.holes[0]) };
}

export const treatments = {
  round: {
    name: "ROUND / rounded editorial",
    outline: 0x173fa5,
    expansion: 1.012,
  },
  punch: {
    name: "PUNCH / soft cartoon ink",
    outline: 0xf33540,
    expansion: 1.024,
  },
  marker: {
    name: "MARKER / slanted overprint",
    outline: 0x173fa5,
    expansion: 1.052,
  },
};
