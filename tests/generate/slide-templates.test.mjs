import test from 'node:test'
import assert from 'node:assert/strict'
import { renderSlide } from '../../src/generate/slide-templates.mjs'

test('title slide uses title-academic', () => {
  const rendered = renderSlide({ type: 'title', title: 'Deck' })
  assert.match(rendered, /_class:\s*title-academic\b/)
  assert.match(rendered, /_class:\s*[^\n]*\blead\b/)
})

test('section slide uses chapter', () => {
  const rendered = renderSlide({ type: 'section', title: 'Part 1' })
  assert.match(rendered, /_class:\s*chapter\b/)
  assert.match(rendered, /_class:\s*[^\n]*\blead\b/)
  assert.match(rendered, /_class:\s*[^\n]*\binvert\b/)
})

test('closing slide uses end', () => {
  const rendered = renderSlide({ type: 'closing', title: 'Thanks' })
  assert.match(rendered, /_class:\s*end\b/)
  assert.match(rendered, /_class:\s*[^\n]*\blead\b/)
})

test('toc and references types are renderable', () => {
  assert.match(renderSlide({ type: 'toc', title: 'Contents', bullets: ['Intro'] }), /_class:\s*toc/)
  assert.match(
    renderSlide({ type: 'references', title: 'References', bullets: ['[1] Source'] }),
    /_class:\s*references/
  )
})

test('image slide accepts backgroundImage field', () => {
  const rendered = renderSlide({ type: 'image', title: 'Hero', backgroundImage: './assets/hero.png' })
  assert.match(rendered, /!\[bg cover\]\(\.\/assets\/hero\.png\)/)
})

test('two-column slide uses backgroundImage for left panel image', () => {
  const rendered = renderSlide({
    type: 'two-column',
    title: 'Split',
    right: '- Point A',
    backgroundImage: './assets/left.png',
  })

  assert.match(rendered, /!\[bg left:45%\]\(\.\/assets\/left\.png\)/)
})
