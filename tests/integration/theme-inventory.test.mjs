import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { MARP, PATHS } from '../../src/utils/config.mjs'

test('default theme is godel', () => {
  assert.equal(MARP.defaultTheme, 'godel')
})

test('required marpx theme files exist', () => {
  for (const name of ['marpx.css', 'godel.css', 'socrates.css', 'sparta.css']) {
    assert.equal(existsSync(resolve(PATHS.themes, name)), true, name)
  }
})
