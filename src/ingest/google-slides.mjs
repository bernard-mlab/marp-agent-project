/**
 * Google Slides API ingestion.
 *
 * Extracts slide structure, color scheme, fonts, and layout types
 * from a Google Slides presentation via the Slides API v1.
 *
 * Auth: supports service account (preferred) or OAuth2 with refresh token.
 * Both are configured via environment variables — see .env.example.
 */

import { google } from 'googleapis'
import { existsSync, readFileSync } from 'fs'
import { GOOGLE } from '../utils/config.mjs'
import { downloadImage } from '../utils/image-handler.mjs'

// ── Auth ──────────────────────────────────────────────────────────────────────

function getAuthClient() {
  if (GOOGLE.serviceAccountKeyPath && existsSync(GOOGLE.serviceAccountKeyPath)) {
    const key = JSON.parse(readFileSync(GOOGLE.serviceAccountKeyPath, 'utf8'))
    return new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/presentations.readonly'],
    })
  }

  if (GOOGLE.clientId && GOOGLE.clientSecret && GOOGLE.refreshToken) {
    const oauth2 = new google.auth.OAuth2(GOOGLE.clientId, GOOGLE.clientSecret, GOOGLE.redirectUri)
    oauth2.setCredentials({ refresh_token: GOOGLE.refreshToken })
    return oauth2
  }

  throw new Error(
    'No Google credentials found.\n' +
    'Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or OAuth2 vars in .env\n' +
    'See .env.example for details.'
  )
}

// ── Presentation ID parsing ───────────────────────────────────────────────────

export function parsePresentationId(urlOrId) {
  const match = urlOrId.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : urlOrId
}

// ── Color extraction ──────────────────────────────────────────────────────────

function rgbToHex({ red = 0, green = 0, blue = 0 }) {
  const r = Math.round(red * 255)
  const g = Math.round(green * 255)
  const b = Math.round(blue * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function extractThemeColors(master) {
  const colors = {}
  const themeColors = master?.masterProperties?.themeColors ?? []
  for (const { type, color } of themeColors) {
    if (color?.rgbColor) colors[type] = rgbToHex(color.rgbColor)
  }
  return colors
}

function resolveColor(colorObj, themeColors) {
  if (!colorObj) return null
  if (colorObj.rgbColor) return rgbToHex(colorObj.rgbColor)
  if (colorObj.themeColor && themeColors[colorObj.themeColor]) {
    return themeColors[colorObj.themeColor]
  }
  return null
}

// ── Layout classification ─────────────────────────────────────────────────────

const LAYOUT_MAP = {
  TITLE: 'title',
  TITLE_AND_BODY: 'content',
  TITLE_AND_TWO_COLUMNS: 'two-column',
  ONE_COLUMN_TEXT: 'content',
  MAIN_POINT: 'section',
  SECTION_HEADER: 'section',
  BLANK: 'blank',
  BIG_NUMBER: 'section',
  CAPTION_ONLY: 'content',
}

function classifyLayout(layoutName) {
  return LAYOUT_MAP[layoutName] ?? 'content'
}

// ── Text extraction from a slide ──────────────────────────────────────────────

function extractText(elements, placeholderTypes) {
  const result = {}
  for (const el of elements ?? []) {
    const ph = el.shape?.placeholder
    if (!ph || !placeholderTypes.includes(ph.type)) continue
    const text = el.shape?.text?.textElements
      ?.filter(t => t.textRun)
      .map(t => t.textRun.content.trim())
      .join(' ')
      .trim()
    if (text) result[ph.type] = text
  }
  return result
}

// ── Background color / image ──────────────────────────────────────────────────

async function extractBackground(slide, themeColors, slideIndex) {
  const bg = slide.pageProperties?.pageBackgroundFill
  if (!bg) return { color: null, image: null }

  if (bg.solidFill) {
    return { color: resolveColor(bg.solidFill.color, themeColors), image: null }
  }

  if (bg.stretchedPictureFill?.contentUrl) {
    const url = bg.stretchedPictureFill.contentUrl
    try {
      const localPath = await downloadImage(url, `slide-${slideIndex}-bg.png`)
      return { color: null, image: localPath }
    } catch {
      return { color: null, image: null }
    }
  }

  return { color: null, image: null }
}

// ── Font extraction ───────────────────────────────────────────────────────────

function extractFonts(master) {
  const fonts = { heading: null, body: null }
  for (const el of master?.pageElements ?? []) {
    const style = el.shape?.text?.textElements?.[0]?.textRun?.style
    if (style?.fontFamily) {
      const ph = el.shape?.placeholder?.type
      if (['TITLE', 'CENTERED_TITLE'].includes(ph)) fonts.heading = style.fontFamily
      else if (['BODY', 'SUBTITLE'].includes(ph)) fonts.body = style.fontFamily
    }
  }
  return fonts
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Ingest a Google Slides presentation.
 *
 * @param {string} urlOrId - Presentation URL or bare ID
 * @returns {Promise<import('../ingest/style-extractor.mjs').ExtractedPresentation>}
 */
export async function ingestGoogleSlides(urlOrId) {
  const presentationId = parsePresentationId(urlOrId)
  const auth = getAuthClient()
  const slides = google.slides({ version: 'v1', auth })

  const { data } = await slides.presentations.get({ presentationId })

  const master = data.masters?.[0]
  const themeColors = extractThemeColors(master)
  const fonts = extractFonts(master)

  // Map layout objectId → layout name
  const layoutNames = {}
  for (const layout of data.layouts ?? []) {
    layoutNames[layout.objectId] = layout.layoutProperties?.name ?? 'CONTENT'
  }

  // Dimensions (EMUs → pixels at 96dpi: 1px = 914400/96 EMUs = 9525 EMUs)
  const emusPerPx = 9525
  const width = Math.round((data.pageSize?.width?.magnitude ?? 9144000) / emusPerPx)
  const height = Math.round((data.pageSize?.height?.magnitude ?? 5143500) / emusPerPx)

  // Build color scheme from theme colors
  const colorScheme = {
    primary: themeColors['DARK1'] ?? themeColors['TEXT1'] ?? '#1a1a1a',
    secondary: themeColors['DARK2'] ?? themeColors['TEXT2'] ?? '#444444',
    accent: themeColors['ACCENT1'] ?? '#2563eb',
    background: themeColors['LIGHT1'] ?? themeColors['BACKGROUND1'] ?? '#ffffff',
    text: themeColors['DARK1'] ?? themeColors['TEXT1'] ?? '#1a1a1a',
  }

  // Process each slide
  const processedSlides = []
  for (let i = 0; i < (data.slides ?? []).length; i++) {
    const slide = data.slides[i]
    const layoutId = slide.slideProperties?.layoutObjectId
    const layoutName = layoutNames[layoutId] ?? 'CONTENT'
    const layout = classifyLayout(layoutName)

    const titleTypes = ['TITLE', 'CENTERED_TITLE']
    const bodyTypes = ['BODY', 'SUBTITLE', 'OBJECT']
    const notesTypes = ['BODY']

    const titleTexts = extractText(slide.pageElements, titleTypes)
    const bodyTexts = extractText(slide.pageElements, bodyTypes)
    const notesTexts = extractText(
      slide.slideProperties?.notesPage?.pageElements ?? [],
      notesTypes
    )

    const bg = await extractBackground(slide, themeColors, i)

    processedSlides.push({
      index: i,
      layout,
      title: Object.values(titleTexts)[0] ?? '',
      body: Object.values(bodyTexts)[0] ?? '',
      notes: Object.values(notesTexts)[0] ?? '',
      backgroundColor: bg.color,
      backgroundImage: bg.image,
    })
  }

  return {
    metadata: {
      title: data.title ?? 'Untitled Presentation',
      subtitle: processedSlides[0]?.body ?? '',
      author: '',
      slideCount: processedSlides.length,
      source: 'google-slides',
      sourceId: presentationId,
    },
    dimensions: { width, height },
    colorScheme,
    fonts,
    slides: processedSlides,
  }
}
