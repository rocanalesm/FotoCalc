# FotoCalc v1.1

*English version: [README.en.md](README.en.md)*

Calculadora de exposición en **modo M** para cámaras digitales Nikon.
Eliges cámara, objetivo y situación, y te entrega la receta completa:
apertura, velocidad, ISO, focal, enfoque, medición y dónde dejar la marca
del indicador, más el encuadre, la profundidad de campo, la posición de
los interruptores del objetivo y consejos para esa escena. Todo el cálculo
corre en el navegador: no hay servidor detrás y funciona sin conexión.

Equipo incluido en esta versión:

- **Cámaras:** Nikon D810 y D800.
- **Objetivos:** AF-S 24-70mm f/2.8E ED VR, AF-S 24-70mm f/2.8G ED,
  AF-S 70-200mm f/2.8G ED VR II, AF-S 50mm f/1.8G y
  AF-S VR Micro 105mm f/2.8G IF-ED.
- **Situaciones:** ceremonia en auditorio (discurso, diploma, desfile,
  público, plano general), exterior con luz de día (retratos en sombra, sol
  y hora dorada, grupo, edificio, birretes, detalles) y otras (paisaje,
  calle, ventana, nocturna urbana, Vía Láctea, acción, macro de mesa).

## Criterio

Sigue el criterio del Proyecto Nikon: **modo M siempre**, con el método de
cuatro pasos (ISO según la luz, apertura según la intención, velocidad hasta
el indicador, verificar). M + ISO automático solo cuando la luz cambia
seguido; A queda como salida de emergencia.

## Bilingüe

El botón **ES / EN** del encabezado cambia el idioma de toda la interfaz y
la elección queda guardada.

## Cómo calcula

- **Velocidad:** la más exigente entre el pulso (1/(2 × focal) por los
  36 MP, menos 3 pasos si el objetivo tiene VR) y el movimiento del sujeto.
- **ISO:** ISO = 100 · N² / (t · 2^EV), con la luz típica de la situación
  (se puede ajustar con el control «Luz de la escena»).
- **Trípode:** ISO base y la velocidad que pida la luz.
- **Vía Láctea:** regla NPF con el tamaño de píxel de la cámara.
- **Profundidad de campo:** círculo de confusión de 0,02 mm (36 MP).

Es un punto de partida: se confirma siempre con el indicador del visor y
el histograma.

## Publicarla en GitHub Pages, en tres pasos

1. Crear un repositorio **público** nuevo llamado `FotoCalc`.
2. Subir **el contenido de esta carpeta** a la raíz del repositorio
   (arrastrar los archivos a la página del repo y confirmar el commit).
3. En el repositorio, ir a **Settings**, luego **Pages**, y en
   *Build and deployment* elegir *Deploy from a branch*, rama `main`,
   carpeta `/ (root)`. Guardar.

Al minuto queda disponible en `https://USUARIO.github.io/FotoCalc/`.

## Instalarla en el teléfono

Abrir esa dirección en el teléfono y:

- **Android (Chrome):** menú de tres puntos, *Instalar app*.
- **iPhone (Safari):** botón compartir, *Agregar a pantalla de inicio*.

Queda como un ícono más y funciona sin conexión después de la primera
visita: sirve en el auditorio o en terreno sin señal.

## Agregar equipo

Todo el equipo está en `foto-data.js`. Para un objetivo nuevo, copia una
entrada de `LENSES` y ajusta focal, apertura máxima, distancia mínima de
enfoque, ampliación máxima, VR y limitador. Para una situación nueva, copia
una entrada de `SCENES`.

## Para actualizar la app

Reemplazar los archivos en el repositorio y **subir el número de versión
del caché en `sw.js`** (la constante `CACHE`, hoy `fotocalc-v1.1`). Sin
ese cambio, a quien ya la tenga instalada le sigue apareciendo la versión
vieja.

## Licencia

Código bajo licencia **BSD 3-Clause** (archivo `LICENSE`). Nikon, NIKKOR y
los nombres de los productos son marcas de Nikon Corporation; esta
aplicación no está afiliada a Nikon.

**Cita sugerida:** R. I. Canales M., *FotoCalc* v1.1, 2026.

## Qué hay en cada archivo

| Archivo | Qué es |
|---|---|
| `index.html` | La aplicación: interfaz y estilos |
| `foto-i18n.js` | Textos ES/EN de la interfaz |
| `foto-data.js` | Cámaras, objetivos y situaciones |
| `foto-engine.js` | Cálculo de la receta, encuadre y profundidad de campo |
| `foto-ui.js` | Desplegables, cálculo en vivo y presentación |
| `manifest.json`, `sw.js` | Metadata PWA y caché sin conexión |
| `icon-192.png`, `icon-512.png` | Íconos |
| `LICENSE` | Licencia BSD 3-Clause |
