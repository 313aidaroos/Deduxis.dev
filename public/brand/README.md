# Deduxis brand kit

This folder is the only logo kit. It is served at `/brand/`. PNG and ICO only. Do not add a second logo folder, and do not redraw or recolor these files.

The mark is the official Deduxis D: the purple and white letter, with the document and the swoosh arrow inside it. It was extracted from the banner reference and placed on a transparent background. The pixels are the banner's own. They were not redrawn.

## Colors

Read these from `brand.json`. They are the ink, cobalt, and paper already used in `app/globals.css`. The D keeps the purple, white, and cyan from the banner.

| Role | Hex | Where it shows up |
| --- | --- | --- |
| primary | `#14224b` | Ink. The name in `logo-full.png`, and UI text. |
| accent | `#0753ed` | Cobalt. UI accents. |
| background | `#fcfcff` | Page background. Also the field behind the app icons and the link preview. |
| text | `#14224b` | Text on that background. |

## Which file to use

- `logo-full.png` — the D on the left, Deduxis on the right, transparent. Use on light backgrounds. The site header uses this file.
- `logo-full-white.png` — the same lockup in white, transparent. Use on dark backgrounds.
- `mark.png` — the D alone, transparent, 1024 pixels.
- `mark-white.png` — the D alone in white, transparent.
- `favicon.ico` — browser tab icon. Also linked from the site metadata.
- `favicon-32.png` — 32×32 PNG icon.
- `apple-touch-icon.png` — 180×180 home-screen icon, on paper.
- `icon-192.png` — 192×192 app icon, on paper.
- `icon-512.png` — 512×512 app icon, on paper.
- `og-image.png` — 1200×630 link preview, the lockup and tagline on paper.
- `brand.json` — name, domain, tagline, colors, fonts, and this file list.

The lockups and the two marks have no background. The home-screen icon, the app icons, and the link preview include a paper field so they stay readable.

Banner, Facebook cover, and Facebook profile are not in this kit yet.

## Rules

Load logos from `/brand/` using these file names. Do not place a logo or icon file anywhere else in the repo. Do not draw a new D, recolor the extracted mark, or replace it with a generic document icon.
