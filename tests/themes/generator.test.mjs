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

test('font family names are escaped before CSS interpolation', () => {
  const out = generateTheme(
    {
      colorScheme: {
        primary: '#123456',
        accent: '#2aaaff',
        background: '#ffffff',
        text: '#111111',
      },
      fonts: { heading: "Brand'Font", body: 'Body\\Font' },
      dimensions: { width: 1280, height: 720 },
    },
    'font-escape-test'
  )

  try {
    const css = readFileSync(out, 'utf8')
    assert.match(css, /font-family: 'Brand\\'Font', Georgia, serif;/)
    assert.match(css, /--marpx-theme-font-family: 'Body\\\\Font', system-ui, sans-serif;/)
  } finally {
    rmSync(out, { force: true })
  }
})

test('dimensions normalize to fixed marp output sizes by aspect ratio', () => {
  const widescreenOut = generateTheme(
    {
      colorScheme: {
        primary: '#123456',
        accent: '#2aaaff',
        background: '#ffffff',
        text: '#111111',
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      dimensions: { width: 1920, height: 1080 },
    },
    'dimension-widescreen'
  )

  const standardOut = generateTheme(
    {
      colorScheme: {
        primary: '#123456',
        accent: '#2aaaff',
        background: '#ffffff',
        text: '#111111',
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      dimensions: { width: 1024, height: 768 },
    },
    'dimension-standard'
  )

  try {
    const widescreenCss = readFileSync(widescreenOut, 'utf8')
    assert.match(widescreenCss, /width: 1280px;/)
    assert.match(widescreenCss, /height: 720px;/)

    const standardCss = readFileSync(standardOut, 'utf8')
    assert.match(standardCss, /width: 960px;/)
    assert.match(standardCss, /height: 720px;/)
  } finally {
    rmSync(widescreenOut, { force: true })
    rmSync(standardOut, { force: true })
  }
})
