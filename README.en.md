# FotoCalc v1.1

*Versión en español: [README.md](README.md)*

A **manual-mode (M)** exposure calculator for Nikon digital cameras. Pick a
camera, a lens and a situation, and it returns the full recipe: aperture,
shutter speed, ISO, focal length, focus, metering and where to set the
indicator mark, plus framing, depth of field, lens switch positions and tips
for that scene. Everything runs in the browser: no server, and it works
offline.

Gear in this version:

- **Cameras:** Nikon D810 and D800.
- **Lenses:** AF-S 24-70mm f/2.8E ED VR, AF-S 24-70mm f/2.8G ED, AF-S 70-200mm f/2.8G ED VR II, AF-S 50mm f/1.8G and
  AF-S VR Micro 105mm f/2.8G IF-ED.
- **Situations:** auditorium ceremony, outdoor daylight and general scenes.

## How it calculates

- **Shutter:** the stricter of hand-holding (1/(2 × focal) for 36 MP, minus
  3 stops with VR) and subject motion.
- **ISO:** ISO = 100 · N² / (t · 2^EV), using the situation's typical light
  (adjustable with the "Scene light" slider).
- **Tripod:** base ISO and whatever speed the light needs.
- **Milky Way:** NPF rule with the camera's pixel pitch.
- **Depth of field:** 0.02 mm circle of confusion (36 MP).

It is a starting point: always confirm with the viewfinder indicator and the
histogram.

## Publish on GitHub Pages

1. Create a new **public** repository named `FotoCalc`.
2. Upload **the contents of this folder** to the repository root.
3. Go to **Settings → Pages**, choose *Deploy from a branch*, branch
   `main`, folder `/ (root)`, and save.

It will be live at `https://USERNAME.github.io/FotoCalc/` within a minute.

## Updating

Replace the files and **bump the cache version in `sw.js`** (`CACHE`,
currently `fotocalc-v1.1`), or installed copies keep the old version.

## License

Code under the **BSD 3-Clause** license (`LICENSE`). Nikon, NIKKOR and the
product names are trademarks of Nikon Corporation; this app is not
affiliated with Nikon.
