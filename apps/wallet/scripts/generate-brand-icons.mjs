#!/usr/bin/env node
/**
 * Compose a brand's app icons from a single SVG mark.
 *
 * Usage:
 *   node scripts/generate-brand-icons.mjs --brand skippy \
 *     --mark ../../path/to/mark.svg --bg '#6B3FA0' --fill '#FFFFFF'
 *
 * Requires rsvg-convert (`brew install librsvg`).
 *
 * Writes icon.png, adaptive_icon.png, splash_icon.png and splash.png into
 * brands/<brand>/assets/. Filenames use only [a-z0-9_] because Android requires
 * that of paths referenced directly from code.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1]
  if (fallback !== undefined) return fallback
  throw new Error(`Missing required argument --${name}`)
}

const brand = arg('brand')
const markPath = path.resolve(process.cwd(), arg('mark'))
const bg = arg('bg')
const fill = arg('fill', '#FFFFFF')
const outDir = path.join(here, '..', 'brands', brand, 'assets')

const src = readFileSync(markPath, 'utf8')
const pathEl = src.match(/<path[^>]*\/>/)
if (!pathEl) throw new Error(`No <path> element found in ${markPath}`)
const mark = pathEl[0].replace(/fill="[^"]*"/, `fill="${fill}"`)

// A mark rarely fills its own viewBox, so centring the viewBox leaves it visibly
// off-centre. Bound the glyph by its points instead: every coordinate pair is a
// curve endpoint or control point, and the control hull always contains the curve.
const d = pathEl[0].match(/\sd="([^"]+)"/)[1]
const nums = d.match(/-?\d*\.?\d+/g).map(Number)
const xs = nums.filter((_, i) => i % 2 === 0)
const ys = nums.filter((_, i) => i % 2 === 1)
const box = {
  x: Math.min(...xs),
  y: Math.min(...ys),
  w: Math.max(...xs) - Math.min(...xs),
  h: Math.max(...ys) - Math.min(...ys),
}

function compose({ w, h, frac }) {
  const scale = (Math.min(w, h) * frac) / Math.max(box.w, box.h)
  const tx = (w - box.w * scale) / 2 - box.x * scale
  const ty = (h - box.h * scale) / 2 - box.y * scale
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <g transform="translate(${tx},${ty}) scale(${scale})">${mark}</g>
</svg>`
}

const targets = [
  // iOS app icon: full bleed, iOS applies its own rounded mask.
  { name: 'icon.png', w: 1024, h: 1024, frac: 0.62 },
  // Android adaptive foreground: mark inside the 66% safe zone, background full
  // bleed so any system mask shape stays on-brand. Doubles as the Android splash.
  { name: 'adaptive_icon.png', w: 1024, h: 1024, frac: 0.46 },
  { name: 'splash_icon.png', w: 1024, h: 1024, frac: 0.46 },
  // iOS splash, resizeMode 'cover'.
  { name: 'splash.png', w: 2568, h: 5556, frac: 0.34 },
]

const tmp = mkdtempSync(path.join(tmpdir(), 'brand-icons-'))
mkdirSync(outDir, { recursive: true })
for (const target of targets) {
  const svg = path.join(tmp, `${target.name}.svg`)
  writeFileSync(svg, compose(target))
  const out = path.join(outDir, target.name)
  execFileSync('rsvg-convert', ['-w', String(target.w), '-h', String(target.h), '-o', out, svg])
  console.log(`${target.w}x${target.h}\t${path.relative(process.cwd(), out)}`)
}
