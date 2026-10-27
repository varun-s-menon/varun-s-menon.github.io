// Tanner graph of the [[72,12,6]] bivariate bicycle code
// (A = x^3 + y + y^2, B = y^3 + x + x^2 on a 6x6 torus), drawn in its toric
// layout. Four of each check's six edges are nearest-neighbour grid edges;
// the other two are long-range. Every few seconds a random Pauli error lands
// on one or two data qubits, and the edges to the checks that detect it are
// drawn in, including the long-range ones. Syndromes are parities, so
// overlapping errors cancel correctly.
(function () {
  const svg = document.getElementById("lattice");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const L = 6;                       // torus is L x L unit cells
  const G = 2 * L;                   // node grid is G x G (half-step spacing)
  const SIZE = 300, U = SIZE / G;    // pixels per half-step
  const SA = [[3, 0], [0, 1], [0, 2]];   // A = x^3 + y + y^2
  const SB = [[0, 3], [1, 0], [2, 0]];   // B = y^3 + x + x^2
  const mod = (a, n) => ((a % n) + n) % n;
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const px = g => U * (g + 0.5);

  // node grid coordinates (in half-steps) for each node type at cell (i, j)
  const gpos = {
    X: (i, j) => [mod(2 * i, G), mod(2 * j, G)],
    L: (i, j) => [mod(2 * i, G), mod(2 * j - 3, G)],
    R: (i, j) => [mod(2 * i - 3, G), mod(2 * j, G)],
    Z: (i, j) => [mod(2 * i - 3, G), mod(2 * j - 3, G)],
  };

  const edgeLayer = el("g", {});
  const gridLayer = el("g", {});
  const nodeLayer = el("g", {});
  svg.append(gridLayer, edgeLayer, nodeLayer);

  // faint grid of local (nearest-neighbour) edges, running off the edges to suggest the torus
  for (let k = 0; k < G; k++) {
    gridLayer.appendChild(el("line", { x1: 0, y1: px(k), x2: SIZE, y2: px(k), class: "tg-grid" }));
    gridLayer.appendChild(el("line", { x1: px(k), y1: 0, x2: px(k), y2: SIZE, class: "tg-grid" }));
  }

  const nodes = {};
  const key = (t, i, j) => t + mod(i, L) + "," + mod(j, L);
  const S = 8.5;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) {
    for (const t of ["X", "Z"]) {
      const [gx, gy] = gpos[t](i, j);
      const node = el("rect", {
        x: px(gx) - S / 2, y: px(gy) - S / 2, width: S, height: S, rx: 1.5,
        class: "tg-c " + t.toLowerCase(),
      });
      nodes[key(t, i, j)] = { t, g: [gx, gy], node };
    }
    for (const t of ["L", "R"]) {
      const [gx, gy] = gpos[t](i, j);
      const node = el("circle", { cx: px(gx), cy: px(gy), r: 4.2, class: "tg-q" });
      nodes[key(t, i, j)] = { t, g: [gx, gy], node };
    }
  }
  for (const k in nodes) nodeLayer.appendChild(nodes[k].node);

  // Tanner graph: H_X = [A | B], H_Z = [B^T | A^T]
  const nbrs = {};   // data qubit key -> { X: [check keys], Z: [check keys] }
  const add = (q, c, type) => {
    (nbrs[q] = nbrs[q] || { X: [], Z: [] })[type].push(c);
  };
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) {
    for (const [a, b] of SA) add(key("L", i + a, j + b), key("X", i, j), "X");
    for (const [a, b] of SB) add(key("R", i + a, j + b), key("X", i, j), "X");
    for (const [a, b] of SB) add(key("L", i - a, j - b), key("Z", i, j), "Z");
    for (const [a, b] of SA) add(key("R", i - a, j - b), key("Z", i, j), "Z");
  }
  const qubits = Object.keys(nbrs);

  // shortest displacement on the torus, in half-steps
  const tdisp = (a, b) => [0, 1].map(k => {
    let d = mod(b[k] - a[k], G);
    return d > G / 2 ? d - G : d;
  });

  function drawEdge(q, c) {
    const a = nodes[q].g, b = nodes[c].g;
    const d = tdisp(a, b);
    const x1 = px(a[0]), y1 = px(a[1]);
    let path, long = false;
    if (Math.abs(d[0]) + Math.abs(d[1]) === 1) {
      // local edge: draw toward the nearest image (may wrap off the edge)
      path = `M${x1},${y1} L${x1 + d[0] * U},${y1 + d[1] * U}`;
    } else {
      // long-range edge: a gentle arc to the check's position in the patch
      long = true;
      const x2 = px(b[0]), y2 = px(b[1]);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const bend = 0.22 * (Math.random() < 0.5 ? 1 : -1);
      path = `M${x1},${y1} Q${mx - dy * bend},${my + dx * bend} ${x2},${y2}`;
    }
    const e = el("path", { d: path, class: "tg-edge" + (long ? " long" : "") });
    edgeLayer.appendChild(e);
    const len = e.getTotalLength();
    e.style.strokeDasharray = len;
    e.style.strokeDashoffset = len;
    return e;
  }

  let live = [];
  function clear() {
    for (const e of live) e.classList.add("fade");
    const old = live;
    live = [];
    setTimeout(() => old.forEach(e => e.remove()), 600);
    for (const k in nodes) nodes[k].node.classList.remove("err", "lit");
  }

  function show(errors, animate) {
    const parity = new Map();
    for (const { q, pauli } of errors) {
      nodes[q].node.classList.add("err");
      // X errors are detected by Z checks, Z errors by X checks
      for (const c of nbrs[q][pauli === "X" ? "Z" : "X"]) {
        live.push(drawEdge(q, c));
        parity.set(c, !parity.get(c));
      }
    }
    for (const [c, on] of parity) if (on) nodes[c].node.classList.add("lit");
    const draw = () => live.forEach(e => (e.style.strokeDashoffset = 0));
    animate ? requestAnimationFrame(() => requestAnimationFrame(draw)) : draw();
  }

  const pick = () => qubits[Math.floor(Math.random() * qubits.length)];
  function randomErrors() {
    const pauli = Math.random() < 0.5 ? "X" : "Z";
    const errs = [{ q: pick(), pauli }];
    if (Math.random() < 0.3) {
      let q2 = pick();
      while (q2 === errs[0].q) q2 = pick();
      errs.push({ q: q2, pauli });
    }
    return errs;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show([{ q: key("L", 2, 3), pauli: "X" }], false);
    return;
  }
  function tick() {
    show(randomErrors(), true);
    setTimeout(clear, 2000);
  }
  setTimeout(tick, 500);
  setInterval(tick, 2900);
})();
