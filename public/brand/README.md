# Deduxis brand kit

This folder is the only logo kit. It is served at `/brand/`. PNG and ICO only. Do not add a second logo folder, and do not redraw or recolor these files.

The mark is the official Deduxis tile: the purple and white D, with the document and swoosh, on a dark navy rounded tile with a blue glow and the Deduxis name. It comes from the approved Facebook profile image. Only the outside corners were masked to transparent. The D was not redrawn or re-cut.

## Colors

Read these from `brand.json`. They are the ink, cobalt, and paper already used in `app/globals.css`. The D keeps the purple, white, and cyan from the banner.

| Role | Hex | Where it shows up |
| --- | --- | --- |
| primary | `#14224b` | Ink. The name in `logo-full.png`, and UI text. |
| accent | `#0753ed` | Cobalt. UI accents. |
| background | `#fcfcff` | Page background. Also the field behind the app icons and the link preview. |
| text | `#14224b` | Text on that background. |

## Which file to use

- `logo-full.png` — the tile on the left, Deduxis in Georgia Bold ink on the right, transparent. Use on light backgrounds. The site header uses this file.
- `logo-full-white.png` — the same lockup with white text (tile unchanged), transparent. Use on dark backgrounds.
- `mark.png` — the tile, 720 pixels, transparent rounded corners.
- `mark-white.png` — same as `mark.png`; the tile already reads on dark backgrounds.
- `favicon.ico` — browser tab icon. Also linked from the site metadata.
- `favicon-32.png` — 32×32 PNG icon.
- `apple-touch-icon.png` — 180×180 home-screen icon, on paper.
- `icon-192.png` — 192×192 app icon, on paper.
- `icon-512.png` — 512×512 app icon, on paper.
- `og-image.png` — 1200×630 link preview, the tile and tagline on paper.
- `brand.json` — name, domain, tagline, colors, fonts, and this file list.

The lockups and the marks have transparent outsides. The home-screen icon, the app icons, and the link preview include a paper field so they stay readable.

Banner, Facebook cover, and Facebook profile are not in this kit yet.

## Rules

Load logos from `/brand/` using these file names. Do not place a logo or icon file anywhere else in the repo. Do not draw a new D, recolor or re-cut the tile, or replace it with a generic document icon.
