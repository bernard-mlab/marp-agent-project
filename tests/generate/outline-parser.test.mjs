import test from 'node:test'
import assert from 'node:assert/strict'
import { parseOutline } from '../../src/generate/outline-parser.mjs'

test('JSON outline keeps toc/references types', () => {
  const slides = parseOutline(JSON.stringify([
    { type: 'title', title: 'Deck' },
    { type: 'toc', title: 'Contents', bullets: ['Intro'] },
    { type: 'references', title: 'References', bullets: ['[1] Paper'] },
  ]))

  assert.equal(slides.some(s => s.type === 'toc'), true)
  assert.equal(slides.some(s => s.type === 'references'), true)
})

test('Markdown headings classify TOC and References slides', () => {
  const slides = parseOutline(`
# Deck

## Table of Contents
- Intro
- Roadmap

## References
- [1] MarpX parser spec
`)

  const tocSlide = slides.find(s => s.type === 'toc')
  const referencesSlide = slides.find(s => s.type === 'references')

  assert.ok(tocSlide)
  assert.deepEqual(tocSlide.bullets, ['Intro', 'Roadmap'])

  assert.ok(referencesSlide)
  assert.deepEqual(referencesSlide.bullets, ['[1] MarpX parser spec'])
})

test('JSON outline preserves backgroundImage slide field', () => {
  const slides = parseOutline(JSON.stringify([
    { type: 'title', title: 'Deck' },
    { type: 'image', title: 'Visual', backgroundImage: './assets/visual.png' },
  ]))

  const imageSlide = slides.find(s => s.type === 'image')
  assert.equal(imageSlide.backgroundImage, './assets/visual.png')
})
