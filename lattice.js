// A small surface-code patch. Every few seconds a random Pauli error lands on
// one or two data qubits, and the checks that anticommute with it light up.
// Syndromes are computed as parities, so overlapping errors cancel correctly.
(function () {
  const svg = document.getElementById("lattice");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const N = 6;                 // data qubits per side
  const step = 50, off = 25;   // grid spacing and margin in viewBox units
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  // edges
  for (let i = 0; i < N; i++) {
    const p = off + i * step;
    svg.appendChild(el("line", { x1: off, y1: p, x2: off + (N - 1) * step, y2: p, class: "lat-edge" }));
    svg.appendChild(el("line", { x1: p, y1: off, x2: p, y2: off + (N - 1) * step, class: "lat-edge" }));
  }

  // plaquette checks, checkerboard of X and Z type
  const checks = [];
  const s = 20;
  for (let r = 0; r < N - 1; r++) {
    for (let c = 0; c < N - 1; c++) {
      const type = (r + c) % 2 === 0 ? "x" : "z";
      const cx = off + c * step + step / 2, cy = off + r * step + step / 2;
      const node = el("rect", {
        x: cx - s / 2, y: cy - s / 2, width: s, height: s, rx: 4,
        class: "lat-check " + type,
      });
      svg.appendChild(node);
      checks.push({ r, c, type, node });
    }
  }

  // data qubits
  const qubits = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const node = el("circle", { cx: off + c * step, cy: off + r * step, r: 7, class: "lat-q" });
      svg.appendChild(node);
      qubits.push({ r, c, node });
    }
  }

  // checks touching data qubit (r, c)
  const neighbours = (r, c) =>
    checks.filter(k => (k.r === r || k.r === r - 1) && (k.c === c || k.c === c - 1));

  function show(errors) {
    qubits.forEach(q => q.node.classList.remove("err"));
    const parity = new Map();
    for (const { q, pauli } of errors) {
      q.node.classList.add("err");
      // X errors are caught by Z checks, Z errors by X checks
      const sees = pauli === "X" ? "z" : "x";
      for (const k of neighbours(q.r, q.c)) {
        if (k.type === sees) parity.set(k, !parity.get(k));
      }
    }
    checks.forEach(k => k.node.classList.toggle("lit", !!parity.get(k)));
  }

  const clear = () => show([]);
  const pick = () => qubits[Math.floor(Math.random() * qubits.length)];

  function randomErrors() {
    const first = pick();
    const pauli = Math.random() < 0.5 ? "X" : "Z";
    const errs = [{ q: first, pauli }];
    // sometimes a short chain: a second error on a neighbouring qubit
    if (Math.random() < 0.35) {
      const nb = qubits.filter(q => Math.abs(q.r - first.r) + Math.abs(q.c - first.c) === 1);
      errs.push({ q: nb[Math.floor(Math.random() * nb.length)], pauli });
    }
    return errs;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    show([{ q: qubits[2 * N + 3], pauli: "X" }]);
    return;
  }

  function tick() {
    show(randomErrors());
    setTimeout(clear, 1700);
  }
  setTimeout(tick, 600);
  setInterval(tick, 2600);
})();
