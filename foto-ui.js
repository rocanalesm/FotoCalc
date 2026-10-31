/* FotoCalc — interfaz: llena los desplegables, calcula al cambiar y dibuja la receta. */
(function () {
  const $ = id => document.getElementById(id);
  const state = { cam: 'd810', lens: 'z70200', scene: 'podio', dist: null, orient: null, crop: 1, focal: null, ev: null, aperture: null };
  try { Object.assign(state, JSON.parse(localStorage.getItem('fotocalc.state') || '{}')); } catch (e) {}
  if (!CAMERAS[state.cam]) state.cam = 'd810';
  if (!LENSES[state.lens]) state.lens = 'z70200';
  if (!SCENES.find(s => s.id === state.scene)) state.scene = 'podio';
  const save = () => { try { localStorage.setItem('fotocalc.state', JSON.stringify(state)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const scene = () => SCENES.find(s => s.id === state.scene);
  const L = o => (o && (o[LANG] || o.es)) || '';
  const { fmtShutter, fmtNum, fmtDist } = { fmtShutter: window.fmtShutter, fmtNum: window.fmtNum, fmtDist: window.fmtDist };
  const fstop = N => 'f/' + (Number.isInteger(N) ? N : N.toString().replace('.', ','));

  function fillSelects() {
    $('cam').innerHTML = Object.entries(CAMERAS).map(([k, c]) => `<option value="${k}">${esc(c.name)}</option>`).join('');
    $('lens').innerHTML = Object.entries(LENSES).map(([k, l]) => `<option value="${k}">${esc(l.name)}</option>`).join('');
    $('scene').innerHTML = Object.keys(GROUPS).map(g =>
      `<optgroup label="${esc(L(GROUPS[g]))}">` +
      SCENES.filter(s => s.group === g).map(s => `<option value="${s.id}">${esc(L(s.name))}</option>`).join('') +
      `</optgroup>`).join('');
    $('aperture').innerHTML = `<option value="">${esc(t('ap.auto'))}</option>` +
      APERTURES.filter(a => a <= 16).map(a => `<option value="${a}">${fstop(a)}</option>`).join('');
    $('cam').value = state.cam; $('lens').value = state.lens; $('scene').value = state.scene;
    $('aperture').value = state.aperture || '';
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

  function render() {
    const cam = CAMERAS[state.cam], lens = LENSES[state.lens], s = scene();
    const opt = { dist: state.dist, orient: state.orient, crop: state.crop, focal: state.focal, ev: state.ev, aperture: state.aperture ? +state.aperture : null };
    const r = computeRecipe(cam, lens, s, opt);

    // valores visibles de los ajustes finos
    if (lens.fMin !== lens.fMax) { $('focal').value = Math.round(r.f); $('focal-val').textContent = Math.round(r.f) + ' mm' + (state.focal ? '' : ' · ' + t('focal.auto')); }
    $('ev-val').textContent = s.mode === 'astro' ? '—' : t('ev.label', { ev: fmtNum(r.ev, 1) }) + ' · ' + evLabel(r.ev, LANG);

    /* Receta */
    const isoSub = s.mode === 'astro' ? t('iso.astro') : t('iso.' + r.isoMode);
    let tVal = r.bulb ? 'Bulb' : fmtShutter(r.t);
    const fSub = r.crop > 1 ? (r.crop === 1.2 ? '1.2×' : 'DX') + ' ≈ ' + Math.round(r.f * r.crop) + ' mm' : '';
    $('tiles').innerHTML =
      tile(t('tile.mode'), 'M', '', 't-mode') +
      tile(t('tile.ap'), fstop(r.N), '', 't-ap') +
      tile(t('tile.t'), tVal, r.bulb ? fmtNum(r.bulb, 0) + ' s' : '', 't-t') +
      tile(t('tile.iso'), r.isoMode === 'auto' && s.mode === 'hand' ? 'AUTO' : String(r.iso), r.isoMode === 'auto' && s.mode === 'hand' ? '≈ ' + r.iso + ' · ≤ 6400' : isoSub, 't-iso') +
      tile(t('tile.f'), Math.round(r.f) + ' mm', fSub, 't-f') +
      tile(t('tile.af'), r.af.mode, t('af.' + r.af.area), 't-af');

    const rows = [
      [t('row.meter'), t('meter.' + s.meter)],
      [t('row.mark'), L(s.mark)],
      [t('row.release'), t('rel.' + r.release)],
      [t('row.wb'), L(s.wb)],
      [t('row.picture'), L(cam.picture)],
      [t('row.indicator'), cam.indicator]
    ];
    $('recipe-rows').innerHTML = rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');

    /* Avisos */
    const warns = [];
    r.warnings.forEach(w => warns.push(['bad', t('warn.' + w.key, { v: typeof w.v === 'number' ? (w.key === 'mfd' ? fmtNum(w.v, 2) : (w.key === 'isoHigh' || w.key === 'isoExt' ? w.v : fmtNum(w.v, 1).replace(',0', ''))) : w.v, from: w.from ? fmtNum(w.from, 1).replace(',0', '') : '' })]));
    r.notes.forEach(n => warns.push(['warn', t('note.' + n.key)]));
    if (r.antiShake) warns.push(['info', t('anti.' + r.antiShake)]);
    if (r.bulb) warns.push(['info', t('bulb', { s: Math.round(r.bulb) })]);
    if (s.mode === 'astro') warns.push(['info', t('astro.note')]);
    L(s.warn) && L(s.warn).forEach(w => warns.push(['warn', w]));
    $('warn-card').style.display = warns.length ? '' : 'none';
    $('warn-list').innerHTML = warns.map(([c, w]) => `<li class="${c}">${esc(w)}</li>`).join('');

    /* Encuadre y PdC */
    let fr = '';
    if (s.mode !== 'astro') {
      fr += `<p><strong>${esc(t('frame.size'))}</strong> ${fmtDist(r.frameW)} × ${fmtDist(r.frameH)} ${esc(t('frame.at'))} ${fmtDist(r.dist)}${r.close && r.mUse ? ' · ' + esc(t('frame.mag1', { m: fmtNum(r.mUse, 2) })) : ''}</p>`;
      let adv = '';
      if (r.framing === 'long') {
        adv = t('frame.long', { w: fmtNum(s.subjW, 1), fi: Math.round(r.fIdeal) }) + ' ' +
          (r.cropSuggest > r.crop ? t(r.cropEnough ? 'frame.longCrop' : 'frame.longCropMove', { c: r.cropSuggest === 1.2 ? '1.2×' : 'DX', d: fmtDist(r.distSuggest) }) : t('frame.longMove', { d: fmtDist(r.distSuggest) }));
      } else if (r.framing === 'short') adv = t('frame.short', { fmin: lens.fMin, d: fmtDist(r.distSuggest) });
      else if (r.framing === 'mag') adv = t('frame.mag', { m: fmtNum(lens.maxMag, 2), w: fmtDist(r.minFrame) });
      else adv = t('frame.ok');
      fr += `<p class="${r.framing === 'ok' ? 'ok' : 'adv'}">${esc(adv)}</p>`;
      const d = r.dof;
      const tot = d.total < 1 ? Math.round(d.total * 1000) + ' mm' : (isFinite(d.total) ? fmtDist(d.total) : '∞');
      const fd = x => (isFinite(x) && x >= 10 && d.total < 3) ? fmtNum(x, 1) + ' m' : fmtDist(x);
      fr += `<div class="dofbar"><div class="dof-lbl">${esc(t('frame.dof'))}</div><div class="dof-val">${d.macro ? '' : fd(d.near) + ' → ' + fd(d.far) + ' · '}${esc(t('frame.dofTotal'))} ${tot}</div></div>`;
      if (!d.macro && isFinite(d.H)) fr += `<p class="muted">${esc(t('frame.hyper'))}: ${fmtDist(d.H)}</p>`;
    } else {
      fr = `<p>${esc(t('astro.note'))} · t ≈ ${fmtNum(r.tNPF, 1)} s</p>`;
    }
    $('frame-body').innerHTML = fr;

    /* Interruptores */
    $('switches').innerHTML = r.switches.map(w => `<div class="sw"><span>${esc(t('sw.' + w.k))}</span><b>${esc(w.v)}</b></div>`).join('');
    $('lens-tip').textContent = L(lens.tip);

    /* Cámara y consejos */
    $('cam-notes').innerHTML = L(cam.notes).map(n => `<li>${esc(n)}</li>`).join('');
    $('tips').innerHTML = L(s.tips).map(n => `<li>${esc(n)}</li>`).join('');

    /* Cálculo */
    const fe = Math.round(r.f * r.crop);
    const calc = [];
    if (s.mode !== 'astro') calc.push(t('calc.ev', { ev: fmtNum(r.ev, 1), lbl: evLabel(r.ev, LANG) }));
    if (s.mode === 'hand') {
      calc.push(t('calc.hand', { fe, t0: fmtShutter(r.tHand0) }));
      calc.push(lens.vr ? t('calc.vr', { s: r.vrEff, S: lens.vrStops, t: fmtShutter(Math.min(r.tHand, 30)) }) : t('calc.novr'));
      calc.push(t('calc.motion', { t: fmtShutter(r.tMotion) }));
    }
    r.calc.forEach(c => calc.push(c));
    if (r.coc) calc.push(t('calc.coc', { c: fmtNum(r.coc, 3) }));
    calc.push(t('calc.disclaimer'));
    $('calc-body').innerHTML = calc.map(c => `<div>${esc(c)}</div>`).join('');
    save();
  }

  function bind() {
    $('cam').onchange = e => { state.cam = e.target.value; render(); };
    $('lens').onchange = e => { state.lens = e.target.value; state.focal = null; syncFine(); render(); };
    $('scene').onchange = e => { state.scene = e.target.value; state.dist = state.orient = state.focal = state.ev = state.aperture = null; $('aperture').value = ''; syncFine(); render(); };
    $('dist').oninput = e => { const v = parseFloat(String(e.target.value).replace(',', '.')); state.dist = v > 0 ? v : null; render(); };
    document.querySelectorAll('#orient button').forEach(b => b.onclick = () => { state.orient = b.dataset.v; syncFine(); render(); });
    document.querySelectorAll('#crop button').forEach(b => b.onclick = () => { state.crop = +b.dataset.v; syncFine(); render(); });
    $('focal').oninput = e => { state.focal = +e.target.value; render(); };
    $('ev').oninput = e => { state.ev = +e.target.value; render(); };
    $('aperture').onchange = e => { state.aperture = e.target.value || null; render(); };
    $('reset').onclick = () => { state.dist = state.orient = state.focal = state.ev = state.aperture = null; state.crop = 1; $('aperture').value = ''; syncFine(); render(); };
    $('lang-toggle').onclick = () => { LANG = LANG === 'es' ? 'en' : 'es'; try { localStorage.setItem('fotocalc.lang', LANG); } catch (e) {} applyI18n(); fillSelects(); syncFine(); render(); };
  }

  applyI18n(); fillSelects(); syncFine(); bind(); render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
