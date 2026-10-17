# Deduxis brand kit

This folder is the only logo kit. It is served at `/brand/`. PNG and ICO only. Do not add a second logo folder, and do not redraw or recolor these files.

## Colors

Read these from `brand.json`. They are the same ink, cobalt, and paper already used in `app/globals.css`.

| Role | Hex | Where it shows up |
| --- | --- | --- |
| primary | `#14224b` | Ink. The mark, the name, and the wordmark. |
| accent | `#0753ed` | Cobalt. The folded corner, the receipt rules, and the period. |
| background | `#fcfcff` | Page background. |
| text | `#14224b` | Text on that background. |

## Which file to use

- `logo-full.png` — mark on the left, Deduxis on the right, transparent. Use on light backgrounds. The site header uses this file.
- `logo-full-white.png` — the same lockup in white, transparent. Use on dark backgrounds.
- `mark.png` — the icon alone, transparent, at least 512 pixels wide.
- `mark-white.png` — the icon alone in white, transparent.
- `favicon.ico` — browser tab icon. Also linked from the site metadata.
- `favicon-32.png` — 32×32 PNG icon.
- `apple-touch-icon.png` — 180×180 home-screen icon.
- `icon-192.png` — 192×192 app icon.
- `icon-512.png` — 512×512 app icon.
- `og-image.png` — 1200×630 link preview.
- `brand.json` — name, domain, tagline, colors, fonts, and this file list.

The lockups and marks have no background. The favicon, app icons, and link preview include their own ink or paper field so they stay readable.

Banner, Facebook cover, and Facebook profile are not in this kit yet.

## Rules

Load logos from `/brand/` using these file names. Do not place a logo or icon file anywhere else in the repo. Do not generate a new drawing, recolor the mark, or swap the ink and cobalt values.
