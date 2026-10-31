/* FotoCalc — motor de cálculo.
   Recibe cámara, objetivo, situación y ajustes, y devuelve la receta en modo M.
   Funciones puras: se pueden probar con node (module.exports al final).
*/

const SHUTTERS = [ // segundos, pasos de 1/3
  1/8000,1/6400,1/5000,1/4000,1/3200,1/2500,1/2000,1/1600,1/1250,1/1000,1/800,1/640,1/500,1/400,1/320,
  1/250,1/200,1/160,1/125,1/100,1/80,1/60,1/50,1/40,1/30,1/25,1/20,1/15,1/13,1/10,1/8,1/6,1/5,1/4,
  0.3,0.4,0.5,0.6,0.8,1,1.3,1.6,2,2.5,3,4,5,6,8,10,13,15,20,25,30];
const APERTURES = [1.4,1.6,1.8,2,2.2,2.5,2.8,3.2,3.5,4,4.5,5,5.6,6.3,7.1,8,9,10,11,13,14,16,18,20,22,25,29,32];
const ISOS = [32,40,50,64,80,100,125,160,200,250,320,400,500,640,800,1000,1250,1600,2000,2500,3200,4000,5000,6400,8000,10000,12800,16000,20000,25600];

const log2 = x => Math.log(x) / Math.LN2;

/* El tiempo estándar más largo que no supera t (más rápido o igual). */
function shutterAtMost(t) {
  for (let i = SHUTTERS.length - 1; i >= 0; i--) if (SHUTTERS[i] <= t * 1.04) return SHUTTERS[i];
  return SHUTTERS[0];
}
function nearest(list, v) {
  let best = list[0], bd = Infinity;
  for (const x of list) { const d = Math.abs(log2(x) - log2(v)); if (d < bd) { bd = d; best = x; } }
  return best;
}
function apertureAtLeast(N) { for (const a of APERTURES) if (a >= N - 0.05) return a; return APERTURES[APERTURES.length - 1]; }

function fmtShutter(t) {
  if (t >= 0.3) return (Math.round(t * 10) / 10).toString().replace('.', ',') + ' s';
  return '1/' + Math.round(1 / t);
}
function fmtNum(x, d = 1) { return x.toFixed(d).replace('.', ','); }
function fmtDist(m) {
  if (!isFinite(m)) return '∞';
  if (m >= 100) return Math.round(m) + ' m';
  if (m >= 10) return fmtNum(m, 0) + ' m';
  if (m >= 1) return fmtNum(m, 1) + ' m';
  return Math.round(m * 100) + ' cm';
}

/* Profundidad de campo (fórmulas clásicas, en metros). c en mm. */
function dof(fmm, N, distM, cmm) {
  const f = fmm / 1000, c = cmm / 1000, s = distM;
  const H = f * f / (N * c) + f;
  const near = s * (H - f) / (H + s - 2 * f);
  const far = s >= H ? Infinity : s * (H - f) / (H - s);
  return { H, near, far, total: far - near };
}

/* ----------------------------------------------------------------- receta */
function computeRecipe(cam, lens, scene, opt) {
  const k = opt.crop || 1;                       // 1 · 1.2 · 1.5
  const orient = opt.orient || scene.orient;
  const sideMM = (orient === 'v' ? 24 : 36) / k;
  const dist = opt.dist || scene.dist;
  const ev = (opt.ev !== undefined && opt.ev !== null) ? opt.ev : scene.ev;
  const out = { notes: [], warnings: [], calc: [] };

  /* 1 · Focal y encuadre */
  const fIdeal = sideMM * dist / scene.subjW;
  let f = lens.fMin === lens.fMax ? lens.fMin : Math.min(Math.max(opt.focal || fIdeal, lens.fMin), lens.fMax);
  if (opt.focal && lens.fMin !== lens.fMax) f = Math.min(Math.max(opt.focal, lens.fMin), lens.fMax);
  out.fIdeal = fIdeal; out.f = f; out.dist = dist; out.orient = orient; out.crop = k;
  const fw = 36 / k, fh = 24 / k;
  out.frameW = fw * dist / f; out.frameH = fh * dist / f;
  out.framing = 'ok';
  const close = dist <= 2 && scene.mode !== 'astro';
  out.close = close;
  if (scene.mode === 'astro') {
    out.framing = 'na';
  } else if (close) {
    // primer plano: manda la ampliación, no la fórmula del infinito
    const mReq = sideMM / (scene.subjW * 1000);
    out.mReq = mReq;
    if (mReq > lens.maxMag * 1.05) {
      out.framing = 'mag';
      out.minFrame = sideMM / lens.maxMag / 1000;        // m
      out.mUse = lens.maxMag;
    } else out.mUse = mReq;
    if (lens.fMin !== lens.fMax && !opt.focal) { f = lens.fMax; out.f = f; }   // en primer plano, el zoom al máximo
    out.frameW = (36 / k) / out.mUse / 1000; out.frameH = (24 / k) / out.mUse / 1000;
  } else if (fIdeal > lens.fMax * 1.08) {
    out.framing = 'long';
    const kNeed = fIdeal / lens.fMax * k;
    out.cropSuggest = kNeed <= 1.25 ? 1.2 : 1.5;
    out.cropEnough = kNeed <= 1.55;
    const kUse = Math.max(k, out.cropSuggest);
    out.distSuggest = lens.fMax * scene.subjW / ((orient === 'v' ? 24 : 36) / kUse);
  } else if (fIdeal < lens.fMin * 0.92) {
    out.framing = 'short';
    out.distSuggest = lens.fMin * scene.subjW / ((orient === 'v' ? 24 : 36) / k);
  }
  if (dist < lens.mfd && scene.mode !== 'astro') { out.warnings.push({ key: 'mfd', v: lens.mfd }); }

  /* 2 · Apertura */
  let N = scene.ap === 'wide' ? lens.maxAp : Math.max(scene.ap, lens.maxAp);
  if (opt.aperture) N = Math.max(opt.aperture, lens.maxAp);
  N = apertureAtLeast(N);
  if (N > 11) out.warnings.push({ key: 'diffraction', v: N });

  /* 3 · Velocidad e ISO */
  const fe = f * k;                                // focal equivalente en el recorte
  const mag = out.close ? (out.mUse || 0) : 0;
  const vrEff = lens.vr ? (mag > 0.3 ? 1 : 3) : 0; // pasos de VR que usamos (conservador con 36 MP)
  const tHand0 = 1 / (2 * fe);
  const tHand = tHand0 * Math.pow(2, vrEff);
  const tMotion = 1 / scene.motion;
  out.tHand0 = tHand0; out.tHand = tHand; out.tMotion = tMotion; out.vrEff = vrEff; out.mag = mag;

  let t, iso, isoMode = scene.iso;
  const K = N * N;                                 // N²
  if (scene.mode === 'astro') {
    iso = 3200;
    const tNPF = (35 * N + 30 * cam.pitch) / fe;
    t = shutterAtMost(tNPF);
    out.tNPF = tNPF;
    out.calc.push('NPF: t = (35·N + 30·p) / f = (35·' + fmtNum(N, 1) + ' + 30·' + fmtNum(cam.pitch, 2) + ') / ' + Math.round(fe) + ' = ' + fmtNum(tNPF, 1) + ' s');
  } else if (scene.mode === 'tripod') {
    iso = cam.isoBase;
    let tReq = K * 100 / (iso * Math.pow(2, ev));
    if (mag > 0.1) { const bf = Math.pow(1 + mag, 2); tReq *= bf; out.bellows = bf; out.calc.push('Primer plano: factor (1 + m)² = ' + fmtNum(bf, 2) + ' (+' + fmtNum(log2(bf), 1) + ' EV)'); }
    out.tExact = tReq;
    if (tReq > cam.slowest) { out.bulb = tReq; t = tReq; }
    else t = nearest(SHUTTERS, tReq);
    out.calc.push('t = N² · 100 / (ISO · 2^EV) = ' + fmtNum(K, 1) + ' · 100 / (' + iso + ' · 2^' + fmtNum(ev, 1) + ') = ' + (tReq >= 0.3 ? fmtNum(tReq, 1) + ' s' : '1/' + Math.round(1 / tReq)));
  } else {
    t = shutterAtMost(Math.min(tHand, tMotion));
    out.limitBy = tHand < tMotion ? 'hand' : 'motion';
    let isoReq = 100 * K / (t * Math.pow(2, ev));
    out.calc.push('ISO = 100 · N² / (t · 2^EV) = 100 · ' + fmtNum(K, 1) + ' / (' + fmtShutter(t) + ' · 2^' + fmtNum(ev, 1) + ') = ' + Math.round(isoReq));
    if (isoReq < cam.isoBase) {
      // demasiada luz: más rápido; si no alcanza, cerrar el diafragma
      iso = cam.isoBase;
      let tReq = K * 100 / (iso * Math.pow(2, ev));
      if (tReq < cam.fastest) {
        const Nneed = Math.sqrt(cam.fastest * iso * Math.pow(2, ev) / 100);
        const N2 = apertureAtLeast(Nneed);
        out.warnings.push({ key: 'tooBright', v: N2, from: N });
        N = N2; t = cam.fastest;
      } else t = nearest(SHUTTERS, tReq);
      out.calc.push('ISO base ' + cam.isoBase + ' → t = ' + fmtShutter(t));
    } else {
      iso = nearest(ISOS, isoReq);
      if (iso > cam.isoMaxExt) { out.warnings.push({ key: 'isoExt', v: iso }); iso = cam.isoMaxExt; }
      else if (iso > cam.isoMaxGood) out.warnings.push({ key: 'isoHigh', v: iso });
    }
    if (out.limitBy === 'hand' && tHand < tMotion * 0.8) out.notes.push({ key: 'handLimit' });
  }
  out.N = N; out.t = t; out.iso = iso; out.ev = ev; out.isoMode = isoMode;

  /* 4 · Profundidad de campo (c = 0,02 mm para 36 MP, escalado por el recorte) */
  if (scene.mode !== 'astro') {
    const c = 0.02 / k;
    out.coc = c;
    if (out.close && out.mUse) {
      const m = out.mUse, tot = 2 * N * (c / 1000) * (m + 1) / (m * m);   // m
      out.dof = { near: dist - tot / 2, far: dist + tot / 2, total: tot, H: Infinity, macro: true };
    } else out.dof = dof(f, N, dist, c);
  }

  /* 5 · Interruptores del objetivo */
  const sw = [];
  sw.push({ k: 'focusMode', v: 'M/A' });
  if (lens.limiter) {
    const useLim = scene.id !== 'detalle' && scene.id !== 'macro' && dist >= lens.limiter.threshold * 1.05;
    sw.push({ k: 'limiter', v: useLim ? lens.limiter.values[1] : lens.limiter.values[0] });
  }
  if (lens.vr) {
    sw.push({ k: 'vr', v: scene.mode === 'hand' ? 'ON' : 'OFF' });
    if (lens.vrModes && scene.mode === 'hand') sw.push({ k: 'vrMode', v: 'NORMAL' });
  }
  out.switches = sw;

  /* 6 · AF y disparo según cámara */
  let area = scene.af.area;
  if (area === 'group' && !cam.groupAF) area = 'dyn9';
  out.af = { mode: scene.af.mode, area };
  out.release = scene.release;
  if (scene.mode !== 'hand') out.antiShake = cam.efcs ? 'efcs' : 'mup';
  if (isoMode === 'auto' && !cam.isoAutoComp) out.notes.push({ key: 'd800comp' });
  return out;
}

if (typeof module !== 'undefined') module.exports = { computeRecipe, dof, fmtShutter, fmtNum, fmtDist, nearest, SHUTTERS, ISOS, APERTURES };
