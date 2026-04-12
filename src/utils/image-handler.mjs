import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { resolve, extname, basename } from 'path'
import { pipeline } from 'stream/promises'
import { PATHS } from './config.mjs'

/**
 * Download an image from a URL and save it to the assets directory.
 * Returns the local file path (relative to project root).
 */
export async function downloadImage(url, filename) {
  const assetsDir = PATHS.assets
  if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true })

  const ext = extname(filename) || '.png'
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
  const localPath = resolve(assetsDir, safeName)

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download image: ${response.status} ${url}`)

  await pipeline(response.body, createWriteStream(localPath))
  return `./assets/${safeName}`
}

/**
 * Resize an image using sharp to fit within maxWidth x maxHeight.
 * Returns the output path.
 */
export async function resizeImage(inputPath, outputPath, maxWidth = 1280, maxHeight = 720) {
  const { default: sharp } = await import('sharp')
  await sharp(inputPath)
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
    .toFile(outputPath)
  return outputPath
}
