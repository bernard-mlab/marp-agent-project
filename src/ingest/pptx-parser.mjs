/**
 * PPTX file parser — zero-auth fallback.
 *
 * Parses an exported PPTX file using JSZip + XML parsing to extract
 * slide structure, color scheme, fonts, and text content.
 *
 * Use when Google API access is unavailable (no credentials).
 * Export from Google Slides: File → Download → PowerPoint (.pptx)
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, extname } from 'path'
import { PATHS } from '../utils/config.mjs'

// ── XML helpers ───────────────────────────────────────────────────────────────

/** Minimal XML tag value extractor — avoids heavy XML lib dependency */
function getTagContent(xml, tag) {
  const re = new RegExp(`<(?:a:|p:|r:|)[^>]*${tag}[^>]*>([^<]*)<`, 'i')
  return xml.match(re)?.[1] ?? null
}

function getAllTagContents(xml, tag) {
  const re = new RegExp(`<(?:a:|p:|r:|)[^>]*${tag}[^>]*>([^<]+)<`, 'gi')
  return [...xml.matchAll(re)].map(m => m[1].trim()).filter(Boolean)
}

function getAttrValue(xml, tag, attr) {
  const re = new RegExp(`<[^>]*${tag}[^>]*${attr}="([^"]*)"`, 'i')
  return xml.match(re)?.[1] ?? null
}

// ── Color parsing ─────────────────────────────────────────────────────────────

function parseHexColor(str) {
  if (!str) return null
  const clean = str.replace(/^#/, '').replace(/^FF/, '')
  return clean.length === 6 ? `#${clean.toLowerCase()}` : null
}

function extractThemeColors(themeXml) {
  const colors = {}
  const dk1 = getAttrValue(themeXml, 'dk1', 'lastClr') || getAttrValue(themeXml, 'dk1', 'val')
  const lt1 = getAttrValue(themeXml, 'lt1', 'lastClr') || getAttrValue(themeXml, 'lt1', 'val')
  const accent1 = getAttrValue(themeXml, 'accent1', 'val')

  if (dk1) colors.primary = parseHexColor(dk1)
  if (lt1) colors.background = parseHexColor(lt1)
  if (accent1) colors.accent = parseHexColor(accent1)

  return colors
}

// ── Slide classification ──────────────────────────────────────────────────────

function classifySlide(slideXml, slideIndex) {
  if (slideIndex === 0) return 'title'
  const hasTitle = slideXml.includes('<p:sp') && slideXml.match(/type="title"/i)
  const hasBody = slideXml.includes('<p:sp') && slideXml.match(/type="body"/i)
  if (hasTitle && !hasBody) return 'section'
  return 'content'
}

// ── Text extraction ───────────────────────────────────────────────────────────

function extractSlideText(slideXml) {
  // Extract all text runs inside text bodies
  const texts = getAllTagContents(slideXml, 't')
  const full = texts.join(' ').trim()

  // Try to split into title (first paragraph group) and body (rest)
  const spBlocks = [...slideXml.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/gi)]
  let title = ''
  let body = ''

  for (const block of spBlocks) {
    const spXml = block[1]
    const isTitle = /type="(?:title|ctrTitle)"/i.test(spXml)
    const blockTexts = getAllTagContents(spXml, 't').join(' ').trim()

    if (isTitle && !title) title = blockTexts
    else if (blockTexts && !isTitle) body += (body ? '\n' : '') + blockTexts
  }

  return { title: title || texts[0] || '', body: body || texts.slice(1).join(' ') }
}

// ── Font extraction ───────────────────────────────────────────────────────────

function extractFontsFromTheme(themeXml) {
  const majorFont = getAttrValue(themeXml, 'latin', 'typeface') ||
                    themeXml.match(/<a:majorFont[^>]*>[\s\S]*?<a:latin typeface="([^"]+)"/)?.[1]
  const minorFont = themeXml.match(/<a:minorFont[^>]*>[\s\S]*?<a:latin typeface="([^"]+)"/)?.[1]
  return {
    heading: majorFont ?? null,
    body: minorFont ?? null,
  }
}

// ── Image extraction ──────────────────────────────────────────────────────────

async function extractImages(zip, slideNum) {
  const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`
  const relsFile = zip.file(relsPath)
  if (!relsFile) return []

  const relsXml = await relsFile.async('text')
  const imageRels = [...relsXml.matchAll(/Type="[^"]*\/image"[^>]*Target="([^"]+)"/gi)]
  const saved = []

  for (const [, target] of imageRels) {
    const imgPath = `ppt/slides/${target}`.replace(/\/\.\.\//g, match => {
      return match.replace('../', '')
    })
    const normalized = `ppt/${target.replace(/^\.\.\//, '')}`
    const imgFile = zip.file(normalized)
    if (!imgFile) continue

    const ext = extname(normalized) || '.png'
    const filename = `slide${slideNum}-img${saved.length + 1}${ext}`
    const outPath = resolve(PATHS.assets, filename)

    if (!existsSync(PATHS.assets)) mkdirSync(PATHS.assets, { recursive: true })
    const buffer = await imgFile.async('nodebuffer')
    writeFileSync(outPath, buffer)
    saved.push(`./assets/${filename}`)
  }

  return saved
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Parse a PPTX file into the normalized presentation structure.
 *
 * @param {string} filePath - Absolute path to .pptx file
 * @returns {Promise<import('./style-extractor.mjs').ExtractedPresentation>}
 */
export async function parsePptx(filePath) {
  const { default: JSZip } = await import('jszip')

  const buffer = readFileSync(filePath)
  const zip = await JSZip.loadAsync(buffer)

  // Read theme
  const themeFile = zip.file('ppt/theme/theme1.xml')
  const themeXml = themeFile ? await themeFile.async('text') : ''
  const themeColors = extractThemeColors(themeXml)
  const fonts = extractFontsFromTheme(themeXml)

  // Read presentation for slide count and dimensions
  const presFile = zip.file('ppt/presentation.xml')
  const presXml = presFile ? await presFile.async('text') : ''

  const cxMatch = presXml.match(/cx="(\d+)"/)
  const cyMatch = presXml.match(/cy="(\d+)"/)
  const emusPerPx = 9525
  const width = cxMatch ? Math.round(parseInt(cxMatch[1]) / emusPerPx) : 960
  const height = cyMatch ? Math.round(parseInt(cyMatch[1]) / emusPerPx) : 540

  // Enumerate slides
  const slideFiles = Object.keys(zip.files)
    .filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)[1])
      const nb = parseInt(b.match(/slide(\d+)/)[1])
      return na - nb
    })

  const processedSlides = []
  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.file(slideFiles[i]).async('text')
    const slideNum = i + 1
    const { title, body } = extractSlideText(slideXml)
    const layout = classifySlide(slideXml, i)
    const images = await extractImages(zip, slideNum)

    processedSlides.push({
      index: i,
      layout,
      title,
      body,
      notes: '',
      backgroundColor: null,
      backgroundImage: images[0] ?? null,
    })
  }

  const colorScheme = {
    primary: themeColors.primary ?? '#1a1a1a',
    secondary: '#444444',
    accent: themeColors.accent ?? '#2563eb',
    background: themeColors.background ?? '#ffffff',
    text: themeColors.primary ?? '#1a1a1a',
  }

  return {
    metadata: {
      title: processedSlides[0]?.title ?? 'Imported Presentation',
      subtitle: processedSlides[0]?.body ?? '',
      author: '',
      slideCount: processedSlides.length,
      source: 'pptx',
      sourceId: filePath,
    },
    dimensions: { width, height },
    colorScheme,
    fonts,
    slides: processedSlides,
  }
}
