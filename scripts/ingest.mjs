#!/usr/bin/env node
/**
 * Ingest CLI — extract style from a Google Slides URL or PPTX file,
 * generate a matching Marp CSS theme, and optionally scaffold a Marp deck.
 *
 * Usage:
 *   node scripts/ingest.mjs --url "https://docs.google.com/presentation/d/ID/edit"
 *   node scripts/ingest.mjs --file ./export.pptx
 *   node scripts/ingest.mjs --file ./export.pptx --scaffold
 *   node scripts/ingest.mjs --file ./export.pptx --name my-theme
 */

import { parseArgs } from 'util'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import chalk from 'chalk'

const { values: args } = parseArgs({
  options: {
    url:      { type: 'string' },
    file:     { type: 'string' },
    name:     { type: 'string' },
    scaffold: { type: 'boolean', default: false },
    help:     { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
})

if (args.help || (!args.url && !args.file)) {
  console.log(`
${chalk.bold('marp-agent: ingest')}

Extract style from a Google Slides presentation or PPTX file,
generate a matching Marp CSS theme, and optionally scaffold a deck.

${chalk.bold('Usage:')}
  node scripts/ingest.mjs --url <google-slides-url>
  node scripts/ingest.mjs --file <path-to.pptx>

${chalk.bold('Options:')}
  --url      Google Slides URL or presentation ID
  --file     Path to exported .pptx file
  --name     Theme name (default: derived from presentation title)
  --scaffold Also write a Marp markdown scaffold from slide content
  -h, --help Show this help
`)
  process.exit(args.help ? 0 : 1)
}

console.log(chalk.bold.cyan('\n  marp-agent › ingest\n'))

// ── Step 1: Extract ───────────────────────────────────────────────────────────

const { extractPresentation, slugify } = await import('../src/ingest/style-extractor.mjs')

let extracted
try {
  const source = args.url
    ? { url: args.url }
    : { file: resolve(process.cwd(), args.file) }

  console.log(chalk.dim(`  Extracting from ${args.url ?? args.file}...`))
  extracted = await extractPresentation(source)
} catch (err) {
  console.error(chalk.red(`\n  Error during extraction:\n  ${err.message}\n`))
  process.exit(1)
}

const { metadata, colorScheme, fonts, slides } = extracted
console.log(chalk.green(`  ✓ Extracted "${metadata.title}" — ${metadata.slideCount} slides`))

// ── Step 2: Print extracted info ──────────────────────────────────────────────

console.log(`
  ${chalk.bold('Color scheme:')}
    Primary    ${chalk.bgHex(colorScheme.primary)('      ')} ${colorScheme.primary}
    Accent     ${chalk.bgHex(colorScheme.accent)('      ')} ${colorScheme.accent}
    Background ${chalk.bgHex(colorScheme.background)('      ')} ${colorScheme.background}
    Text       ${chalk.bgHex(colorScheme.text)('      ')} ${colorScheme.text}

  ${chalk.bold('Fonts:')}
    Heading: ${fonts.heading ?? '(not detected)'}
    Body:    ${fonts.body ?? '(not detected)'}
`)

// ── Step 3: Generate theme ────────────────────────────────────────────────────

const themeName = args.name ?? `custom-${slugify(metadata.title)}`
const { generateTheme } = await import('../src/themes/generator.mjs')

console.log(chalk.dim(`  Generating theme: ${themeName}...`))
const themePath = generateTheme(extracted, themeName)
console.log(chalk.green(`  ✓ Theme written → ${themePath}`))

// ── Step 4: Optionally scaffold a Marp deck ───────────────────────────────────

if (args.scaffold) {
  const { generatePresentation } = await import('../src/generate/presentation.mjs')
  console.log(chalk.dim(`  Scaffolding Marp deck...`))
  const deckPath = generatePresentation({
    topic: metadata.title,
    theme: themeName,
    extracted,
  })
  console.log(chalk.green(`  ✓ Scaffold written → ${deckPath}`))
}

// ── Done ──────────────────────────────────────────────────────────────────────

console.log(`
  ${chalk.bold('Next steps:')}
  1. Preview:  ${chalk.cyan('npm run dev')}
  2. Use theme in your slides: ${chalk.cyan(`theme: ${themeName}`)} in front matter
  3. Build:    ${chalk.cyan('npm run build')}
`)
