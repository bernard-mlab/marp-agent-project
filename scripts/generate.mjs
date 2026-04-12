#!/usr/bin/env node
/**
 * Generate CLI — create a Marp presentation from a topic or outline.
 *
 * Usage:
 *   node scripts/generate.mjs --topic "Q4 Business Review"
 *   node scripts/generate.mjs --topic "Tech Overview" --template tech
 *   node scripts/generate.mjs --outline ./outline.txt --theme custom-my-deck
 *   node scripts/generate.mjs --topic "My Talk" --subtitle "2026 Annual" --header "ACME Corp"
 */

import { parseArgs } from 'util'
import { resolve, extname } from 'path'
import { readFileSync, existsSync } from 'fs'
import chalk from 'chalk'

const { values: args } = parseArgs({
  options: {
    topic:    { type: 'string' },
    outline:  { type: 'string' },
    template: { type: 'string' },
    theme:    { type: 'string' },
    subtitle: { type: 'string', default: '' },
    header:   { type: 'string', default: '' },
    footer:   { type: 'string', default: '' },
    output:   { type: 'string', default: '' },
    help:     { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
})

if (args.help || (!args.topic && !args.outline)) {
  console.log(`
${chalk.bold('marp-agent: generate')}

Generate a Marp presentation from a topic or outline file.

${chalk.bold('Usage:')}
  node scripts/generate.mjs --topic "Presentation Title"
  node scripts/generate.mjs --outline ./outline.txt --template corporate

${chalk.bold('Options:')}
  --topic      Presentation title / one-line topic
  --outline    Path to a text or markdown outline file
  --template   Built-in template: corporate | tech | minimal (default: corporate)
  --theme      Custom theme name (overrides --template)
  --subtitle   Subtitle for title slide
  --header     Header text shown on all slides
  --footer     Footer text shown on all slides
  --output     Output filename (without .md, default: derived from topic)
  -h, --help   Show this help
`)
  process.exit(args.help ? 0 : 1)
}

console.log(chalk.bold.cyan('\n  marp-agent › generate\n'))

// Resolve theme
const theme = args.theme ?? args.template ?? 'corporate'
const VALID_THEMES = ['corporate', 'tech', 'minimal']
if (!args.theme && !VALID_THEMES.includes(theme)) {
  console.error(chalk.red(`  Unknown template "${theme}". Use: ${VALID_THEMES.join(', ')}`))
  process.exit(1)
}

// Read outline file if provided
let outline = ''
if (args.outline) {
  const outlinePath = resolve(process.cwd(), args.outline)
  if (!existsSync(outlinePath)) {
    console.error(chalk.red(`  Outline file not found: ${outlinePath}`))
    process.exit(1)
  }
  outline = readFileSync(outlinePath, 'utf8')
  console.log(chalk.dim(`  Loaded outline from ${args.outline}`))
}

const topic = args.topic || outline.split('\n')[0]?.replace(/^[#*\-\d.]+\s*/, '') || 'Presentation'

// ── Generate ──────────────────────────────────────────────────────────────────

const { generatePresentation } = await import('../src/generate/presentation.mjs')

console.log(chalk.dim(`  Generating "${topic}" with theme "${theme}"...`))

let deckPath
try {
  deckPath = generatePresentation({
    topic,
    outline,
    theme,
    subtitle: args.subtitle,
    header: args.header,
    footer: args.footer,
    output: args.output,
  })
} catch (err) {
  console.error(chalk.red(`\n  Error during generation:\n  ${err.message}\n`))
  process.exit(1)
}

console.log(chalk.green(`  ✓ Presentation written → ${deckPath}`))

console.log(`
  ${chalk.bold('Next steps:')}
  1. Preview:  ${chalk.cyan('npm run dev')}
  2. Edit:     ${chalk.cyan(`open ${deckPath}`)} (or edit directly in VS Code)
  3. Build:    ${chalk.cyan('npm run build')}
  4. PDF:      ${chalk.cyan('npm run build:pdf')}
`)
