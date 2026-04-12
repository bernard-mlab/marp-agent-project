/**
 * Presentation orchestrator.
 *
 * Takes a slide plan (from outline-parser) and a theme name,
 * builds the full Marp markdown document, and writes it to slides/.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { PATHS, MARP } from '../utils/config.mjs'
import { parseOutline } from './outline-parser.mjs'
import { renderSlide } from './slide-templates.mjs'

/**
 * Build the Marp frontmatter block.
 */
function buildFrontmatter({ theme, paginate = true, header = '', footer = '' }) {
  const lines = [
    '---',
    'marp: true',
    `theme: ${theme}`,
    `paginate: ${paginate}`,
  ]
  if (header) lines.push(`header: "${header}"`)
  if (footer) lines.push(`footer: "${footer}"`)
  lines.push('---')
  return lines.join('\n')
}

/**
 * Generate a complete Marp presentation from an outline.
 *
 * @param {Object} opts
 * @param {string} opts.topic     - Presentation title / topic
 * @param {string} [opts.outline] - Raw outline text (or topic is used as title only)
 * @param {string} [opts.theme]   - Marp theme name (default: 'corporate')
 * @param {string} [opts.subtitle] - Subtitle for title slide
 * @param {string} [opts.header]  - Slide header text
 * @param {string} [opts.footer]  - Slide footer text
 * @param {string} [opts.output]  - Output filename (without .md) in slides/
 * @param {import('../ingest/style-extractor.mjs').ExtractedPresentation} [opts.extracted]
 *   - If provided, use ingested slide content as the outline
 * @returns {string} Path to the written .md file
 */
export function generatePresentation({
  topic,
  outline = '',
  theme = MARP.defaultTheme,
  subtitle = '',
  header = '',
  footer = '',
  output = '',
  extracted = null,
}) {
  let slidePlan

  if (extracted) {
    // Convert ingested slides into a slide plan
    slidePlan = extracted.slides.map(s => ({
      type: s.layout === 'title' ? 'title'
          : s.layout === 'section' ? 'section'
          : 'content',
      title: s.title || '(Untitled)',
      subtitle: s.index === 0 ? s.body : undefined,
      bullets: s.index !== 0 && s.body
        ? s.body.split('\n').filter(Boolean)
        : [],
      notes: s.notes,
      backgroundImage: s.backgroundImage,
    }))

    if (!slidePlan.find(s => s.type === 'closing')) {
      slidePlan.push({ type: 'closing', title: 'Thank You' })
    }
  } else {
    const rawOutline = outline || topic
    slidePlan = parseOutline(rawOutline, { title: topic, subtitle })
  }

  const frontmatter = buildFrontmatter({ theme, header, footer })
  const slides = slidePlan.map(renderSlide)
  const markdown = [frontmatter, ...slides].join('\n\n---\n\n')

  const slidesDir = PATHS.slides
  if (!existsSync(slidesDir)) mkdirSync(slidesDir, { recursive: true })

  const slug = output || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
  const outPath = resolve(slidesDir, `${slug}.md`)
  writeFileSync(outPath, markdown, 'utf8')

  return outPath
}
