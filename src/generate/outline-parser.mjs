/**
 * Outline parser.
 *
 * Converts a plain text or bullet-list outline into a structured slide plan
 * that the presentation generator can iterate over.
 *
 * Input formats accepted:
 *   - Plain text (one thought per line)
 *   - Markdown-style bullets (-, *, 1.)
 *   - JSON array of { type, title, body, bullets } objects
 *
 * @typedef {'title'|'section'|'content'|'two-column'|'image'|'closing'} SlideType
 *
 * @typedef {Object} SlidePlan
 * @property {SlideType} type
 * @property {string} title
 * @property {string} [subtitle]
 * @property {string[]} [bullets]
 * @property {string} [body]
 * @property {string} [left]
 * @property {string} [right]
 * @property {string} [imageUrl]
 * @property {string} [notes]
 */

/**
 * Parse raw outline text into an array of SlidePlan objects.
 *
 * @param {string} raw - Raw outline text, markdown, or JSON
 * @param {Object} [opts]
 * @param {string} [opts.title] - Override presentation title
 * @param {string} [opts.subtitle] - Override subtitle
 * @returns {SlidePlan[]}
 */
export function parseOutline(raw, { title = '', subtitle = '' } = {}) {
  raw = raw.trim()

  // JSON input
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw)
      const slides = Array.isArray(parsed) ? parsed : [parsed]
      if (!slides.find(s => s.type === 'title')) {
        slides.unshift({ type: 'title', title: title || 'Presentation', subtitle })
      }
      if (!slides.find(s => s.type === 'closing')) {
        slides.push({ type: 'closing', title: 'Thank You' })
      }
      return slides
    } catch {
      // Fall through to text parsing
    }
  }

  // Text / markdown parsing
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const slides = []

  // Always start with a title slide
  const inferredTitle = title || lines[0]?.replace(/^[#*\-\d.]+\s*/, '') || 'Presentation'
  slides.push({ type: 'title', title: inferredTitle, subtitle })

  let currentSlide = null
  let bulletBuffer = []

  function flushCurrent() {
    if (!currentSlide) return
    if (bulletBuffer.length > 0) {
      currentSlide.bullets = bulletBuffer
      bulletBuffer = []
    }
    slides.push(currentSlide)
    currentSlide = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isBullet = /^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)
    const isH1 = /^#\s+/.test(line)
    const isH2 = /^##\s+/.test(line)
    const isSection = /^(section|part|chapter):?\s+/i.test(line)

    if (i === 0 && !isH1 && !isH2) continue // skip first line — used as title

    if (isH1 || isSection) {
      flushCurrent()
      const sectionTitle = line.replace(/^#+\s+|^(section|part|chapter):?\s+/i, '')
      currentSlide = { type: 'section', title: sectionTitle }
      continue
    }

    if (isH2) {
      flushCurrent()
      const slideTitle = line.replace(/^#+\s+/, '')
      currentSlide = { type: 'content', title: slideTitle, bullets: [] }
      continue
    }

    if (isBullet) {
      const text = line.replace(/^[-*•]\s+|\d+\.\s+/, '')
      if (!currentSlide) {
        currentSlide = { type: 'content', title: 'Key Points', bullets: [] }
      }
      bulletBuffer.push(text)
      continue
    }

    // Plain text line — treat as body for current slide or a new content slide
    if (currentSlide) {
      currentSlide.body = (currentSlide.body ? currentSlide.body + ' ' : '') + line
    } else {
      flushCurrent()
      currentSlide = { type: 'content', title: line, bullets: [] }
    }
  }

  flushCurrent()

  // Always end with closing
  slides.push({ type: 'closing', title: 'Thank You' })

  return slides
}
