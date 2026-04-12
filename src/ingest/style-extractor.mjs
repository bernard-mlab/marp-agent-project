/**
 * Style extractor — unified interface and normalized output schema.
 *
 * Routes to the correct parser based on input type and returns
 * a consistent ExtractedPresentation object regardless of source.
 *
 * @typedef {Object} ColorScheme
 * @property {string} primary     - Main brand/text color (hex)
 * @property {string} secondary   - Secondary UI color (hex)
 * @property {string} accent      - Highlight/call-to-action color (hex)
 * @property {string} background  - Slide background color (hex)
 * @property {string} text        - Body text color (hex)
 *
 * @typedef {Object} SlideEntry
 * @property {number} index
 * @property {'title'|'section'|'content'|'two-column'|'image'|'blank'} layout
 * @property {string} title
 * @property {string} body
 * @property {string} notes
 * @property {string|null} backgroundColor
 * @property {string|null} backgroundImage
 *
 * @typedef {Object} ExtractedPresentation
 * @property {{ title: string, subtitle: string, author: string, slideCount: number, source: string, sourceId: string }} metadata
 * @property {{ width: number, height: number }} dimensions
 * @property {ColorScheme} colorScheme
 * @property {{ heading: string|null, body: string|null }} fonts
 * @property {SlideEntry[]} slides
 */

import { extname } from 'path'

/**
 * Ingest a presentation from any supported source and return
 * the normalized ExtractedPresentation structure.
 *
 * @param {Object} opts
 * @param {string} [opts.url]  - Google Slides URL or presentation ID
 * @param {string} [opts.file] - Path to a .pptx file
 * @returns {Promise<ExtractedPresentation>}
 */
export async function extractPresentation({ url, file }) {
  if (url) {
    const { ingestGoogleSlides } = await import('./google-slides.mjs')
    return ingestGoogleSlides(url)
  }

  if (file) {
    const ext = extname(file).toLowerCase()
    if (ext === '.pptx') {
      const { parsePptx } = await import('./pptx-parser.mjs')
      return parsePptx(file)
    }
    throw new Error(`Unsupported file type: ${ext}. Supported: .pptx`)
  }

  throw new Error('Provide either --url or --file')
}

/**
 * Derive a slug-friendly name from a presentation title.
 */
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
