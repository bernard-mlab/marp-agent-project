import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, rmSync } from 'node:fs'
import { generateTheme } from '../../src/themes/generator.mjs'

test('generated theme imports marpx and defines marpx variables', () => {
  const out = generateTheme(
    {
      colorScheme: {
        primary: '#123456',
        accent: '#2aaaff',
        background: '#ffffff',
        text: '#111111',
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      dimensions: { width: 1280, height: 720 },
    },
    'custom-test-marpx'
  )

  try {
    const css = readFileSync(out, 'utf8')
    assert.match(css, /@import\s+"marpx";/)
    assert.match(css, /--marpx-theme-background-color:/)
    assert.match(css, /--marpx-theme-font-color:/)
  } finally {
    rmSync(out, { force: true })
  }
})
