import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../')

// Load .env if present
const envPath = resolve(ROOT, '.env')
if (existsSync(envPath)) {
  const { config } = await import('dotenv')
  config({ path: envPath })
}

export const PATHS = {
  root: ROOT,
  themes: resolve(ROOT, 'themes'),
  templates: resolve(ROOT, 'templates'),
  slides: resolve(ROOT, 'slides'),
  assets: resolve(ROOT, 'assets'),
  dist: resolve(ROOT, 'dist'),
}

export const GOOGLE = {
  serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
    ? resolve(ROOT, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
    : null,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback',
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
}

export const MARP = {
  themes: ['corporate', 'tech', 'minimal'],
  defaultTheme: 'corporate',
  slideWidth: 1280,
  slideHeight: 720,
}
