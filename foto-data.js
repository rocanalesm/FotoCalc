/* FotoCalc — datos de cámaras, objetivos y situaciones.
   Para agregar equipo, copia una entrada y ajusta los valores.
   Los textos van en { es, en }.
*/

/* ---------------------------------------------------------------- CÁMARAS */
const CAMERAS = {
  d810: {
    name: 'Nikon D810',
    mp: 36.3, pitch: 4.88,                    // µm
    isoBase: 64, isoMaxGood: 6400, isoMaxExt: 12800, isoLo: 32,
    fastest: 1/8000, slowest: 30,
    groupAF: true, efcs: true,
    isoAutoComp: true,                         // E ± compensa en M + ISO auto
    picture: { es: 'Estándar (vista previa; RAW intacto)', en: 'Standard (preview only; RAW untouched)' },
    crops: [1, 1.2, 1.5],
    indicator: '− · · 0 · · +',
    notes: {
      es: ['ISO automático: botón ISO + dial secundario (ON/OFF).', 'En M + ISO auto, el botón E sí compensa.', 'Trípode: d5 cortinilla electrónica + MUP.'],
      en: ['Auto ISO: ISO button + sub-command dial (ON/OFF).', 'In M + Auto ISO the E button does compensate.', 'Tripod: d5 electronic front-curtain shutter + MUP.']
    }
  },
  d800: {
    name: 'Nikon D800',
    mp: 36.3, pitch: 4.88,
    isoBase: 100, isoMaxGood: 6400, isoMaxExt: 12800, isoLo: 50,
    fastest: 1/8000, slowest: 30,
    groupAF: false, efcs: false,
    isoAutoComp: false,                        // manual p. 131
    picture: { es: 'Neutro (no existe Plano)', en: 'Neutral (no Flat available)' },
    crops: [1, 1.2, 1.5],
    indicator: '− · · 0 · · +',
    notes: {
      es: ['ISO automático: botón ISO + dial secundario (ON/OFF).', 'En M + ISO auto, el botón E NO compensa: para compensar, ISO fijo y marca fuera del 0.', 'Trípode: MUP o retardo d4 (no hay cortinilla electrónica).'],
      en: ['Auto ISO: ISO button + sub-command dial (ON/OFF).', 'In M + Auto ISO the E button does NOT compensate: use fixed ISO and set the mark off 0.', 'Tripod: MUP or d4 exposure delay (no electronic front curtain).']
    }
  }
};

/* --------------------------------------------------------------- OBJETIVOS */
const LENSES = {
  z70200: {
    mount: 'G', afs: true,
    name: 'AF-S NIKKOR 70-200mm f/2.8G ED VR II',
    short: '70-200 f/2.8 VR II',
    fMin: 70, fMax: 200, maxAp: 2.8, minAp: 22,
    mfd: 1.4, maxMag: 0.12, filter: 77, weight: 1540,
    vr: true, vrStops: 4, vrModes: true, macro: false,
    limiter: { values: ['FULL', '∞–5 m'], threshold: 5 },
    tip: { es: 'Mano izquierda bajo el objetivo, no bajo la cámara: pesa 1,5 kg.', en: 'Left hand under the lens, not the body: it weighs 1.5 kg.' }
  },
  z2470e: {
    mount: 'E', afs: true,
    name: 'AF-S NIKKOR 24-70mm f/2.8E ED VR',
    short: '24-70 f/2.8E VR',
    fMin: 24, fMax: 70, maxAp: 2.8, minAp: 22,
    mfd: 0.38, maxMag: 0.28, filter: 82, weight: 1070,
    vr: true, vrStops: 4, vrModes: false, macro: false,
    limiter: null,
    tip: { es: 'Diafragma electromagnético (E): funciona completo en la D810 y la D800. Enfoque mínimo 0,38 m (0,41 m en los extremos 24 y 70 mm).', en: 'Electromagnetic (E) diaphragm: fully supported by the D810 and D800. Minimum focus 0.38 m (0.41 m at 24 and 70 mm).' }
  },
  z2470g: {
    mount: 'G', afs: true,
    name: 'AF-S NIKKOR 24-70mm f/2.8G ED',
    short: '24-70 f/2.8G',
    fMin: 24, fMax: 70, maxAp: 2.8, minAp: 22,
    mfd: 0.38, maxMag: 0.27, filter: 77, weight: 900,
    vr: false, vrStops: 0, vrModes: false, macro: false,
    limiter: null,
    tip: { es: 'Sin VR: a pulso, respeta 1/(2 × focal), es decir 1/50 a 24 mm y 1/140 a 70 mm con 36 MP. Usa siempre el parasol: es sensible a los reflejos.', en: 'No VR: hand-held, keep 1/(2 × focal), i.e. 1/50 at 24 mm and 1/140 at 70 mm with 36 MP. Always use the hood: it is flare-prone.' }
  },
  p50: {
    mount: 'G', afs: true,
    name: 'AF-S NIKKOR 50mm f/1.8G',
    short: '50 f/1.8G',
    fMin: 50, fMax: 50, maxAp: 1.8, minAp: 16,
    mfd: 0.45, maxMag: 0.15, filter: 58, weight: 185,
    vr: false, vrStops: 0, vrModes: false, macro: false,
    limiter: null,
    tip: { es: 'Rinde mejor desde f/2.8; a f/1.8 el plano de foco mide pocos centímetros.', en: 'Sharpest from f/2.8; at f/1.8 the plane of focus is only centimetres deep.' }
  },
  k3570: {
    mount: 'AIS', afs: false,
    name: 'Nikon Zoom 35-70mm f/3.5-4.8 (kit FM10)',
    short: '35-70 kit FM10',
    fMin: 35, fMax: 70, maxAp: 3.5, maxApTele: 4.8, minAp: 22,
    mfd: 0.4, maxMag: 0.17, filter: 52, weight: 200,
    vr: false, vrStops: 0, vrModes: false, macro: false, manualFocus: true,
    limiter: null,
    tip: { es: 'Enfoque manual y apertura variable: f/3.5 a 35 mm, f/4.8 a 70 mm. No tiene CPU: en las digitales ingresa sus datos en «Datos objetivo sin CPU».', en: 'Manual focus, variable aperture: f/3.5 at 35 mm, f/4.8 at 70 mm. No CPU: on the digital bodies enter it under “Non-CPU lens data”.' }
  },
  d50: {
    mount: 'D', afs: false,
    name: 'AF Nikkor 50mm f/1.8D',
    short: '50 f/1.8D',
    fMin: 50, fMax: 50, maxAp: 1.8, minAp: 22,
    mfd: 0.45, maxMag: 0.15, filter: 52, weight: 155,
    vr: false, vrStops: 0, vrModes: false, macro: false,
    limiter: null,
    tip: { es: 'AF-D con anillo de diafragma: déjalo en f/22 en la F-100 y la F-601 (el diafragma se maneja desde la cámara); en la FM10 se usa el anillo y se enfoca a mano.', en: 'AF-D with aperture ring: lock it at f/22 on the F100 and F-601 (aperture set from the body); on the FM10 use the ring and focus by hand.' }
  },
  m105: {
    mount: 'G', afs: true,
    name: 'AF-S VR Micro-NIKKOR 105mm f/2.8G IF-ED',
    short: '105 Micro VR',
    fMin: 105, fMax: 105, maxAp: 2.8, minAp: 32,
    mfd: 0.314, maxMag: 1.0, filter: 62, weight: 790,
    vr: true, vrStops: 4, vrModes: false, macro: true,
    limiter: { values: ['FULL', '∞–0,5 m'], threshold: 0.5 },
    tip: { es: 'A 1:1 la cámara muestra la apertura efectiva (f/2.8 se ve como f/4.8): es normal.', en: 'At 1:1 the camera shows the effective aperture (f/2.8 reads about f/4.8): that is normal.' }
  }
};

/* ------------------------------------------------------------ SITUACIONES
   ev        luz típica de la escena (EV a ISO 100)
   subjW     ancho de lo que quieres en el cuadro (m)
   dist      distancia típica al sujeto (m)
   orient    'h' horizontal · 'v' vertical
   motion    velocidad mínima por el movimiento del sujeto (1/x s)
   ap        apertura preferida (número f) o 'wide' (la máxima del objetivo)
   mode      'hand' a pulso · 'tripod' trípode · 'astro'
   iso       'fixed' fijo por prueba · 'auto' M + ISO auto permitido · 'base'
   meter     'spot' · 'matrix' · 'center'
   af        { mode, area }  area: 'single' | 'dyn9' | 'group' | 'dyn21' | 'manual'
   release   'Q' | 'S' | 'CL' | 'CH' | 'MUP'
*/
const GROUPS = {
  cer: { es: 'Ceremonia en auditorio (sin flash)', en: 'Ceremony in an auditorium (no flash)' },
  ext: { es: 'Exterior con luz de día', en: 'Outdoors in daylight' },
  gen: { es: 'Otras situaciones', en: 'Other situations' }
};

const SCENES = [
  /* ---------- Ceremonia ---------- */
  { id: 'podio', group: 'cer', ev: 7, subjW: 1.0, dist: 15, orient: 'v', motion: 200, ap: 'wide', mode: 'hand', iso: 'fixed', meter: 'spot',
    af: { mode: 'AF-C', area: 'single' }, release: 'Q',
    name: { es: 'Discurso en el podio', en: 'Speech at the podium' },
    mark: { es: 'Puntual en la cara iluminada: marca en +0,7', en: 'Spot on the lit face: mark at +0.7' },
    wb: { es: 'Automático en RAW; corrige con el gotero en NX Studio', en: 'Auto in RAW; fix with the eyedropper in NX Studio' },
    tips: { es: ['Plano medio vertical: cabeza a cintura.', 'Dispara cuando levanta la vista o gesticula, no cuando lee.', 'La luz del escenario no cambia: el ISO de la prueba sirve toda la ceremonia.'],
            en: ['Vertical medium shot: head to waist.', 'Shoot when they look up or gesture, not while reading.', 'Stage light is constant: the test ISO works for the whole ceremony.'] },
    warn: { es: ['Si ves bandas horizontales (LED a 50 Hz), baja a 1/100 y baja el ISO 1⅓ paso.'], en: ['If you see horizontal bands (50 Hz LED), go to 1/100 and lower ISO 1⅓ stops.'] } },

  { id: 'diploma', group: 'cer', ev: 7, subjW: 1.4, dist: 15, orient: 'h', motion: 320, ap: 4, mode: 'hand', iso: 'fixed', meter: 'spot',
    af: { mode: 'AF-C', area: 'group' }, release: 'Q',
    name: { es: 'Entrega del diploma', en: 'Diploma handover' },
    mark: { es: 'Puntual en la cara del titulado: marca en +0,7', en: 'Spot on the graduate’s face: mark at +0.7' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['f/4 deja nítidos al titulado y a la autoridad, que están a distinta distancia.', 'Pre-encuadra el punto del apretón de manos y cuenta cuántos faltan.', '3–5 cuadros: desde la mano extendida hasta que mira al público.'],
            en: ['f/4 keeps both graduate and official sharp at different distances.', 'Pre-frame the handshake spot and count how many are left.', '3–5 frames: from the extended hand until they face the audience.'] },
    warn: { es: ['No mires la pantalla justo cuando lo nombran.'], en: ['Do not chimp right when their name is called.'] } },

  { id: 'desfile', group: 'cer', ev: 6, subjW: 1.0, dist: 10, orient: 'v', motion: 400, ap: 'wide', mode: 'hand', iso: 'auto', meter: 'spot',
    af: { mode: 'AF-C', area: 'dyn9' }, release: 'Q',
    name: { es: 'Entrada y salida de titulados', en: 'Graduates walking in and out' },
    mark: { es: 'ISO auto con puntual en la cara (D810: E +0,3 a +0,7)', en: 'Auto ISO with spot on the face (D810: E +0.3 to +0.7)' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['Pasan de la penumbra del pasillo a la luz: aquí sí M + ISO automático.', 'Sigue al titulado con AF-ON sostenido.'],
            en: ['They move from a dim aisle into stage light: use M + Auto ISO here.', 'Track with AF-ON held down.'] },
    warn: { es: [], en: [] } },

  { id: 'publico', group: 'cer', ev: 5.5, subjW: 1.5, dist: 8, orient: 'h', motion: 200, ap: 'wide', mode: 'hand', iso: 'fixed', meter: 'spot',
    af: { mode: 'AF-C', area: 'single' }, release: 'Q',
    name: { es: 'Público y familias', en: 'Audience and families' },
    mark: { es: 'Puntual en una cara: marca en +0,7', en: 'Spot on a face: mark at +0.7' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['El público está 1–2 pasos más oscuro que el escenario.', 'Busca a la familia de tu titulado cuando lo nombran.'],
            en: ['The audience is 1–2 stops darker than the stage.', 'Look for your graduate’s family when the name is called.'] },
    warn: { es: ['No te pares ni tapes a nadie: apóyate en el respaldo.'], en: ['Do not stand up or block anyone: brace on the seat back.'] } },

  { id: 'salon', group: 'cer', ev: 6.5, subjW: 20, dist: 25, orient: 'h', motion: 125, ap: 5.6, mode: 'hand', iso: 'fixed', meter: 'matrix',
    af: { mode: 'AF-S', area: 'single' }, release: 'Q',
    name: { es: 'Plano general del salón', en: 'Wide shot of the hall' },
    mark: { es: 'Matricial, marca en 0', en: 'Matrix, mark at 0' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['Necesita un gran angular; con tele, sube a la última fila.'], en: ['Needs a wide-angle; with a tele, go to the back row.'] },
    warn: { es: [], en: [] } },

  /* ---------- Exterior ---------- */
  { id: 'retSombra', group: 'ext', ev: 12, subjW: 0.9, dist: 5, orient: 'v', motion: 250, ap: 'wide', mode: 'hand', iso: 'base', meter: 'spot',
    af: { mode: 'AF-S', area: 'single' }, release: 'S',
    name: { es: 'Retrato en sombra abierta', en: 'Portrait in open shade' },
    mark: { es: 'Puntual en la cara: marca en +0,7 (no midas la toga negra)', en: 'Spot on the face: mark at +0.7 (do not meter a black gown)' },
    wb: { es: 'Sombra o automático en RAW', en: 'Shade or Auto in RAW' },
    tips: { es: ['La mejor luz para retratos: suave y sin sombras bajo los ojos.', 'Fondo iluminado y lejano: se funde por completo.', 'Vertical, levemente girado, diploma a la altura del pecho.'],
            en: ['The best portrait light: soft, no shadows under the eyes.', 'A bright, distant background melts away.', 'Vertical, slightly turned, diploma at chest height.'] },
    warn: { es: [], en: [] } },

  { id: 'retSol', group: 'ext', ev: 14, subjW: 0.9, dist: 5, orient: 'v', motion: 250, ap: 'wide', mode: 'hand', iso: 'base', meter: 'spot',
    af: { mode: 'AF-S', area: 'single' }, release: 'S',
    name: { es: 'Retrato a pleno sol', en: 'Portrait in full sun' },
    mark: { es: 'Sol a la espalda del sujeto, cara en sombra: marca +1', en: 'Sun behind the subject, face in shade: mark +1' },
    wb: { es: 'Luz de día', en: 'Daylight' },
    tips: { es: ['La receta supone la cara en contraluz, un paso más oscura que el sol pleno: confírmala con la marca.', 'Pon el sol detrás: borde de luz en el pelo y cara pareja.', 'De frente al sol, los ojos se cierran y el birrete da sombra.'],
            en: ['The recipe assumes a backlit face, one stop darker than full sun: confirm with the mark.', 'Put the sun behind: rim light on the hair and an even face.', 'Facing the sun, eyes squint and the cap casts shadows.'] },
    warn: { es: ['A f/1.8–f/2.8 con sol puede no bastar 1/8000: cierra el diafragma o usa ND.'], en: ['At f/1.8–f/2.8 in sun, 1/8000 may not be enough: stop down or use ND.'] } },

  { id: 'retDorada', group: 'ext', ev: 11, subjW: 0.9, dist: 5, orient: 'v', motion: 250, ap: 'wide', mode: 'hand', iso: 'base', meter: 'spot',
    af: { mode: 'AF-S', area: 'single' }, release: 'S',
    name: { es: 'Retrato en hora dorada', en: 'Golden-hour portrait' },
    mark: { es: 'Contraluz: puntual en la cara, marca +1', en: 'Backlit: spot on the face, mark +1' },
    wb: { es: 'Luz de día (conserva el dorado)', en: 'Daylight (keeps the warmth)' },
    tips: { es: ['La última hora de sol: luz cálida y baja.', 'Usa el parasol: evita velos por el sol en cuadro.'],
            en: ['The last hour of sun: warm, low light.', 'Use the hood to avoid flare.'] },
    warn: { es: [], en: [] } },

  { id: 'grupo', group: 'ext', ev: 12, subjW: 5, dist: 10, orient: 'h', motion: 250, ap: 5.6, mode: 'hand', iso: 'base', meter: 'matrix',
    af: { mode: 'AF-S', area: 'single' }, release: 'CL',
    name: { es: 'Grupo (compañeros, familia)', en: 'Group (classmates, family)' },
    mark: { es: 'Matricial o puntual en una cara: marca 0 a +0,7', en: 'Matrix or spot on a face: mark 0 to +0.7' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['Enfoca la primera fila; f/5.6 cubre dos filas.', 'Haz 5–6 tomas: alguien siempre cierra los ojos.', 'Todos en la misma luz.'],
            en: ['Focus on the front row; f/5.6 covers two rows.', 'Take 5–6 frames: someone always blinks.', 'Everyone in the same light.'] },
    warn: { es: [], en: [] } },

  { id: 'edificio', group: 'ext', ev: 14, subjW: 12, dist: 20, orient: 'h', motion: 250, ap: 8, mode: 'hand', iso: 'base', meter: 'matrix',
    af: { mode: 'AF-S', area: 'single' }, release: 'S',
    name: { es: 'Persona con el edificio', en: 'Person with the building' },
    mark: { es: 'Matricial, marca 0; cara en sombra: +0,7', en: 'Matrix, mark 0; face in shade: +0.7' },
    wb: { es: 'Luz de día', en: 'Daylight' },
    tips: { es: ['El tele comprime: retrocede y el edificio se ve grande detrás.', 'Persona a un tercio del cuadro.'],
            en: ['A tele compresses: step back and the building looms behind.', 'Person on a third of the frame.'] },
    warn: { es: [], en: [] } },

  { id: 'birretes', group: 'ext', ev: 14, subjW: 6, dist: 10, orient: 'h', motion: 1000, ap: 5.6, mode: 'hand', iso: 'auto', meter: 'matrix',
    af: { mode: 'AF-C', area: 'dyn21' }, release: 'CH',
    name: { es: 'Lanzamiento de birretes', en: 'Cap toss' },
    mark: { es: 'Marca 0 en las caras, no en el cielo', en: 'Mark 0 on faces, not on the sky' },
    wb: { es: 'Luz de día', en: 'Daylight' },
    tips: { es: ['Enfoca al grupo antes de la cuenta regresiva.', 'CH desde «tres» hasta que caen.'], en: ['Focus on the group before the countdown.', 'CH from “three” until they land.'] },
    warn: { es: [], en: [] } },

  { id: 'detalle', group: 'ext', ev: 12, subjW: 0.3, dist: 1.5, orient: 'h', motion: 250, ap: 4, mode: 'hand', iso: 'base', meter: 'matrix',
    af: { mode: 'AF-S', area: 'single' }, release: 'S',
    name: { es: 'Detalles: diploma, manos, insignias', en: 'Details: diploma, hands, insignia' },
    mark: { es: 'Matricial, marca 0; papel blanco: +1', en: 'Matrix, mark 0; white paper: +1' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['Acércate hasta que el AF dude y retrocede un paso.'], en: ['Move in until the AF hesitates, then step back.'] },
    warn: { es: [], en: [] } },

  /* ---------- General ---------- */
  { id: 'paisaje', group: 'gen', ev: 13, subjW: 60, dist: 300, orient: 'h', motion: 1, ap: 8, mode: 'tripod', iso: 'base', meter: 'matrix',
    af: { mode: 'AF-S', area: 'manual' }, release: 'MUP',
    name: { es: 'Paisaje en trípode', en: 'Landscape on a tripod' },
    mark: { es: 'Marca 0 a +0,7 (ETTR) sin quemar el cielo', en: 'Mark 0 to +0.7 (ETTR) without clipping the sky' },
    wb: { es: 'Luz de día', en: 'Daylight' },
    tips: { es: ['Enfoca en Live View al 100 %.', 'Revisa histograma y altas luces.'], en: ['Focus in Live View at 100%.', 'Check histogram and highlights.'] },
    warn: { es: ['VR OFF en trípode.'], en: ['VR OFF on a tripod.'] } },

  { id: 'calle', group: 'gen', ev: 14, subjW: 4, dist: 6, orient: 'h', motion: 250, ap: 8, mode: 'hand', iso: 'base', meter: 'matrix',
    af: { mode: 'AF-C', area: 'dyn9' }, release: 'Q',
    name: { es: 'Calle y viajes', en: 'Street and travel' },
    mark: { es: 'Elige sol o sombra y fija la exposición para esa luz', en: 'Pick sun or shade and fix the exposure for that light' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['«f/8 and be there».', 'Si alternas sol y sombra cada pocos segundos: M + ISO auto.'], en: ['“f/8 and be there”.', 'If you alternate sun and shade every few seconds: M + Auto ISO.'] },
    warn: { es: [], en: [] } },

  { id: 'ventana', group: 'gen', ev: 8.5, subjW: 0.9, dist: 3, orient: 'v', motion: 160, ap: 'wide', mode: 'hand', iso: 'fixed', meter: 'spot',
    af: { mode: 'AF-S', area: 'single' }, release: 'S',
    name: { es: 'Retrato en interior con ventana', en: 'Indoor portrait by a window' },
    mark: { es: 'Puntual en el lado iluminado: marca +0,7', en: 'Spot on the lit side: mark +0.7' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['Sujeto a 45° de la ventana, fondo lejos.'], en: ['Subject at 45° to the window, background far away.'] },
    warn: { es: [], en: [] } },

  { id: 'nocheUrb', group: 'gen', ev: 3, subjW: 40, dist: 150, orient: 'h', motion: 1, ap: 8, mode: 'tripod', iso: 'base', meter: 'matrix',
    af: { mode: 'MF', area: 'manual' }, release: 'MUP',
    name: { es: 'Nocturna urbana en trípode', en: 'Night cityscape on a tripod' },
    mark: { es: 'Mide las fachadas iluminadas: marca 0', en: 'Meter the lit façades: mark 0' },
    wb: { es: '3700–4000 K', en: '3700–4000 K' },
    tips: { es: ['La hora azul (20–40 min tras la puesta) rinde más que la noche cerrada.'], en: ['Blue hour (20–40 min after sunset) beats full night.'] },
    warn: { es: ['VR OFF en trípode. Más de 30 s: Bulb con cable.'], en: ['VR OFF on a tripod. Over 30 s: Bulb with a cable.'] } },

  { id: 'astro', group: 'gen', ev: -7, subjW: 100, dist: 1e6, orient: 'h', motion: 1, ap: 'wide', mode: 'astro', iso: 'fixed', meter: 'matrix',
    af: { mode: 'MF', area: 'manual' }, release: 'MUP',
    name: { es: 'Vía Láctea / estrellas', en: 'Milky Way / stars' },
    mark: { es: 'El indicador no sirve: manda el histograma', en: 'The meter is useless here: trust the histogram' },
    wb: { es: '3700–4000 K', en: '3700–4000 K' },
    tips: { es: ['Enfoca una estrella en Live View con zoom máximo y fija el anillo con cinta.', 'Estos objetivos son largos para astro: con un gran angular el tiempo puede ser mucho mayor.'],
            en: ['Focus on a star in Live View at max zoom and tape the ring.', 'These lenses are long for astro: a wide-angle allows much longer exposures.'] },
    warn: { es: [], en: [] } },

  { id: 'accion', group: 'gen', ev: 13, subjW: 3, dist: 20, orient: 'h', motion: 1000, ap: 'wide', mode: 'hand', iso: 'auto', meter: 'matrix',
    af: { mode: 'AF-C', area: 'dyn21' }, release: 'CH',
    name: { es: 'Deporte y acción', en: 'Sports and action' },
    mark: { es: 'M + ISO auto; matricial', en: 'M + Auto ISO; matrix' },
    wb: { es: 'Automático en RAW', en: 'Auto in RAW' },
    tips: { es: ['AF-ON sostenido y ráfaga CH.'], en: ['Hold AF-ON and shoot CH bursts.'] },
    warn: { es: [], en: [] } },

  { id: 'macro', group: 'gen', ev: 9, subjW: 0.06, dist: 0.35, orient: 'h', motion: 1, ap: 11, mode: 'tripod', iso: 'base', meter: 'matrix',
    af: { mode: 'MF', area: 'manual' }, release: 'MUP',
    name: { es: 'Macro de mesa (producto, flor)', en: 'Tabletop macro (product, flower)' },
    mark: { es: 'Marca 0; fondo blanco: +1', en: 'Mark 0; white background: +1' },
    wb: { es: 'Según la luz; tarjeta gris si es producto', en: 'As per the light; grey card for products' },
    tips: { es: ['Enfoca moviendo la cámara (riel), no el anillo.', 'f/11 es el límite antes de que la difracción ablande los 36 MP.'],
            en: ['Focus by moving the camera (rail), not the ring.', 'f/11 is the limit before diffraction softens 36 MP.'] },
    warn: { es: [], en: [] } }
];
