#!/usr/bin/env node
/**
 * Fails if any __SKIPPY_TODO_* placeholder is still present in code or config.
 *
 * These mark values that can only come from the Apple / Google / Expo accounts
 * (see docs/STORE_RELEASE.md). A store build must not go out while any remain.
 *
 *   node scripts/check-placeholders.mjs              # exit 1 if any are found
 *   node scripts/check-placeholders.mjs --warn-only  # report, but exit 0
 *
 * Markdown is skipped: the docs name these placeholders on purpose.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const selfPath = fileURLToPath(import.meta.url)
const root = path.resolve(path.dirname(selfPath), '..')
// Require the closing `__` so prose about the convention ("__SKIPPY_TODO_*") is
// not mistaken for an actual unresolved value.
const PLACEHOLDER = /__SKIPPY_TODO_[A-Z0-9_]+__/
const SKIP_DIRS = new Set(['node_modules', '.git', 'ios', 'android', 'dist', 'build', '.expo', 'docs'])
const SKIP_EXTS = new Set(['.md', '.png', '.jpg', '.jpeg', '.svg', '.lock', '.patch'])

const hits = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (SKIP_DIRS.has(entry)) continue
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
      continue
    }
    if (SKIP_EXTS.has(path.extname(entry))) continue
    if (full === selfPath) continue
    let content
    try {
      content = readFileSync(full, 'utf8')
    } catch {
      continue // unreadable or binary
    }
    if (!PLACEHOLDER.test(content)) continue
    content.split('\n').forEach((line, i) => {
      if (PLACEHOLDER.test(line)) {
        hits.push(`${path.relative(root, full)}:${i + 1}: ${line.trim()}`)
      }
    })
  }
}

walk(root)

const warnOnly = process.argv.includes('--warn-only')

if (hits.length === 0) {
  console.log('No unresolved __SKIPPY_TODO_ placeholders.')
  process.exit(0)
}

console.log(`Found ${hits.length} unresolved placeholder(s):\n`)
for (const hit of hits) console.log(`  ${hit}`)
console.log('\nSee docs/STORE_RELEASE.md for where each value comes from.')
process.exit(warnOnly ? 0 : 1)
