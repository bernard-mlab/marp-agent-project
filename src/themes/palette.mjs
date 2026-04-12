/**
 * Color palette utilities.
 * Uses tinycolor2 for manipulation, contrast, and WCAG checking.
 */

import tinycolor from 'tinycolor2'

/**
 * Ensure text color has sufficient contrast against background.
 * Adjusts foreground until WCAG AA (4.5:1) is satisfied.
 */
export function ensureContrast(fg, bg, minRatio = 4.5) {
  let color = tinycolor(fg)
  const background = tinycolor(bg)
  const isLight = background.isLight()
  let attempts = 0

  while (tinycolor.readability(color, background) < minRatio && attempts < 20) {
    color = isLight ? color.darken(5) : color.lighten(5)
    attempts++
  }

  return color.toHexString()
}

/**
 * Generate a set of variants (light, dark, muted) from a base color.
 */
export function generateVariants(hex) {
  const base = tinycolor(hex)
  return {
    base: base.toHexString(),
    light: base.clone().lighten(20).toHexString(),
    lighter: base.clone().lighten(40).toHexString(),
    dark: base.clone().darken(15).toHexString(),
    darker: base.clone().darken(30).toHexString(),
    muted: base.clone().desaturate(30).lighten(10).toHexString(),
  }
}

/**
 * Determine if a background is light (return true) or dark (return false).
 */
export function isLightBackground(hex) {
  return tinycolor(hex).isLight()
}

/**
 * Pick a readable foreground color (black or white) for a given background.
 */
export function readableOn(bg) {
  return tinycolor(bg).isLight() ? '#111111' : '#ffffff'
}

/**
 * Mix two colors with an optional weight (0-100, default 50).
 */
export function mix(color1, color2, weight = 50) {
  return tinycolor.mix(color1, color2, weight).toHexString()
}

/**
 * Convert a Google Slides RGBA color object (0-1 range) to hex.
 */
export function googleColorToHex({ red = 0, green = 0, blue = 0 } = {}) {
  const r = Math.round(red * 255).toString(16).padStart(2, '0')
  const g = Math.round(green * 255).toString(16).padStart(2, '0')
  const b = Math.round(blue * 255).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}
