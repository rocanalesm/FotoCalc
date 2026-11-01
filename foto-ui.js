/* FotoCalc — interfaz: llena los desplegables, calcula al cambiar y dibuja la receta.
   Dos modos: digital (D810, D800) y analógico (FM10, F-601, F100 con rollos). */
(function () {
  const $ = id => document.getElementById(id);
  const state = { medium: 'digital', cam: 'd810', fcam: 'f100', film: 'portra400', ei: null, lens: 'z70200', scene: 'podio',
                  dist: null, orient: null, crop: 1, focal: null, ev: null, aperture: null };
  try { Object.assign(state, JSON.parse(localStorage.getItem('fotocalc.state') || '{}')); } catch (e) {}
  if (!CAMERAS[state.cam]) state.cam = 'd810';
  if (!FILM_CAMERAS[state.fcam]) state.fcam = 'f100';
  if (!FILMS[state.film]) state.film = 'portra400';
  if (!LENSES[state.lens]) state.lens = 'z70200';
  if (state.medium !== 'film') state.medium = 'digital';
  const save = () => { try { localStorage.setItem('fotocalc.state', JSON.stringify(state)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const film = () => state.medium === 'film';
  const scenesFor = () => SCENES.filter(s => !(film() && s.mode === 'astro'));
  const scene = () => scenesFor().find(s => s.id === state.scene) || scenesFor()[0];
  const L = o => (o && (o[LANG] || o.es)) || '';
  const fstop = N => 'f/' + (Number.isInteger(N) ? N : N.toString().replace('.', ','));
  const frac = x => { const a = Math.abs(x); return a < 0.5 ? '⅓' : (a < 0.83 ? '⅔' : fmtNum(a, 1).replace(',0', '')); };

  function eiOptions(f) {
    const o = [{ v: Math.round(f.iso / 2), k: 'ei.half' }, { v: f.iso, k: 'ei.box' }];
    (f.push || []).forEach(p => o.push({ v: p, k: 'ei.push', n: Math.round(Math.log2(p / f.iso)) }));
    (f.pull || []).forEach(p => o.push({ v: p, k: 'ei.pull' }));
    return o;
  }

  function fillSelects() {
    const cams = film() ? FILM_CAMERAS : CAMERAS;
    $('cam').innerHTML = Object.entries(cams).map(([k, c]) => `<option value="${k}">${esc(c.name)}</option>`).join('');
    $('cam').value = film() ? state.fcam : state.cam;
    const fc = FILM_CAMERAS[state.fcam];
    $('lens').innerHTML = Object.entries(LENSES).map(([k, l]) => {
      const bad = film() && fc.compat[l.mount] === 'no';
      return `<option value="${k}">${esc(l.name)}${bad ? ' — ' + esc(t('lens.incompat')) : ''}</option>`;
    }).join('');
    $('lens').value = state.lens;
    $('film').innerHTML = ['bw', 'c41'].map(kind => `<optgroup label="${esc(t('kind.' + kind))}">` +
      Object.entries(FILMS).filter(([, f]) => f.kind === kind).map(([k, f]) => `<option value="${k}">${esc(f.name)}</option>`).join('') + '</optgroup>').join('');
    $('film').value = state.film;
    const f = FILMS[state.film];
    $('ei').innerHTML = eiOptions(f).map(o => `<option value="${o.v}">EI ${o.v} · ${esc(t(o.k, { n: o.n }))}</option>`).join('');
    if (!eiOptions(f).some(o => o.v === state.ei)) state.ei = Math.round(f.iso / 2);
    $('ei').value = state.ei;
    const ss = scenesFor();
    if (!ss.find(s => s.id === state.scene)) state.scene = ss[0].id;
    $('scene').innerHTML = Object.keys(GROUPS).map(g =>
      `<optgroup label="${esc(L(GROUPS[g]))}">` +
      ss.filter(s => s.group === g).map(s => `<option value="${s.id}">${esc(L(s.name))}</option>`).join('') +
      `</optgroup>`).join('');
    $('scene').value = state.scene;
    $('aperture').innerHTML = `<option value="">${esc(t('ap.auto'))}</option>` +
      APERTURES.filter(a => a <= 16).map(a => `<option value="${a}">${fstop(a)}</option>`).join('');
    $('aperture').value = state.aperture || '';
    document.querySelectorAll('#medium button').forEach(b => b.classList.toggle('active', b.dataset.v === state.medium));
    $('film-wrap').style.display = film() ? '' : 'none';
    $('crop-wrap').style.display = film() ? 'none' : '';
    $('film-card').style.display = film() ? '' : 'none';
  }

  function syncFine() {
    const s = scene(), lens = LENSES[state.lens];
    $('dist').value = state.dist ?? s.dist;
    $('dist').disabled = s.mode === 'astro';
    document.querySelectorAll('#orient button').forEach(b => b.classList.toggle('active', b.dataset.v === (state.orient || s.orient)));
    document.querySelectorAll('#crop button').forEach(b => b.classList.toggle('active', +b.dataset.v === state.crop));
    const zoom = lens.fMin !== lens.fMax;
    $('focal-wrap').style.display = zoom ? '' : 'none';
    $('focal').min = lens.fMin; $('focal').max = lens.fMax;
    $('ev').value = state.ev ?? s.ev;
    $('ev').min = s.mode === 'astro' ? -9 : -2; $('ev').max = 17;
    $('ev').disabled = s.mode === 'astro';
  }

  function tile(lbl, val, sub, cls) {
    return `<div class="tile ${cls || ''}"><div class="tl">${esc(lbl)}</div><div class="tv">${val}</div>${sub ? `<div class="ts">${sub}</div>` : ''}</div>`;
  }
  function warnText(w) {
    let v = w.v;
    if (typeof v === 'number') {
      if (w.key === 'mfd') v = fmtNum(v, 2);
      else if (w.key === 'isoHigh' || w.key === 'isoExt' || w.key === 'filmBulb') v = Math.round(v);
      else if (w.key === 'filmDark') v = fmtNum(v, 1);
      else v = fmtNum(v, 1).replace(',0', '');
    }
    return t('warn.' + w.key, { v, from: w.from ? fmtNum(w.from, 1).replace(',0', '') : '' });
  }

  function renderFraming(r, s, lens) {
    let fr = '';
    if (s.mode === 'astro') return `<p>${esc(t('astro.note'))} · t ≈ ${fmtNum(r.tNPF, 1)} s</p>`;
    fr += `<p><strong>${esc(t('frame.size'))}</strong> ${fmtDist(r.frameW)} × ${fmtDist(r.frameH)} ${esc(t('frame.at'))} ${fmtDist(r.dist)}${r.close && r.mUse ? ' · ' + esc(t('frame.mag1', { m: fmtNum(r.mUse, 2) })) : ''}</p>`;
    let adv;
    if (r.framing === 'long') {
      adv = t('frame.long', { w: fmtNum(s.subjW, 1), fi: Math.round(r.fIdeal) }) + ' ' +
        (r.cropSuggest && r.cropSuggest > r.crop ? t(r.cropEnough ? 'frame.longCrop' : 'frame.longCropMove', { c: r.cropSuggest === 1.2 ? '1.2×' : 'DX', d: fmtDist(r.distSuggest) }) : t('frame.longMove', { d: fmtDist(r.distSuggest) }));
    } else if (r.framing === 'short') adv = t('frame.short', { fmin: lens.fMin, d: fmtDist(r.distSuggest) });
    else if (r.framing === 'mag') adv = t('frame.mag', { m: fmtNum(lens.maxMag, 2), w: fmtDist(r.minFrame) });
    else adv = t('frame.ok');
    fr += `<p class="${r.framing === 'ok' ? 'ok' : 'adv'}">${esc(adv)}</p>`;
    const d = r.dof;
    const tot = d.total < 1 ? Math.round(d.total * 1000) + ' mm' : (isFinite(d.total) ? fmtDist(d.total) : '∞');
    const fd = x => (isFinite(x) && x >= 10 && d.total < 3) ? fmtNum(x, 1) + ' m' : fmtDist(x);
    fr += `<div class="dofbar"><div class="dof-lbl">${esc(t('frame.dof'))}</div><div class="dof-val">${d.macro ? '' : fd(d.near) + ' → ' + fd(d.far) + ' · '}${esc(t('frame.dofTotal'))} ${tot}</div></div>`;
    if (!d.macro && isFinite(d.H)) fr += `<p class="muted">${esc(t('frame.hyper'))}: ${fmtDist(d.H)}</p>`;
    return fr;
  }

  function showCards(on) { ['frame-card', 'switch-card', 'tips-card', 'cam-card', 'recipe-extra'].forEach(id => $(id).style.display = on ? '' : 'none'); }

  function renderDigital() {
    const cam = CAMERAS[state.cam], lens = LENSES[state.lens], s = scene();
    const opt = { dist: state.dist, orient: state.orient, crop: state.crop, focal: state.focal, ev: state.ev, aperture: state.aperture ? +state.aperture : null };
    const r = computeRecipe(cam, lens, s, opt);
    showCards(true);
    if (lens.fMin !== lens.fMax) { $('focal').value = Math.round(r.f); $('focal-val').textContent = Math.round(r.f) + ' mm' + (state.focal ? '' : ' · ' + t('focal.auto')); }
    $('ev-val').textContent = s.mode === 'astro' ? '—' : t('ev.label', { ev: fmtNum(r.ev, 1) }) + ' · ' + evLabel(r.ev, LANG);

    const isoSub = s.mode === 'astro' ? t('iso.astro') : t('iso.' + r.isoMode);
    const fSub = r.crop > 1 ? (r.crop === 1.2 ? '1.2×' : 'DX') + ' ≈ ' + Math.round(r.f * r.crop) + ' mm' : '';
    const auto = r.isoMode === 'auto' && s.mode === 'hand';
    $('tiles').innerHTML =
      tile(t('tile.mode'), 'M', '', 't-mode') +
      tile(t('tile.ap'), fstop(r.N), '', 't-ap') +
      tile(t('tile.t'), r.bulb ? 'Bulb' : fmtShutter(r.t), r.bulb ? fmtNum(r.bulb, 0) + ' s' : '', 't-t') +
      tile(t('tile.iso'), auto ? 'AUTO' : String(r.iso), auto ? '≈ ' + r.iso + ' · ≤ 6400' : isoSub, 't-iso') +
      tile(t('tile.f'), Math.round(r.f) + ' mm', fSub, 't-f') +
      tile(t('tile.af'), r.af.mode, t('af.' + r.af.area), 't-af');
    const rows = [
      [t('row.meter'), t('meter.' + s.meter)], [t('row.mark'), L(s.mark)], [t('row.release'), t('rel.' + r.release)],
      [t('row.wb'), L(s.wb)], [t('row.picture'), L(cam.picture)], [t('row.indicator'), cam.indicator]];
    $('recipe-rows').innerHTML = rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');

    const warns = [];
    r.warnings.forEach(w => warns.push(['bad', warnText(w)]));
    r.notes.forEach(n => warns.push(['warn', t('note.' + n.key)]));
    if (r.antiShake) warns.push(['info', t('anti.' + r.antiShake)]);
    if (r.bulb) warns.push(['info', t('bulb', { s: Math.round(r.bulb) })]);
    if (s.mode === 'astro') warns.push(['info', t('astro.note')]);
    L(s.warn).forEach(w => warns.push(['warn', w]));
    if (lens.mount === 'AIS') warns.push(['info', t('note.digitalNoCPU')]);
    setWarns(warns);

    $('frame-body').innerHTML = renderFraming(r, s, lens);
    $('switches').innerHTML = r.switches.map(w => `<div class="sw"><span>${esc(t('sw.' + w.k))}</span><b>${esc(w.v)}</b></div>`).join('');
    $('lens-tip').textContent = L(lens.tip);
    $('cam-notes').innerHTML = L(cam.notes).map(n => `<li>${esc(n)}</li>`).join('');
    $('tips').innerHTML = L(s.tips).map(n => `<li>${esc(n)}</li>`).join('');

    const calc = [];
    if (s.mode !== 'astro') calc.push(t('calc.ev', { ev: fmtNum(r.ev, 1), lbl: evLabel(r.ev, LANG) }));
    if (s.mode === 'hand') {
      calc.push(t('calc.hand', { fe: Math.round(r.f * r.crop), t0: fmtShutter(r.tHand0) }));
      calc.push(lens.vr ? t('calc.vr', { s: r.vrEff, S: lens.vrStops, t: fmtShutter(Math.min(r.tHand, 30)) }) : t('calc.novr'));
      calc.push(t('calc.motion', { t: fmtShutter(r.tMotion) }));
    }
    r.calc.forEach(c => calc.push(c));
    if (r.coc) calc.push(t('calc.coc', { c: fmtNum(r.coc, 3) }));
    calc.push(t('calc.disclaimer'));
    $('calc-body').innerHTML = calc.map(c => `<div>${esc(c)}</div>`).join('');
  }

  function renderFilm() {
    const cam = FILM_CAMERAS[state.fcam], lens = LENSES[state.lens], s = scene(), f = FILMS[state.film];
    const opt = { dist: state.dist, orient: state.orient, focal: state.focal, ev: state.ev, aperture: state.aperture ? +state.aperture : null, ei: state.ei };
    const r = computeFilmRecipe(cam, lens, f, s, opt);
    $('ev-val').textContent = t('ev.label', { ev: fmtNum(state.ev ?? s.ev, 1) }) + ' · ' + evLabel(state.ev ?? s.ev, LANG);

    // ficha del rollo
    const rec = f.recip.type === 'pow' ? t('recip.pow', { p: fmtNum(f.recip.p, 2) }) : f.recip.type === 'table' ? t('recip.table', { pts: f.recip.pts.slice(1).map(([a, b]) => a + ' s ×' + fmtNum(b, 1).replace(',0', '')).join(' · ') })
      : f.recip.type === 'acros' ? t('recip.acros') : f.recip.type === 'test' ? t('recip.test') : t('recip.unknown');
    $('film-body').innerHTML = `<table class="props">
      <tr><td>${esc(t('film.type'))}</td><td>${esc(t('kind.' + f.kind))} · ISO ${f.iso}</td></tr>
      <tr><td>${esc(t('film.latitude'))}</td><td>${esc(L(f.latitude))}</td></tr>
      <tr><td>${esc(t('film.grain'))}</td><td>${esc(L(f.grain))}</td></tr>
      <tr><td>${esc(t('film.push'))}</td><td>${f.push && f.push.length ? 'EI ' + f.push.join(' · ') : esc(t('film.nopush'))}</td></tr>
      <tr><td>${esc(t('film.recip'))}</td><td>${esc(rec)}</td></tr></table>`;

    if (r.blocked) {
      showCards(false);
      $('tiles').innerHTML = `<div class="blocked">${esc(t('blocked.' + lens.mount, { cam: cam.name }))}</div>`;
      $('recipe-rows').innerHTML = '';
      setWarns([]);
      $('calc-body').innerHTML = '';
      return;
    }
    showCards(true);
    if (lens.fMin !== lens.fMax) { $('focal').value = Math.round(r.f); $('focal-val').textContent = Math.round(r.f) + ' mm' + (state.focal ? '' : ' · ' + t('focal.auto')); }

    const push = r.ei > f.iso ? Math.round(Math.log2(r.ei / f.iso)) : 0;
    const eiSub = r.ei === f.iso ? t('ei.box') : r.ei < f.iso ? (r.ei === Math.round(f.iso / 2) ? t('ei.half') : t('ei.pull')) : t('ei.push', { n: push });
    const apSub = r.ringTweak ? t(r.ringTweak > 0 ? 'ring.open' : 'ring.close', { x: frac(r.ringTweak) }) : '';
    $('tiles').innerHTML =
      tile(t('tile.mode'), 'M', '', 't-mode') +
      tile(t('tile.ap'), fstop(r.N), apSub, 't-ap') +
      tile(t('tile.t'), r.bulb ? 'B' : fmtShutter(r.t), r.bulb ? fmtNum(r.bulb, 0) + ' s' : (r.recip.kind === 'calc' ? t('recip.corr') : ''), 't-t') +
      tile('EI', String(r.ei), eiSub, 't-iso') +
      tile(t('tile.f'), Math.round(r.f) + ' mm', '', 't-f') +
      tile(t('tile.af'), r.af.mode, t('af.' + r.af.area), 't-af');
    const rows = [
      [t('row.meter'), t('meter.' + r.meter)], [t('row.mark'), L(s.mark)], [t('row.markHow'), L(cam.markHow)],
      [t('row.release'), t('rel.' + r.release)], [t('row.film'), f.name + ' · EI ' + r.ei],
      [t('row.sunny'), 'f/16 · 1/' + r.ei + ' (' + t('sunny.sub') + ')'], [t('row.indicator'), L(cam.indicator)]];
    $('recipe-rows').innerHTML = rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');

    const warns = [];
    r.warnings.forEach(w => warns.push(['bad', warnText(w)]));
    r.notes.forEach(n => warns.push([n.key === 'filmBulb' ? 'info' : 'warn', t('note.' + n.key, { v: n.v ? (n.key === 'filmStopDown' ? fmtNum(n.v, 1).replace(',0', '') : n.v) : '' })]));
    if (push) warns.push(['warn', t('note.push', { n: push })]);
    if (s.mode === 'tripod') warns.push(['info', t('anti.film')]);
    L(s.warn).forEach(w => { if (!/LED|VR OFF/.test(w)) warns.push(['warn', w]); });
    setWarns(warns);

    $('frame-body').innerHTML = renderFraming(r, s, lens);
    $('switches').innerHTML = r.switches.length ? r.switches.map(w => `<div class="sw"><span>${esc(t('sw.' + w.k))}</span><b>${esc(w.v === '@ring' ? fstop(r.N) : w.v)}</b></div>`).join('') : `<p class="muted">${esc(t('sw.none'))}</p>`;
    $('lens-tip').textContent = L(lens.tip);
    $('cam-notes').innerHTML = L(cam.notes).map(n => `<li>${esc(n)}</li>`).join('');
    $('tips').innerHTML = L(s.tips).map(n => `<li>${esc(n)}</li>`).join('');

    const calc = [t('calc.ev', { ev: fmtNum(r.ev, 1), lbl: evLabel(r.ev, LANG) })];
    if (s.mode === 'hand') {
      calc.push(t('calc.handFilm', { fe: Math.round(r.f), t0: fmtShutter(1 / (2 * r.f)) }));
      if (r.vrEff) calc.push(t('calc.vr', { s: r.vrEff, S: lens.vrStops, t: fmtShutter(r.tHand) }));
      calc.push(t('calc.motion', { t: fmtShutter(r.tMotion) }));
    }
    r.calc.forEach(c => calc.push(c));
    calc.push(t('calc.coc', { c: '0,03' }));
    calc.push(t('calc.disclaimer'));
    $('calc-body').innerHTML = calc.map(c => `<div>${esc(c)}</div>`).join('');
  }

  function setWarns(warns) {
    $('warn-card').style.display = warns.length ? '' : 'none';
    $('warn-list').innerHTML = warns.map(([c, w]) => `<li class="${c}">${esc(w)}</li>`).join('');
  }

  function render() { film() ? renderFilm() : renderDigital(); save(); }

  function resetFine() { state.dist = state.orient = state.focal = state.ev = state.aperture = null; $('aperture').value = ''; }

  function bind() {
    document.querySelectorAll('#medium button').forEach(b => b.onclick = () => { state.medium = b.dataset.v; fillSelects(); syncFine(); render(); });
    $('cam').onchange = e => { if (film()) state.fcam = e.target.value; else state.cam = e.target.value; fillSelects(); render(); };
    $('lens').onchange = e => { state.lens = e.target.value; state.focal = null; syncFine(); render(); };
    $('film').onchange = e => { state.film = e.target.value; state.ei = null; fillSelects(); render(); };
    $('ei').onchange = e => { state.ei = +e.target.value; render(); };
    $('scene').onchange = e => { state.scene = e.target.value; resetFine(); syncFine(); render(); };
    $('dist').oninput = e => { const v = parseFloat(String(e.target.value).replace(',', '.')); state.dist = v > 0 ? v : null; render(); };
    document.querySelectorAll('#orient button').forEach(b => b.onclick = () => { state.orient = b.dataset.v; syncFine(); render(); });
    document.querySelectorAll('#crop button').forEach(b => b.onclick = () => { state.crop = +b.dataset.v; syncFine(); render(); });
    $('focal').oninput = e => { state.focal = +e.target.value; render(); };
    $('ev').oninput = e => { state.ev = +e.target.value; render(); };
    $('aperture').onchange = e => { state.aperture = e.target.value || null; render(); };
    $('reset').onclick = () => { resetFine(); state.crop = 1; syncFine(); render(); };
    $('lang-toggle').onclick = () => { LANG = LANG === 'es' ? 'en' : 'es'; try { localStorage.setItem('fotocalc.lang', LANG); } catch (e) {} applyI18n(); fillSelects(); syncFine(); render(); };
  }

  applyI18n(); fillSelects(); syncFine(); bind(); render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
