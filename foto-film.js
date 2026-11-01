/* FotoCalc — modo analógico: cámaras de película, rollos y cálculo de la receta.
   Usa las funciones de foto-engine.js (dof, nearest, maxApFor, etc.).
   Fuentes de los rollos: hojas técnicas de Ilford, Kodak, Fujifilm y Foma;
   compatibilidad de objetivos: tabla oficial de Nikon (cámaras/objetivos).
*/

/* ------------------------------------------------------- CÁMARAS DE PELÍCULA */
const FULL_STOPS = [1/2000, 1/1000, 1/500, 1/250, 1/125, 1/60, 1/30, 1/15, 1/8, 1/4, 1/2, 1, 2, 4, 8, 15, 30];

const FILM_CAMERAS = {
  fm10: {
    name: 'Nikon FM10',
    fastest: 1/2000, slowest: 1, shutterSteps: 'full',
    meters: ['center'], af: false,
    compat: { G: 'no', E: 'no', D: 'mf', AIS: 'ok' },
    release: 'lever',
    indicator: { es: '3 LED: + / ○ / −', en: '3 LEDs: + / ○ / −' },
    markHow: { es: 'Gira la velocidad hasta el ○ solo; para +1 abre un paso (o una velocidad más lenta) desde ahí.', en: 'Turn the speed dial until only ○ lights; for +1 open one stop (or one slower speed) from there.' },
    notes: {
      es: ['Mecánica: dispara sin pilas (las LR44 solo alimentan el fotómetro). Sin pilas: Sunny 16.', 'Velocidades en pasos enteros de 1 a 1/2000 s; afina con el anillo de diafragma.', 'Más de 1 s: B con cable de rosca.', 'Fotómetro ponderado central, EV 2–19.'],
      en: ['Mechanical: fires without batteries (LR44s only power the meter). No batteries: Sunny 16.', 'Full-stop speeds from 1 s to 1/2000; fine-tune with the aperture ring.', 'Over 1 s: B with a screw-in cable.', 'Centre-weighted meter, EV 2–19.'] }
  },
  f601: {
    name: 'Nikon F-601',
    fastest: 1/2000, slowest: 30, shutterSteps: 'full',
    meters: ['matrix', 'center', 'spot'], af: true,
    compat: { G: 'no', E: 'no', D: 'ok', AIS: 'noCPU' },
    release: 'body',
    indicator: { es: '+ · · 0 · · − (±1 EV en tercios; fuera de rango ◀ ▶)', en: '+ · · 0 · · − (±1 EV in thirds; out of range ◀ ▶)' },
    markHow: { es: 'Dentro de ±1 lees directo (tres barras = 1 EV); más allá, cuenta clics del dial: cada clic es 1 EV.', en: 'Within ±1 read it directly (three bars = 1 EV); beyond that count dial clicks: each click is 1 EV.' },
    notes: {
      es: ['En M la velocidad va en pasos enteros (30 s a 1/2000); los tercios se afinan con el anillo.', 'Objetivos AF-D: anillo bloqueado en f/22, salvo en M y A, donde la apertura va en el anillo.', 'Deja el botón ± en 0 y compensa moviendo la marca.', 'Pila 2CR5; el ISO manual manda sobre el DX.'],
      en: ['In M shutter speeds are full stops (30 s to 1/2000); fine-tune thirds with the ring.', 'AF-D lenses: ring locked at f/22, except in M and A, where aperture is set on the ring.', 'Keep the ± button at 0 and compensate by moving the mark.', '2CR5 battery; manual ISO overrides DX.'] }
  },
  f100: {
    name: 'Nikon F100',
    fastest: 1/8000, slowest: 30, shutterSteps: 'third',
    meters: ['matrix', 'center', 'spot'], af: true, afs: true, vr: true,
    compat: { G: 'ok', E: 'no', D: 'ok', AIS: 'noCPU' },
    release: 'body',
    indicator: { es: '+ · · 0 · · − (±2 EV en tercios; flecha fuera de rango)', en: '+ · · 0 · · − (±2 EV in thirds; arrow beyond range)' },
    markHow: { es: 'Lees la marca directo en tercios hasta ±2 EV.', en: 'Read the mark directly in thirds up to ±2 EV.' },
    notes: {
      es: ['Dial principal = velocidad, secundario = diafragma (anillo de los AF-D bloqueado en f/22).', 'AF-S y VR funcionan; los objetivos E no.', 'Deja el botón ± en 0.0 y compensa con la marca.', 'No tiene espejo arriba: en trípode usa cable o autodisparador.'],
      en: ['Main dial = shutter, sub-dial = aperture (AF-D rings locked at f/22).', 'AF-S and VR work; E lenses do not.', 'Keep ± at 0.0 and compensate with the mark.', 'No mirror lock-up: on a tripod use a cable or the self-timer.'] }
  }
};

/* ------------------------------------------------------------------ ROLLOS
   recip: { type:'pow', p, start }  t_c = t_m^p desde 'start' s (Ilford)
          { type:'table', pts:[[t,f]...] } factor de multiplicación (Foma)
          { type:'acros' }                 nada hasta 120 s, +½ paso 120–1000 s
          { type:'test', until }           sin corrección hasta 'until' s; después, probar
          { type:'unknown' }               sin datos del fabricante
*/
const FILMS = {
  hp5:   { name: 'Ilford HP5 Plus 400', iso: 400, kind: 'bw', push: [800, 1600, 3200],
           recip: { type: 'pow', p: 1.31, start: 0.5 },
           latitude: { es: 'Muy tolerante: buena calidad de EI 400 a 3200 con el revelado adecuado (Ilford).', en: 'Very forgiving: good quality from EI 400 to 3200 with matching development (Ilford).' },
           grain: { es: 'Grano clásico, moderado', en: 'Classic, moderate grain' } },
  fp4:   { name: 'Ilford FP4 Plus 125', iso: 125, kind: 'bw', push: [200], pull: [50],
           recip: { type: 'pow', p: 1.26, start: 0.5 },
           latitude: { es: 'Hasta 6 pasos de sobreexposición y 2 de subexposición (Ilford).', en: 'Up to 6 stops over and 2 under (Ilford).' },
           grain: { es: 'Grano muy fino', en: 'Very fine grain' } },
  acros: { name: 'Fujifilm Neopan Acros II 100', iso: 100, kind: 'bw', push: [200],
           recip: { type: 'acros' },
           latitude: { es: 'Fujifilm no da cifra; tabla de revelado de EI 80 a 200.', en: 'No figure from Fujifilm; development table from EI 80 to 200.' },
           grain: { es: 'Grano finísimo (RMS 7); ortopancromática', en: 'Ultra-fine grain (RMS 7); orthopanchromatic' } },
  foma100: { name: 'Fomapan 100 Classic', iso: 100, kind: 'bw', push: [200, 400],
           recip: { type: 'table', pts: [[0.5, 1], [1, 2], [10, 8], [100, 16]] },
           latitude: { es: 'De +1 (EI 50) a −2 (EI 400) sin cambiar el revelado (Foma).', en: 'From +1 (EI 50) to −2 (EI 400) with normal development (Foma).' },
           grain: { es: 'Grano fino (RMS 13,5)', en: 'Fine grain (RMS 13.5)' } },
  foma200: { name: 'Fomapan 200 Creative', iso: 200, kind: 'bw', push: [400, 800],
           recip: { type: 'table', pts: [[0.5, 1], [1, 3], [10, 9], [100, 18]] },
           latitude: { es: 'De +1 (EI 100) a −2 (EI 800) sin cambiar el revelado (Foma).', en: 'From +1 (EI 100) to −2 (EI 800) with normal development (Foma).' },
           grain: { es: 'Grano fino (RMS 14)', en: 'Fine grain (RMS 14)' } },
  foma400: { name: 'Fomapan 400 Action', iso: 400, kind: 'bw', push: [800, 1600],
           recip: { type: 'table', pts: [[0.5, 1], [1, 1.5], [10, 6], [100, 8]] },
           latitude: { es: 'De +1 (EI 200) a −2 (EI 1600) sin cambiar el revelado (Foma).', en: 'From +1 (EI 200) to −2 (EI 1600) with normal development (Foma).' },
           grain: { es: 'Grano visible (RMS 17,5)', en: 'Visible grain (RMS 17.5)' } },
  colorplus: { name: 'Kodak ColorPlus 200', iso: 200, kind: 'c41', push: [],
           recip: { type: 'unknown' },
           latitude: { es: 'Sin hoja técnica vigente; como todo negativo color, tolera bien la sobreexposición.', en: 'No current datasheet; like any colour negative it handles overexposure well.' },
           grain: { es: 'Económica, cálida y con grano', en: 'Budget, warm and grainy' } },
  fuji200: { name: 'Fujifilm 200', iso: 200, kind: 'c41', push: [],
           recip: { type: 'unknown' },
           latitude: { es: 'Amplia latitud según el distribuidor; resultados muy parecidos a Kodak Gold 200 (no confirmado por Fujifilm).', en: 'Wide latitude per the retailer; results very close to Kodak Gold 200 (not confirmed by Fujifilm).' },
           grain: { es: 'Colores cálidos, grano moderado', en: 'Warm colours, moderate grain' } },
  ultramax: { name: 'Kodak UltraMax 400', iso: 400, kind: 'c41', push: [800],
           recip: { type: 'test', until: 1 },
           latitude: { es: 'Kodak destaca su protección ante la subexposición.', en: 'Kodak highlights its underexposure protection.' },
           grain: { es: 'Grano visible (índice 46), colores saturados', en: 'Visible grain (index 46), saturated colours' } },
  portra160: { name: 'Kodak Portra 160', iso: 160, kind: 'c41', push: [],
           recip: { type: 'test', until: 1 },
           latitude: { es: 'Amplia; la más fina de las Portra.', en: 'Wide; the finest-grained Portra.' },
           grain: { es: 'Grano muy fino (índice 28), piel natural', en: 'Very fine grain (index 28), natural skin' } },
  portra400: { name: 'Kodak Portra 400', iso: 400, kind: 'c41', push: [800],
           recip: { type: 'test', until: 1 },
           latitude: { es: 'Pruebas independientes: 2–3 pasos bajo y hasta +6 sobre. Clásico: EI 200.', en: 'Independent tests: 2–3 stops under and up to +6 over. Classic: EI 200.' },
           grain: { es: 'Grano fino (índice 37), piel suave', en: 'Fine grain (index 37), soft skin' } },
  portra800: { name: 'Kodak Portra 800', iso: 800, kind: 'c41', push: [1600, 3200],
           recip: { type: 'test', until: 1 },
           latitude: { es: 'La mejor latitud a la subexposición de su clase (Kodak); forzado a 1600 y 3200 previsto.', en: 'Best-in-class underexposure latitude (Kodak); push to 1600 and 3200 supported.' },
           grain: { es: 'Grano visible (índice 48)', en: 'Visible grain (index 48)' } },
  lucky200: { name: 'Lucky Color 200', iso: 200, kind: 'c41', push: [],
           recip: { type: 'unknown' },
           latitude: { es: 'Película nueva (2025): sin hoja técnica publicada.', en: 'New film (2025): no published datasheet.' },
           grain: { es: 'Rojos intensos, contraste alto, aire noventero', en: 'Strong reds, high contrast, 90s look' } }
};

/* ---------------------------------------------------------------- cálculo */
function reciprocity(film, tm) {
  const r = film.recip;
  if (tm <= 0.5) return { tc: tm, kind: 'none' };
  if (r.type === 'pow') return tm <= r.start ? { tc: tm, kind: 'none' } : { tc: Math.pow(tm, r.p), kind: 'calc' };
  if (r.type === 'table') {
    const p = r.pts; let f = p[p.length - 1][1];
    for (let i = 0; i < p.length - 1; i++) if (tm <= p[i + 1][0]) {
      const x = (Math.log(tm) - Math.log(p[i][0])) / (Math.log(p[i + 1][0]) - Math.log(p[i][0]));
      f = Math.exp(Math.log(p[i][1]) + x * (Math.log(p[i + 1][1]) - Math.log(p[i][1]))); break;
    }
    return { tc: tm * f, kind: 'calc' };
  }
  if (r.type === 'acros') return tm < 120 ? { tc: tm, kind: 'none' } : { tc: tm * Math.SQRT2, kind: 'calc' };
  if (r.type === 'test') return tm <= r.until ? { tc: tm, kind: 'none' } : { tc: tm, kind: 'test' };
  return { tc: tm, kind: tm > 1 ? 'unknown' : 'none' };
}

function filmShutters(cam) {
  if (cam.shutterSteps === 'third') return SHUTTERS.filter(s => s >= cam.fastest - 1e-9 && s <= cam.slowest);
  return FULL_STOPS.filter(s => s >= cam.fastest - 1e-9 && s <= cam.slowest + 1e-9);
}

function computeFilmRecipe(cam, lens, film, scene, opt) {
  const out = { notes: [], warnings: [], calc: [], film: true };
  const compat = cam.compat[lens.mount];
  out.compat = compat;
  if (compat === 'no') { out.blocked = true; return out; }

  // focal, encuadre y PdC: igual que en digital (con c = 0,03 mm de película)
  const base = computeRecipe({ isoBase: 100, isoMaxGood: 1e9, isoMaxExt: 1e9, fastest: cam.fastest, slowest: cam.slowest, pitch: 5, groupAF: false, efcs: false, isoAutoComp: false },
    lens, scene, Object.assign({}, opt, { crop: 1 }));
  ['f', 'fIdeal', 'dist', 'orient', 'crop', 'frameW', 'frameH', 'framing', 'cropSuggest', 'cropEnough', 'distSuggest', 'close', 'mReq', 'mUse', 'minFrame', 'tHand0', 'tHand', 'tMotion', 'vrEff'].forEach(k => out[k] = base[k]);
  base.warnings.filter(w => w.key === 'mfd' || w.key === 'diffraction').forEach(w => out.warnings.push(w));
  out.cropSuggest = null; out.crop = 1;
  if (out.framing === 'long') out.cropEnough = false;

  // VR y AF-S según cámara
  const vrWorks = lens.vr && cam.vr;
  if (lens.vr && !cam.vr) out.notes.push({ key: 'filmNoVR' });
  if (lens.afs && !cam.afs) out.notes.push({ key: 'filmNoAFS' });
  if (compat === 'noCPU') out.notes.push({ key: 'filmNoCPU' });
  if (compat === 'mf') out.notes.push({ key: 'filmMF' });

  const ev = (opt.ev !== undefined && opt.ev !== null) ? opt.ev : scene.ev;
  const EI = opt.ei || Math.round(film.iso / 2);
  out.ev = ev; out.ei = EI; out.isoMode = 'film';

  const apMax = maxApFor(lens, out.f);
  let N = scene.ap === 'wide' ? apMax : Math.max(scene.ap, apMax);
  if (opt.aperture) N = Math.max(opt.aperture, apMax);
  N = apertureAtLeast(N);
  const list = filmShutters(cam);
  const fe = out.f;
  const vrEff = vrWorks ? (out.mUse > 0.3 ? 1 : 3) : 0;
  const tHand = (1 / (2 * fe)) * Math.pow(2, vrEff);
  out.tHand = tHand; out.vrEff = vrEff;
  const need = n => n * n * 100 / (EI * Math.pow(2, ev));     // tiempo medido para N

  let t;
  if (scene.mode === 'hand') {
    const tLimit = Math.min(tHand, out.tMotion);
    out.limitBy = tHand < out.tMotion ? 'hand' : 'motion';
    let tm = need(N);
    if (tm > tLimit && N > apMax + 0.01) { N = apertureAtLeast(apMax); tm = need(N); }
    if (tm > tLimit * 1.15) {
      const stops = Math.log2(tm / tLimit);
      out.warnings.push({ key: 'filmDark', v: stops });
      t = tm;
    } else if (tm < cam.fastest) {
      // demasiada luz: cerrar el diafragma
      const Nn = Math.sqrt(cam.fastest * EI * Math.pow(2, ev) / 100);
      const N2 = apertureAtLeast(Nn);
      if (N2 > lens.minAp) out.warnings.push({ key: 'filmBright', v: lens.minAp });
      else if (N2 > N) out.notes.push({ key: 'filmStopDown', v: N2 });
      N = Math.min(N2, lens.minAp); t = cam.fastest; tm = need(N);
    } else t = tm;
    out.tMeter = tm;
  } else {
    t = need(N); out.tMeter = t;
  }

  // velocidad del dial de la cámara + reciprocidad
  let tc = t, rec = { kind: 'none' };
  if (t > 0.5) { rec = reciprocity(film, t); tc = rec.tc; }
  out.recip = rec; out.tCorr = tc;
  if (tc > cam.slowest) { out.bulb = tc; out.t = tc; }
  else {
    const pick = nearest(list, tc);
    out.t = pick;
    if (cam.shutterSteps === 'full') {
      const diff = Math.log2(tc / pick);                      // + = falta exposición
      if (Math.abs(diff) > 0.17) out.ringTweak = diff;        // afinar con el anillo
    }
  }
  out.N = N;
  out.calc.push('t = N² · 100 / (EI · 2^EV) = ' + fmtNum(N * N, 1) + ' · 100 / (' + EI + ' · 2^' + fmtNum(ev, 1) + ') = ' + (out.tMeter >= 0.3 ? fmtNum(out.tMeter, 1) + ' s' : '1/' + Math.round(1 / out.tMeter)));
  if (rec.kind === 'calc') out.calc.push('Reciprocidad: ' + fmtNum(out.tMeter, 1) + ' s → ' + fmtNum(tc, 1) + ' s');
  if (rec.kind === 'test') out.warnings.push({ key: 'recipTest' });
  if (rec.kind === 'unknown') out.warnings.push({ key: 'recipUnknown' });
  if (out.bulb) out.notes.push({ key: 'filmBulb', v: Math.round(out.bulb) });

  // Sunny 16 de referencia
  out.sunny = { N: 16, t: 1 / EI };

  // PdC con c = 0,03 mm
  out.coc = 0.03;
  if (out.close && out.mUse) {
    const m = out.mUse, tot = 2 * N * 0.00003 * (m + 1) / (m * m);
    out.dof = { near: out.dist - tot / 2, far: out.dist + tot / 2, total: tot, H: Infinity, macro: true };
  } else out.dof = dof(out.f, N, out.dist, 0.03);

  // interruptores
  const sw = [];
  if (!lens.manualFocus) sw.push({ k: 'focusMode', v: (cam.af && (!lens.afs || cam.afs) && compat !== 'mf') ? 'M/A' : 'M' });
  if (lens.limiter) sw.push({ k: 'limiter', v: (scene.id !== 'detalle' && scene.id !== 'macro' && out.dist >= lens.limiter.threshold * 1.05) ? lens.limiter.values[1] : lens.limiter.values[0] });
  if (lens.vr) sw.push({ k: 'vr', v: vrWorks && scene.mode === 'hand' ? 'ON' : 'OFF' });
  if (lens.vr && lens.vrModes && vrWorks && scene.mode === 'hand') sw.push({ k: 'vrMode', v: 'NORMAL' });
  if (lens.mount === 'D' && cam.af && compat === 'ok') sw.push({ k: 'ring', v: cam === FILM_CAMERAS.f601 ? '@ring' : 'f/22' });
  out.switches = sw;

  // medición, AF, disparo
  let meter = scene.meter;
  if (!cam.meters.includes(meter) || (meter === 'matrix' && compat !== 'ok')) meter = 'center';
  out.meter = meter;
  const afOn = cam.af && compat === 'ok' && !(lens.afs && !cam.afs) && !lens.manualFocus;
  out.af = afOn ? { mode: scene.af.mode === 'MF' ? 'MF' : scene.af.mode, area: cam === FILM_CAMERAS.f100 ? (scene.af.area === 'single' || scene.af.area === 'manual' ? 'single' : 'dynamic') : 'single' } : { mode: 'MF', area: 'split' };
  out.release = cam.release === 'lever' ? 'lever' : (scene.release === 'CH' || scene.release === 'CL' ? 'C' : (scene.release === 'MUP' ? 'timer' : 'S'));
  if (scene.iso === 'auto') out.notes.push({ key: 'filmNoAutoISO' });
  return out;
}

if (typeof module !== 'undefined') module.exports = { FILM_CAMERAS, FILMS, computeFilmRecipe, reciprocity };
