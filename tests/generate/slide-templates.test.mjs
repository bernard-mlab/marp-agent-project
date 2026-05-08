import test from 'node:test'
import assert from 'node:assert/strict'
import { renderSlide } from '../../src/generate/slide-templates.mjs'

test('title slide uses title-academic', () => {
  assert.match(renderSlide({ type: 'title', title: 'Deck' }), /_class:\s*title-academic/)
})

test('section slide uses chapter', () => {
  assert.match(renderSlide({ type: 'section', title: 'Part 1' }), /_class:\s*chapter/)
})

test('closing slide uses end', () => {
  assert.match(renderSlide({ type: 'closing', title: 'Thanks' }), /_class:\s*end/)
})

test('toc and references types are renderable', () => {
  assert.match(renderSlide({ type: 'toc', title: 'Contents', bullets: ['Intro'] }), /_class:\s*toc/)
  assert.match(
    renderSlide({ type: 'references', title: 'References', bullets: ['[1] Source'] }),
    /_class:\s*references/
  )
})
