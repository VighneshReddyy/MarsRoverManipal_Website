export function startRoverSimulation(cv: HTMLCanvasElement): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return () => {};

  let animId: number;
  let W = window.innerWidth;
  let H = window.innerHeight;
  let D = Math.min(window.devicePixelRatio || 1, 2);
  let S = Math.max(68, Math.min(135, Math.min(W / 12, H / 6.2)));
  let skyC: HTMLCanvasElement | null = null;

  function rs() {
    D = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * D;
    cv.height = H * D;
    S = Math.max(68, Math.min(135, Math.min(W / 12, H / 6.2)));
    skyC = null;
  }
  window.addEventListener('resize', rs);
  rs();

  /* ---------- terrain (metres, y up) ---------- */
  const fr = (n: number) => n - Math.floor(n);
  const hs = (n: number) => fr(Math.sin(n * 127.1 + 311.7) * 43758.5);
  const bou = (c: number) =>
    hs(c * 1.7) > 0.4
      ? {
          cx: c * 1.7 + hs(c + 11) * 1.4,
          w: 0.14 + hs(c + 13) * 0.26,
          ht: 0.04 + Math.pow(hs(c + 17), 2) * 0.2,
        }
      : null;

  function terr(x: number) {
    let y =
      1.3 * Math.sin(0.075 * x + 0.6) +
      0.55 * Math.sin(0.21 * x + 1) +
      0.2 * Math.sin(0.52 * x + 2) +
      0.07 * Math.sin(1.3 * x);
    y += 0.2 * Math.tanh(Math.sin(0.17 * x + 3) * 3); // terraced ledges
    const c0 = Math.floor(x / 22);
    for (let c = c0 - 1; c <= c0 + 1; c++) {
      if (hs(c) > 0.4) {
        // craters with raised rims
        const cx = c * 22 + 4 + hs(c + 7) * 14;
        const r = 1.8 + hs(c + 3) * 2.4;
        const dp = 0.3 + hs(c + 5) * 0.45;
        const d = x - cx;
        y +=
          -dp * Math.exp((-1.2 * d * d) / (r * r)) +
          0.55 * dp * Math.exp(-Math.pow((Math.abs(d) - 1.25 * r) / (0.35 * r), 2));
      }
    }
    const b0 = Math.floor(x / 1.7);
    for (let c = b0 - 1; c <= b0 + 1; c++) {
      const b = bou(c);
      if (b) y += b.ht * Math.exp(-Math.pow((x - b.cx) / b.w, 2)); // boulders
    }
    return y;
  }

  const R = 0.15; // tyre radius (balloon_tyre OD 0.300 m)
  function hubY(x: number) {
    let m = -9;
    for (let i = -12; i <= 12; i++) {
      const s = (i * R) / 12;
      m = Math.max(m, terr(x + s) + Math.sqrt(R * R - s * s));
    }
    return m;
  }

  /* ---------- five-bar suspension (fivebar.xacro values) ---------- */
  const A0 = [0.254, 0.055];
  const L1 = 0.154;
  const LB = 0.3196;
  const PH = Math.atan2(-0.153272, 0.01496);
  const Bs = [0.26896, -0.098272];
  const Ms = [0, -0.270934];
  const ux = Ms[0] - Bs[0];
  const uy = Ms[1] - Bs[1];
  const ul2 = ux * ux + uy * uy;
  const loc = (p: number[]) => {
    const dx = p[0] - Bs[0];
    const dy = p[1] - Bs[1];
    return [(dx * ux + dy * uy) / ul2, (-dx * uy + dy * ux) / ul2];
  };
  const lc = {
    W: loc([0.576918, -0.270934]),
    Eo: loc([0.380325, -0.098344]),
    Ei: loc([0.143379, -0.088007]),
  };
  const place = (B: number[], M: number[], l: number[], s: number) => {
    const u = [M[0] - B[0], M[1] - B[1]];
    return [B[0] + u[0] * l[0] - u[1] * l[1] * s, B[1] + u[1] * l[0] + u[0] * l[1] * s];
  };

  function susp(af: number, ar: number) {
    const Bf = [A0[0] + L1 * Math.cos(PH + af), A0[1] + L1 * Math.sin(PH + af)];
    const Br = [-(A0[0] + L1 * Math.cos(PH + ar)), A0[1] + L1 * Math.sin(PH + ar)];
    const dx = Br[0] - Bf[0];
    const dy = Br[1] - Bf[1];
    const d = Math.min(Math.hypot(dx, dy), 2 * LB - 1e-3);
    const h = Math.sqrt(LB * LB - (d * d) / 4);
    let nx = -dy / d;
    let ny = dx / d;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const M = [(Bf[0] + Br[0]) / 2 + nx * h, (Bf[1] + Br[1]) / 2 + ny * h];
    const mk = (B: number[], s: number) => ({
      B,
      W: place(B, M, lc.W, s),
      Eo: place(B, M, lc.Eo, s),
      Ei: place(B, M, lc.Ei, s),
    });
    return { f: mk(Bf, 1), r: mk(Br, -1), M };
  }

  /* chassis state: [height, pitch, front control-link angle, rear control-link angle] */
  let X = 3;
  let P = [0.42, 0, 0, 0];
  let Ps = [0.42, 0, 0, 0];
  let camY = 0;
  let dtS = 1 / 60;

  function hubsW(p: number[]) {
    const k = susp(p[2], p[3]);
    const c = Math.cos(p[1]);
    const s = Math.sin(p[1]);
    return [k.f.W, k.M, k.r.W].map((q) => [X + q[0] * c - q[1] * s, p[0] + q[0] * s + q[1] * c]);
  }

  const resid = (p: number[]) => hubsW(p).map((h) => h[1] - hubY(h[0]));

  function solve(A: number[][], b: number[]) {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      let m = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
      }
      [A[i], A[m]] = [A[m], A[i]];
      [b[i], b[m]] = [b[m], b[i]];
      for (let r = i + 1; r < n; r++) {
        const f = A[r][i] / A[i][i];
        for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
        b[r] -= f * b[i];
      }
    }
    const x: number[] = [];
    for (let i = n - 1; i >= 0; i--) {
      let s = b[i];
      for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
      x[i] = s / A[i][i];
    }
    return x;
  }

  function step(gain: number) {
    const w = 400;
    const ks = 2;
    const e0 = resid(P);
    const J: number[][] = [];
    for (let j = 0; j < 4; j++) {
      const q = P.slice();
      q[j] += 1e-4;
      J.push(resid(q).map((v, i) => (v - e0[i]) / 1e-4));
    }
    const A: number[][] = [];
    const b: number[] = [];
    for (let a = 0; a < 4; a++) {
      A[a] = [];
      for (let c = 0; c < 4; c++) {
        let s = 0;
        for (let i = 0; i < 3; i++) s += J[a][i] * J[c][i];
        A[a][c] = w * s + (a === c ? (a > 1 ? ks : 0) + 1e-3 : 0);
      }
      let s = 0;
      for (let i = 0; i < 3; i++) s += J[a][i] * e0[i];
      b[a] = -w * s - (a > 1 ? ks * P[a] : 0);
    }
    const d = solve(A, b);
    for (let j = 0; j < 4; j++) P[j] += gain * d[j];
    P[2] = Math.max(-0.55, Math.min(0.55, P[2]));
    P[3] = Math.max(-0.55, Math.min(0.55, P[3]));
  }

  for (let i = 0; i < 40; i++) step(0.8);
  Ps = P.slice();
  camY = P[0];

  /* ---------- drawing helpers (rover local space: metres, y up) ---------- */
  const mg = (y0: number, y1: number) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#eef1f3');
    g.addColorStop(0.45, '#a6acb2');
    g.addColorStop(1, '#cfd4d8');
    return g;
  };

  function path(pts: number[][], close?: boolean) {
    ctx!.beginPath();
    pts.forEach((p, i) => (i ? ctx!.lineTo(p[0], p[1]) : ctx!.moveTo(p[0], p[1])));
    if (close) ctx!.closePath();
  }

  function tube(pts: number[][], w: number, col?: string) {
    ctx!.lineJoin = 'miter';
    ctx!.lineCap = 'butt';
    path(pts);
    ctx!.strokeStyle = '#3d4348';
    ctx!.lineWidth = w + 0.007;
    ctx!.stroke();
    ctx!.strokeStyle = col || '#aeb4ba';
    ctx!.lineWidth = w;
    ctx!.stroke();
    ctx!.save();
    ctx!.translate(0, w * 0.2);
    path(pts);
    ctx!.strokeStyle = 'rgba(255,255,255,.55)';
    ctx!.lineWidth = w * 0.26;
    ctx!.stroke();
    ctx!.restore();
  }

  function disc(x: number, y: number, r: number, f: string | CanvasGradient, s?: string) {
    ctx!.beginPath();
    ctx!.arc(x, y, r, 0, 7);
    ctx!.fillStyle = f;
    ctx!.fill();
    if (s) {
      ctx!.strokeStyle = s;
      ctx!.lineWidth = 0.006;
      ctx!.stroke();
    }
  }

  function bolt(x: number, y: number, r = 0.007) {
    disc(x, y, r, '#2e3236');
  }

  function rg(x: number, y: number, r0: number, r1: number, a: string, b: string) {
    const g = ctx!.createRadialGradient(x - r1 * 0.3, y + r1 * 0.3, r0, x, y, r1);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    return g;
  }

  function rrect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    f: string | CanvasGradient,
    s?: string
  ) {
    ctx!.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx!.rect(x, y, w, h);
    }
    ctx!.fillStyle = f;
    ctx!.fill();
    if (s) {
      ctx!.strokeStyle = s;
      ctx!.lineWidth = 0.006;
      ctx!.stroke();
    }
  }

  function wheel(x: number, y: number, a: number) {
    ctx!.save();
    ctx!.translate(x, y);
    disc(0, 0, R, rg(0, 0, 0.02, R, '#b3ab9c', '#6f6a5f'), '#3f3b35');
    ctx!.save();
    ctx!.rotate(a);
    ctx!.strokeStyle = 'rgba(40,36,30,.35)';
    ctx!.lineWidth = 0.005;
    for (let i = 0; i < 36; i++) {
      ctx!.rotate(Math.PI / 18);
      ctx!.beginPath();
      ctx!.moveTo(R - 0.006, 0);
      ctx!.lineTo(R - 0.02, 0);
      ctx!.stroke();
    }
    ctx!.restore();
    ctx!.beginPath();
    ctx!.arc(0, 0, R * 0.94, 2.3, 3.9);
    ctx!.strokeStyle = 'rgba(255,250,235,.28)';
    ctx!.lineWidth = 0.012;
    ctx!.stroke();
    disc(0, 0, 0.108, rg(0, 0, 0.03, 0.108, '#8d8678', '#5f5a50'), '#4a463f');
    disc(0, 0, 0.076, rg(0, 0, 0.01, 0.076, '#dfe3e6', '#8e949a'), '#555b61');
    ctx!.save();
    ctx!.rotate(a);
    for (let i = 0; i < 4; i++) {
      ctx!.rotate(Math.PI / 2);
      bolt(0.058, 0, 0.006);
    }
    ctx!.rotate(0.6);
    rrect(-0.036, -0.022, 0.072, 0.044, 0.012, '#7c838a', '#3d4348');
    disc(0, 0, 0.016, '#3a3f44');
    ctx!.restore();
    ctx!.restore();
  }

  /* manipulator */
  const K = 0.000814;
  const Q = (x: number, y: number) => [0.258 + (x - 270) * K, 0.315 - (y - 895) * K];
  const AL = '#cfd1d4';

  function poly(a: number[][], f: string | CanvasGradient, st?: string) {
    path(
      a.map((p) => Q(p[0], p[1])),
      true
    );
    ctx!.fillStyle = f;
    ctx!.fill();
    if (st) {
      ctx!.strokeStyle = st;
      ctx!.lineWidth = 0.005;
      ctx!.stroke();
    }
  }

  function al(a: number[], b: number[], w: number, c?: string) {
    tube([Q(a[0], a[1]), Q(b[0], b[1])], w * K, c || AL);
  }

  function pd(x: number, y: number, r: number, f: string | CanvasGradient, st?: string) {
    const q = Q(x, y);
    disc(q[0], q[1], r * K, f, st);
  }

  function obl(c: number[], len: number, wid: number, col: string) {
    const f = [0.57, 0.82];
    const n = [0.82, -0.57];
    const h = len / 2;
    const w = wid / 2;
    poly(
      [
        [c[0] - f[0] * h - n[0] * w, c[1] - f[1] * h - n[1] * w],
        [c[0] - f[0] * h + n[0] * w, c[1] - f[1] * h + n[1] * w],
        [c[0] + f[0] * h + n[0] * w, c[1] + f[1] * h + n[1] * w],
        [c[0] + f[0] * h - n[0] * w, c[1] + f[1] * h - n[1] * w],
      ],
      col,
      '#6a3410'
    );
  }

  function xcut(a: number, b: number, c: number, d: number) {
    const p = Q(a, b);
    const q = Q(c, d);
    ctx!.beginPath();
    ctx!.moveTo(p[0], p[1]);
    ctx!.lineTo(q[0], q[1]);
    ctx!.strokeStyle = '#4a5056';
    ctx!.lineWidth = 0.006;
    ctx!.stroke();
  }

  function drawArm() {
    poly(
      [
        [318, 880],
        [430, 872],
        [436, 1105],
        [330, 1115],
      ],
      mg(0.1, 0.4),
      '#3d4348'
    );
    poly(
      [
        [112, 1000],
        [360, 985],
        [372, 1135],
        [112, 1140],
      ],
      mg(0.1, 0.3),
      '#3d4348'
    );
    pd(225, 1015, 106, rg(0, 0, 0.02, 0.09, '#e8eaec', '#8d9399'), '#3d4348');
    pd(225, 1015, 76, '#a9aeb3', '#4b5157');
    pd(225, 1015, 48, '#c7cbcf', '#4b5157');
    pd(190, 1028, 22, '#1a1c1e');
    for (let i = 0; i < 8; i++) {
      const q = i * 0.785;
      pd(225 + Math.cos(q) * 91, 1015 + Math.sin(q) * 91, 6, '#4b5157');
    }
    [
      [400, 905],
      [400, 1090],
      [348, 1100],
      [348, 915],
    ].forEach((p) => pd(p[0], p[1], 7, '#2e3236'));
    al([118, 885], [165, 700], 86, '#c4c7cb');
    xcut(98, 870, 148, 735);
    xcut(150, 870, 112, 735);
    xcut(106, 800, 160, 800);
    al([165, 700], [293, 82], 36);
    al([126, 690], [258, 100], 11, '#16181a');
    pd(118, 885, 34, '#d8dbde', '#3d4348');
    pd(118, 885, 10, '#2e3236');
    al([283, 900], [338, 255], 34);
    al([322, 900], [372, 262], 34, '#bfc3c7');
    poly(
      [
        [322, 168],
        [408, 168],
        [414, 305],
        [338, 312],
      ],
      '#c9ccd0',
      '#3d4348'
    );
    xcut(335, 190, 400, 290);
    xcut(400, 190, 340, 290);
    pd(345, 258, 8, '#2e3236');
    pd(385, 270, 8, '#2e3236');
    al([312, 182], [352, 182], 26, '#9aa0a6');
    pd(372, 185, 40, rg(0, 0, 0.01, 0.03, '#e1e4e6', '#8a9096'), '#3d4348');
    pd(372, 185, 12, '#2e3236');
    tube([Q(293, 80), Q(372, 185), Q(445, 268)], 56 * K, '#c6c9cd');
    poly(
      [
        [302, 108],
        [336, 100],
        [322, 142],
      ],
      '#2b2f33'
    );
    poly(
      [
        [342, 128],
        [374, 136],
        [352, 168],
      ],
      '#2b2f33'
    );
    poly(
      [
        [388, 176],
        [420, 196],
        [394, 222],
      ],
      '#2b2f33'
    );
    pd(293, 80, 30, '#dcdfe2', '#3d4348');
    pd(293, 80, 10, '#2e3236');
    pd(445, 268, 42, '#d3d5d8', '#3d4348');
    pd(432, 260, 9, '#2e3236');
    pd(462, 282, 9, '#2e3236');
    al([450, 285], [712, 715], 40, '#c6c9cc');
    for (let i = 1; i < 9; i++) {
      const f = i / 9;
      pd(450 + 262 * f, 285 + 430 * f, 5, '#3d4348');
    }
    al([472, 262], [738, 692], 12, '#15171a');
    poly(
      [
        [566, 472],
        [640, 452],
        [652, 500],
        [582, 522],
      ],
      '#3a3f44',
      '#202326'
    );
    poly(
      [
        [640, 450],
        [668, 454],
        [665, 482],
        [640, 480],
      ],
      '#f0732a',
      '#7a3a10'
    );
    poly(
      [
        [648, 690],
        [782, 712],
        [804, 782],
        [690, 802],
      ],
      '#9aa0a6',
      '#3d4348'
    );
    pd(765, 765, 58, '#eadfc9', '#8a7a5a');
    ctx!.save();
    ctx!.setLineDash([0.008, 0.006]);
    const wq = Q(765, 765);
    ctx!.beginPath();
    ctx!.arc(wq[0], wq[1], 54 * K, 0, 7);
    ctx!.strokeStyle = '#b79c6c';
    ctx!.lineWidth = 0.011;
    ctx!.stroke();
    ctx!.restore();
    pd(765, 765, 28, '#d9a24a', '#7a5a20');
    pd(700, 780, 30, '#d8d2c4', '#6c6454');
    pd(700, 780, 12, '#6c6454');
    al([790, 815], [822, 852], 30, '#8d9399');
    al([700, 935], [940, 765], 26, '#c9ccd0');
    obl([745, 985], 100, 42, '#ee7a2a');
    obl([975, 828], 100, 42, '#ee7a2a');
    pd(995, 800, 20, '#f08a30', '#7a3a10');
    al([700, 1012], [742, 990], 20, '#ee7a2a');
    al([800, 1002], [985, 868], 9, '#d9dcdf');
    al([838, 918], [900, 888], 10, '#a47a3a');
    poly(
      [
        [772, 932],
        [852, 924],
        [884, 988],
        [928, 1086],
        [862, 1062],
        [800, 992],
      ],
      '#c3c7cb',
      '#3d4348'
    );
    poly(
      [
        [795, 950],
        [825, 944],
        [832, 985],
        [802, 992],
      ],
      '#eef0f2'
    );
    poly(
      [
        [862, 1062],
        [928, 1086],
        [900, 1040],
      ],
      '#e8963a'
    );
    poly(
      [
        [884, 842],
        [962, 858],
        [986, 928],
        [1012, 1030],
        [962, 1000],
        [915, 930],
      ],
      '#c3c7cb',
      '#3d4348'
    );
    poly(
      [
        [910, 862],
        [940, 866],
        [946, 900],
        [916, 896],
      ],
      '#eef0f2'
    );
    poly(
      [
        [962, 1000],
        [1012, 1030],
        [985, 975],
      ],
      '#e8963a'
    );
  }

  function drawRover(t: number) {
    const k = susp(Ps[2], Ps[3]);
    const spin = -X / R;
    const mx = -0.262;
    tube(
      [
        [mx, 0.11],
        [mx, 1.08],
      ],
      0.024,
      '#1c1e21'
    );
    rrect(mx - 0.032, 0.56, 0.064, 0.2, 0.01, '#7b8086', '#33383c');
    rrect(mx - 0.02, 0.64, 0.04, 0.05, 0.006, '#9aa0a6');
    disc(mx, 1.1, 0.016, '#c43a2f', '#44201c');
    tube(
      [
        [mx, 1.08],
        [mx, 1.12],
      ],
      0.006,
      '#444'
    );
    ctx!.beginPath();
    ctx!.moveTo(mx + 0.014, 0.2);
    ctx!.bezierCurveTo(mx + 0.06, 0.4, mx - 0.04, 0.55, mx + 0.014, 0.9);
    ctx!.strokeStyle = '#e9e9e9';
    ctx!.lineWidth = 0.005;
    ctx!.stroke();

    drawArm();

    rrect(-0.3, -0.1075, 0.6, 0.215, 0.006, mg(-0.11, 0.11), '#3d4348');
    ctx!.strokeStyle = 'rgba(60,66,72,.14)';
    ctx!.lineWidth = 0.0015;
    for (let y = -0.1; y < 0.105; y += 0.006) {
      ctx!.beginPath();
      ctx!.moveTo(-0.29, y);
      ctx!.lineTo(0.29, y);
      ctx!.stroke();
    }
    for (const x of [-0.12, 0.12])
      tube(
        [
          [x, -0.1075],
          [x, 0.1075],
        ],
        0.018
      );
    tube(
      [
        [-0.342, -0.1075],
        [0.342, -0.1075],
      ],
      0.02
    );
    tube(
      [
        [-0.342, 0.1175],
        [0.342, 0.1175],
      ],
      0.02,
      '#dfe3e6'
    );
    for (const s of [1, -1]) {
      ctx!.save();
      ctx!.scale(s, 1);
      rrect(0.222, -0.13, 0.066, 0.275, 0.02, mg(-0.13, 0.14), '#3d4348');
      bolt(0.255, 0.12);
      bolt(0.255, -0.1);
      bolt(0.255, -0.03);
      bolt(0.255, 0.12);
      ctx!.restore();
    }
    rrect(-0.43, -0.07, 0.095, 0.17, 0.014, '#f0732a', '#7a3a10');
    for (let i = 0; i < 6; i++) {
      ctx!.fillStyle = 'rgba(60,25,8,.65)';
      ctx!.fillRect(-0.415, -0.052 + i * 0.026, 0.065, 0.008);
    }
    rrect(-0.18, 0.1175, 0.04, 0.016, 0.004, '#e2b42b');
    disc(-0.16, 0.145, 0.018, '#d12b24', '#531411');
    rrect(
      0.342,
      -0.012,
      0.07,
      0.074,
      0.014,
      rg(0.37, 0.03, 0.01, 0.06, '#f0a93a', '#b8741c'),
      '#5a3a10'
    );
    tube(
      [
        [0.3, 0.0],
        [0.345, 0.025],
      ],
      0.02
    );
    for (const [y, c] of [
      [0.03, '#0c0d10'],
      [0.045, '#23272b'],
    ] as const) {
      ctx!.beginPath();
      ctx!.ellipse(0.412, y, 0.008, 0.016, 0, 0, 7);
      ctx!.fillStyle = c;
      ctx!.fill();
      ctx!.strokeStyle = '#d8dde0';
      ctx!.lineWidth = 0.004;
      ctx!.stroke();
    }

    for (const [s, h] of [
      [1, k.f],
      [-1, k.r],
    ] as const) {
      const A = [s * A0[0], A0[1]];
      tube([A, h.B], 0.04, '#b4bac0');
      tube([k.M, h.Ei, h.B], 0.04);
      tube([h.B, h.Eo, h.W], 0.04);
      disc(A[0], A[1], 0.036, rg(A[0], A[1], 0.01, 0.036, '#eceff1', '#868d93'), '#3d4348');
      disc(A[0], A[1], 0.018, '#4b5157');
      disc(h.B[0], h.B[1], 0.022, '#a8aeb4', '#3d4348');
      bolt(h.B[0], h.B[1], 0.008);
    }
    disc(k.M[0], k.M[1], 0.022, '#a8aeb4', '#3d4348');

    ([
      [k.r.W, 2],
      [k.M, 1],
      [k.f.W, 0],
    ] as const).forEach(([q, i]) => wheel(q[0], q[1], spin - Ps[1] + i * 0.9));
  }

  /* ---------- scene ---------- */
  const twk = Array.from({ length: 150 }, (_, i) => ({
    x: hs(i * 3.1),
    y: hs(i * 5.7 + 1),
    r: 0.7 + hs(i + 40) * 1.9 * hs(i + 41),
    f: 0.6 + hs(i + 7) * 2.2,
    p: hs(i + 13) * 6,
    c: ['#ffffff', '#cfe0ff', '#ffe3b8', '#ffd0c0'][i % 4],
  }));

  function mkSky() {
    skyC = document.createElement('canvas');
    skyC.width = W;
    skyC.height = H;
    const g = skyC.getContext('2d');
    if (!g) return;
    const bg = g.createLinearGradient(0, 0, 0, H * 0.7);
    bg.addColorStop(0, '#000004');
    bg.addColorStop(0.5, '#03030a');
    bg.addColorStop(1, '#0f0615');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    for (const [x, y, r, c] of [
      [0.2, 0.18, 0.5, 'rgba(90,60,170,.09)'],
      [0.78, 0.12, 0.45, 'rgba(40,110,170,.06)'],
      [0.55, 0.34, 0.5, 'rgba(170,60,90,.05)'],
      [0.1, 0.45, 0.4, 'rgba(120,50,150,.05)'],
    ] as const) {
      const q = g.createRadialGradient(W * x, H * y, 0, W * x, H * y, W * r);
      q.addColorStop(0, c);
      q.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = q;
      g.fillRect(0, 0, W, H);
    }
    g.save();
    g.translate(W * 0.52, H * 0.26);
    g.rotate(-0.42);
    const band = g.createLinearGradient(0, -H * 0.16, 0, H * 0.16);
    band.addColorStop(0, 'rgba(200,190,255,0)');
    band.addColorStop(0.5, 'rgba(235,215,255,.1)');
    band.addColorStop(1, 'rgba(200,190,255,0)');
    g.fillStyle = band;
    g.fillRect(-W * 0.9, -H * 0.16, W * 1.8, H * 0.32);
    for (let i = 0; i < 2600; i++) {
      const u = (hs(i * 1.3) - 0.5) * W * 1.8;
      const v = ((hs(i * 2.9 + 5) + hs(i * 4.1 + 9) + hs(i * 6.3 + 2)) / 3 - 0.5) * H * 0.34;
      g.globalAlpha = 0.15 + hs(i + 3) * 0.6;
      g.fillStyle = hs(i + 8) > 0.8 ? '#ffe0c0' : '#e6ecff';
      g.fillRect(u, v, hs(i + 6) > 0.9 ? 1.6 : 0.9, hs(i + 6) > 0.9 ? 1.6 : 0.9);
    }
    g.restore();
    g.globalAlpha = 1;
    for (let i = 0; i < 1100; i++) {
      const y = Math.pow(hs(i * 7.7 + 2), 1.2) * H * 0.7;
      g.globalAlpha = 0.25 + hs(i + 1) * 0.7;
      g.fillStyle = ['#fff', '#dbe6ff', '#ffe9c8'][i % 3];
      const r = hs(i + 4) > 0.96 ? 1.5 : 0.5 + hs(i + 4) * 0.8;
      g.fillRect(hs(i * 3.7) * W, y, r, r);
    }
    g.globalAlpha = 1;

    const moon = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      a: number,
      c: [string, string]
    ) => {
      g.save();
      g.translate(W * x, H * y);
      g.rotate(a);
      const m = g.createRadialGradient(-rx * 0.3, -ry * 0.3, 1, 0, 0, rx);
      m.addColorStop(0, c[0]);
      m.addColorStop(1, c[1]);
      g.shadowColor = 'rgba(255,220,190,.35)';
      g.shadowBlur = 14;
      g.beginPath();
      g.ellipse(0, 0, rx, ry, 0, 0, 7);
      g.fillStyle = m;
      g.fill();
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(40,30,30,.35)';
      g.beginPath();
      g.arc(rx * 0.3, ry * 0.1, rx * 0.22, 0, 7);
      g.arc(-rx * 0.35, -ry * 0.3, rx * 0.15, 0, 7);
      g.fill();
      g.restore();
    };
    moon(
      0.82,
      0.2,
      Math.max(9, W * 0.011),
      Math.max(7, W * 0.0085),
      0.5,
      ['#d8cbbd', '#6f6258']
    );
    moon(
      0.68,
      0.34,
      Math.max(4, W * 0.004),
      Math.max(3.5, W * 0.0036),
      0.2,
      ['#cbbfb1', '#665a50']
    );
  }

  const dust = Array.from({ length: 46 }, (_, i) => ({
    x: hs(i) * 2,
    y: hs(i + 99),
    r: 0.6 + hs(i + 5) * 1.6,
    z: 0.2 + hs(i + 9) * 0.8,
  }));

  function ridge(
    par: number,
    base: number,
    amp: number,
    haze: string,
    dark: string,
    off: number
  ) {
    const g = ctx!.createLinearGradient(0, H * base - amp * S, 0, H * base + amp * S * 1.2);
    g.addColorStop(0, 'rgba(' + haze + ',.42)');
    g.addColorStop(1, 'rgba(' + dark + ',1)');
    const pts: number[][] = [];
    for (let sx = 0; sx <= W + 8; sx += 6) {
      const u = (X + (sx - W * 0.46) / S) * par + off;
      const f = 0.8 * Math.sin(0.05 * u) + 0.45 * Math.sin(0.13 * u + 2) + 0.14 * Math.sin(0.27 * u + off);
      pts.push([sx, H * base - f * S * amp + camY * S * par * 0.5]);
    }
    const shape = (dy: number) => {
      ctx!.beginPath();
      ctx!.moveTo(0, H + 60);
      pts.forEach((p) => ctx!.lineTo(p[0], p[1] + dy));
      ctx!.lineTo(W + 8, H + 60);
      ctx!.closePath();
    };
    ctx!.fillStyle = 'rgb(' + haze + ')';
    ctx!.globalAlpha = 0.09;
    for (let k = 1; k <= 6; k++) {
      shape(-k * 6);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
    shape(0);
    ctx!.fillStyle = g;
    ctx!.fill();
  }

  function draw(t: number) {
    ctx!.setTransform(D, 0, 0, D, 0, 0);
    if (!skyC) mkSky();
    if (skyC) ctx!.drawImage(skyC, 0, 0, W, H);
    for (const q of twk) {
      const px = (((q.x * W - X * S * 0.01) % W) + W) % W;
      const py = q.y * H * 0.62;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * q.f + q.p));
      ctx!.globalAlpha = a;
      ctx!.fillStyle = q.c;
      ctx!.beginPath();
      ctx!.arc(px, py, q.r, 0, 7);
      ctx!.fill();
      if (q.r > 1.5) {
        ctx!.strokeStyle = q.c;
        ctx!.lineWidth = 0.6;
        ctx!.beginPath();
        ctx!.moveTo(px - q.r * 4 * a, py);
        ctx!.lineTo(px + q.r * 4 * a, py);
        ctx!.moveTo(px, py - q.r * 4 * a);
        ctx!.lineTo(px, py + q.r * 4 * a);
        ctx!.stroke();
      }
    }
    ctx!.globalAlpha = 1;
    const st = (t % 11) / 1.1;
    if (st < 1) {
      const sx0 = W * (0.2 + 0.5 * hs(Math.floor(t / 11)));
      const sy0 = H * 0.08 + H * 0.1 * hs(Math.floor(t / 11) + 3);
      const g = ctx!.createLinearGradient(
        sx0 + st * 260,
        sy0 + st * 110,
        sx0 + st * 260 - 90,
        sy0 + st * 110 - 38
      );
      g.addColorStop(0, 'rgba(255,240,220,.9)');
      g.addColorStop(1, 'rgba(255,240,220,0)');
      ctx!.strokeStyle = g;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath();
      ctx!.moveTo(sx0 + st * 260, sy0 + st * 110);
      ctx!.lineTo(sx0 + st * 260 - 90, sy0 + st * 110 - 38);
      ctx!.stroke();
    }
    const hz = ctx!.createLinearGradient(0, H * 0.38, 0, H * 0.68);
    hz.addColorStop(0, 'rgba(190,80,50,0)');
    hz.addColorStop(1, 'rgba(170,75,45,.22)');
    ctx!.fillStyle = hz;
    ctx!.fillRect(0, H * 0.38, W, H * 0.3);
    ridge(0.08, 0.6, 1.3, '105,48,46', '48,22,30', 3);
    ridge(0.2, 0.635, 1.1, '92,42,40', '36,17,24', 11);
    ridge(0.4, 0.665, 0.9, '74,34,32', '26,12,17', 23);
    const ms = ctx!.createLinearGradient(0, H * 0.5, 0, H * 0.7);
    ms.addColorStop(0, 'rgba(205,100,60,0)');
    ms.addColorStop(0.7, 'rgba(190,90,55,.05)');
    ms.addColorStop(1, 'rgba(205,100,60,0)');
    ctx!.fillStyle = ms;
    ctx!.fillRect(0, H * 0.5, W, H * 0.2);

    /* terrain */
    const rx = W * 0.46;
    const by = Math.min(H * 0.65, H - S * 1.7);
    const sxw = (x: number) => rx + (x - X) * S;
    const syw = (y: number) => by - (y - camY) * S;
    const pts: number[][] = [];
    for (let sx = -6; sx <= W + 6; sx += 3) pts.push([sx, syw(terr(X + (sx - rx) / S))]);
    const tg = ctx!.createLinearGradient(0, H * 0.5, 0, H);
    tg.addColorStop(0, '#d2652f');
    tg.addColorStop(0.35, '#9c4325');
    tg.addColorStop(1, '#3a1812');
    ctx!.beginPath();
    ctx!.moveTo(-6, H + 4);
    pts.forEach((p) => ctx!.lineTo(p[0], p[1]));
    ctx!.lineTo(W + 6, H + 4);
    ctx!.closePath();
    ctx!.fillStyle = tg;
    ctx!.fill();
    ctx!.save();
    ctx!.clip();
    for (let k = 1; k <= 7; k++) {
      ctx!.beginPath();
      pts.forEach((p, i) => {
        const y = p[1] + k * 0.34 * S + Math.sin((X + (p[0] - rx) / S) * 0.7 + k) * 3;
        if (i) ctx!.lineTo(p[0], y);
        else ctx!.moveTo(p[0], y);
      });
      ctx!.strokeStyle = `rgba(40,14,10,${0.32 - k * 0.03})`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
    }
    for (
      let c = Math.floor((X - rx / S) / 1.2) - 1;
      c < (X + (W - rx) / S) / 1.2 + 1;
      c++
    ) {
      if (hs(c * 5.1) > 0.45) {
        const x = c * 1.2 + hs(c + 1);
        const y = terr(x) - (0.35 + hs(c + 2) * 2.2);
        const r = (0.07 + hs(c + 3) * 0.2) * S;
        const px = sxw(x);
        const py = syw(y);
        ctx!.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * 6.283;
          const rr = r * (0.7 + hs(c * 7 + i) * 0.5);
          ctx!.lineTo(px + Math.cos(a) * rr * 1.3, py + Math.sin(a) * rr);
        }
        ctx!.closePath();
        ctx!.fillStyle = 'rgba(38,14,10,.7)';
        ctx!.fill();
        ctx!.strokeStyle = 'rgba(255,160,110,.25)';
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }
    ctx!.restore();
    ctx!.beginPath();
    pts.forEach((p, i) => (i ? ctx!.lineTo(p[0], p[1]) : ctx!.moveTo(p[0], p[1])));
    ctx!.strokeStyle = '#ffa06a';
    ctx!.lineWidth = 2.2;
    ctx!.shadowColor = 'rgba(255,140,80,.8)';
    ctx!.shadowBlur = 10;
    ctx!.stroke();
    ctx!.shadowBlur = 0;

    const cA = Math.floor((X - rx / S) / 1.7) - 2;
    const cB = Math.ceil((X + (W - rx) / S) / 1.7) + 2;
    for (let c = cA; c < cB; c++) {
      const b = bou(c);
      if (!b || b.ht < 0.08) continue;
      const n = 7;
      const v: number[][] = [];
      for (let i = 0; i <= n; i++) {
        const x = b.cx + (i / n - 0.5) * b.w * 3;
        const j = 1 + (hs(c * 9 + i) - 0.5) * 0.35;
        v.push([sxw(x), syw(terr(x)) - (i % 2 ? 0 : 3) * j]);
      }
      ctx!.beginPath();
      ctx!.moveTo(v[0][0], v[0][1] + 5);
      v.forEach((p) => ctx!.lineTo(p[0], p[1]));
      ctx!.lineTo(v[n][0], v[n][1] + 5);
      ctx!.closePath();
      ctx!.fillStyle = '#4a2217';
      ctx!.fill();
      ctx!.beginPath();
      v.slice(0, 5).forEach((p, i) => (i ? ctx!.lineTo(p[0], p[1]) : ctx!.moveTo(p[0], p[1])));
      ctx!.strokeStyle = 'rgba(255,175,120,.75)';
      ctx!.lineWidth = 1.4;
      ctx!.stroke();
    }

    for (let c = Math.floor((X - rx / S) / 0.9); c < (X + (W - rx) / S) / 0.9; c++) {
      if (hs(c * 3.3) > 0.5) {
        const x = c * 0.9 + hs(c) * 0.8;
        const s = (0.03 + Math.pow(hs(c + 4), 2) * 0.12) * S;
        const p = [sxw(x), syw(terr(x)) + 1];
        ctx!.beginPath();
        ctx!.moveTo(p[0] - s, p[1]);
        ctx!.lineTo(p[0] - s * 0.7, p[1] - s * 0.7);
        ctx!.lineTo(p[0] - s * 0.1, p[1] - s * 1.1);
        ctx!.lineTo(p[0] + s * 0.7, p[1] - s * 0.6);
        ctx!.lineTo(p[0] + s * 1.1, p[1]);
        ctx!.closePath();
        ctx!.fillStyle = '#3b1a12';
        ctx!.fill();
        ctx!.beginPath();
        ctx!.moveTo(p[0] - s * 0.7, p[1] - s * 0.7);
        ctx!.lineTo(p[0] - s * 0.1, p[1] - s * 1.1);
        ctx!.lineTo(p[0] + s * 0.7, p[1] - s * 0.6);
        ctx!.strokeStyle = 'rgba(255,170,120,.55)';
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }

    /* rover transform */
    const th = Ps[1];
    const c = Math.cos(th);
    const s = Math.sin(th);
    const L = (x: number, y: number) => [X + x * c - y * s, Ps[0] + x * s + y * c];

    const o = L(0.42, 0.03);
    const rays: number[][] = [];
    for (let i = 0; i <= 16; i++) {
      const a = th + 0.03 - i * 0.02;
      let x = o[0];
      let y = o[1];
      let d = 0;
      while (d < 4.8) {
        const nx = x + Math.cos(a) * 0.12;
        const ny = y + Math.sin(a) * 0.12;
        if (ny < terr(nx)) break;
        x = nx;
        y = ny;
        d += 0.12;
      }
      rays.push([sxw(x), syw(y)]);
    }
    const og = [sxw(o[0]), syw(o[1])];
    const bg = ctx!.createRadialGradient(og[0], og[1], 0, og[0], og[1], 4.8 * S);
    bg.addColorStop(0, 'rgba(255,200,140,.42)');
    bg.addColorStop(1, 'rgba(255,170,110,.04)');
    ctx!.beginPath();
    ctx!.moveTo(og[0], og[1]);
    rays.forEach((r) => ctx!.lineTo(r[0], r[1]));
    ctx!.closePath();
    ctx!.fillStyle = bg;
    ctx!.fill();
    ctx!.strokeStyle = 'rgba(255,220,170,.35)';
    ctx!.lineWidth = 1;
    ctx!.stroke();
    const sw = rays[Math.round((Math.sin(t * 1.5) * 0.5 + 0.5) * 16)];
    ctx!.beginPath();
    ctx!.moveTo(og[0], og[1]);
    ctx!.lineTo(sw[0], sw[1]);
    ctx!.strokeStyle = 'rgba(255,235,200,.7)';
    ctx!.lineWidth = 1.4;
    ctx!.stroke();
    ctx!.beginPath();
    ctx!.arc(sw[0], sw[1], 2.6, 0, 7);
    ctx!.fillStyle = '#ffe9c8';
    ctx!.fill();

    ctx!.save();
    ctx!.translate(rx, syw(Ps[0]));
    ctx!.scale(S, -S);
    ctx!.rotate(th);
    drawRover(t);
    ctx!.restore();

    /* dust */
    for (const d of dust) {
      const x = (((d.x * W - X * S * d.z * 0.35) % (W + 40)) + W + 40) % (W + 40) - 20;
      const y = d.y * H * 0.9 + Math.sin(t * 0.3 + d.x * 9) * 6;
      ctx!.globalAlpha = 0.12 * d.z;
      ctx!.fillStyle = '#ffc7a0';
      ctx!.beginPath();
      ctx!.arc(x, y, d.r, 0, 7);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
    const vg = ctx!.createRadialGradient(W / 2, H * 0.6, H * 0.4, W / 2, H * 0.6, H * 1.05);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(8,5,10,.55)');
    ctx!.fillStyle = vg;
    ctx!.fillRect(0, 0, W, H);
  }

  let last = performance.now();
  function frame(now: number) {
    const raw = Math.min((now - last) / 1000, 0.05);
    last = now;
    dtS += (raw - dtS) * 0.15;
    const dt = dtS;
    X += 0.95 * dt;
    for (let i = 0; i < 4; i++) step(0.8);
    const k = 1 - Math.exp(-dt * 16);
    for (let j = 0; j < 4; j++) Ps[j] += (P[j] - Ps[j]) * k;
    camY += (Ps[0] - camY) * (1 - Math.exp(-dt * 2.2));
    draw(now / 1000);
    animId = requestAnimationFrame(frame);
  }
  animId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', rs);
  };
}
