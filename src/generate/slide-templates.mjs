/**
 * Per-slide-type Marp markdown generators.
 *
 * Each function returns a string of valid Marp markdown for one slide,
 * not including the `---` separator (the caller adds those).
 */

// ── Title slide ───────────────────────────────────────────────────────────────

export function titleSlide({ title, subtitle = '', backgroundImage = null }) {
  const bg = backgroundImage ? `\n![bg](${backgroundImage})` : ''
  return `<!-- _class: lead -->
<!-- _paginate: skip -->
${bg}
# ${title}
${subtitle ? `\n## ${subtitle}` : ''}`.trim()
}

// ── Section header ────────────────────────────────────────────────────────────

export function sectionSlide({ title, subtitle = '' }) {
  return `<!-- _class: lead invert -->
<!-- _paginate: skip -->

# ${title}
${subtitle ? `\n## ${subtitle}` : ''}`.trim()
}

// ── Content slide (bullets) ───────────────────────────────────────────────────

export function contentSlide({ title, bullets = [], body = '', notes = '' }) {
  const bulletLines = bullets.length
    ? bullets.map(b => `- ${b}`).join('\n')
    : ''
  const bodyLine = body ? `\n${body}` : ''
  const noteBlock = notes ? `\n\n<!--\n${notes}\n-->` : ''

  return `## ${title}

${bulletLines}${bodyLine}${noteBlock}`.trim()
}

// ── Two-column slide ──────────────────────────────────────────────────────────

export function twoColumnSlide({ title, left = '', right = '', imageLeft = null }) {
  if (imageLeft) {
    // Image left, text right
    return `## ${title}

![bg left:45%](${imageLeft})

${right || left}`.trim()
  }

  // Text split — use HTML table (requires html: true in marp config)
  return `## ${title}

<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:8px">
<div>

${left}

</div>
<div>

${right}

</div>
</div>`.trim()
}

// ── Image slide ───────────────────────────────────────────────────────────────

export function imageSlide({ title, imageUrl, caption = '' }) {
  return `<!-- _class: lead -->

![bg cover](${imageUrl})

<div style="background:rgba(0,0,0,0.55);padding:24px 40px;border-radius:8px">

# ${title}
${caption ? `\n${caption}` : ''}

</div>`.trim()
}

// ── Quote slide ───────────────────────────────────────────────────────────────

export function quoteSlide({ quote, attribution = '', context = '' }) {
  return `<!-- _class: lead -->

> ${quote}
${attribution ? `>\n> — *${attribution}*` : ''}
${context ? `\n${context}` : ''}`.trim()
}

// ── Closing slide ─────────────────────────────────────────────────────────────

export function closingSlide({ title = 'Thank You', contact = '', website = '' }) {
  const contactLine = contact ? `\n\n## ${contact}` : ''
  const websiteLine = website ? `\n${website}` : ''
  return `<!-- _class: lead -->
<!-- _paginate: skip -->

# ${title}
${contactLine}${websiteLine}`.trim()
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

/**
 * Render any slide plan entry to Marp markdown.
 *
 * @param {import('./outline-parser.mjs').SlidePlan} slide
 * @returns {string}
 */
export function renderSlide(slide) {
  switch (slide.type) {
    case 'title':    return titleSlide(slide)
    case 'section':  return sectionSlide(slide)
    case 'content':  return contentSlide(slide)
    case 'two-column': return twoColumnSlide(slide)
    case 'image':    return imageSlide(slide)
    case 'quote':    return quoteSlide(slide)
    case 'closing':  return closingSlide(slide)
    default:         return contentSlide(slide)
  }
}
