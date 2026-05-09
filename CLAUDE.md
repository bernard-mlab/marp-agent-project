# marp-agent-project — Agent Guide

Marp presentation builder driven by Claude Code.
This file is the single source of truth for how the agent should work with this project.

---

## Project Layout

```
scripts/          CLI entry points (ingest, generate)
src/ingest/       Extraction: google-slides, pptx-parser, style-extractor
src/themes/       palette.mjs (color utils), generator.mjs (CSS output)
src/generate/     outline-parser, slide-templates, presentation orchestrator
src/utils/        config.mjs (env/paths), image-handler.mjs
themes/           CSS theme files — MarpX core (`marpx`, named themes), legacy compatibility, and generated custom-*
templates/        Built-in scaffolds (`<name>.md`) + comprehensive MarpX references (`marpx-<name>.md`)
slides/           Working directory — all active presentations live here
assets/           Downloaded or user-provided images
dist/             Build output (HTML, PDF, PPTX) — gitignored
```

Current seeded content note:
- `slides/` currently contains MarpX sample decks copied from `~/Desktop/Github/MarpX/examples`
- Sample image/media assets are in `slides/assets/`
- For compatibility with this repo's theme names, sample files using `theme: gödel` are normalized to `theme: godel`

---

## Three Agent Workflows

### Workflow A — Ingest a Google Slides Deck

Use when the user provides a Google Slides URL or an exported PPTX.

**Steps:**
1. Confirm source type (URL or file)
2. For URL: verify `.env` has credentials (see Auth Setup below)
3. Run ingest:
   ```
   npm run ingest -- --url "https://docs.google.com/presentation/d/ID/edit"
   npm run ingest -- --file ./export.pptx
   npm run ingest -- --file ./export.pptx --scaffold   # also build a deck
   npm run ingest -- --url <url> --name my-theme       # custom theme name
   ```
4. A CSS theme is written to `themes/custom-<slug>.css`
5. If `--scaffold` was passed, a `.md` deck is written to `slides/`
6. Run `npm run dev` to preview in browser

**Output:** A custom Marp CSS theme matching the source presentation's color palette, fonts, and layout.

---

### Workflow B — Generate a Presentation from Scratch

Use when the user provides a topic, outline, or bullet list.

**Steps:**
1. Clarify: topic only, or a detailed outline?
2. Choose a template/theme: default `godel`, or any built-in MarpX theme (or a custom theme from Workflow A)
3. Run generate:
   ```
   npm run generate -- --topic "Product Launch 2026"
   npm run generate -- --topic "Platform Overview" --template godel
   npm run generate -- --outline ./my-outline.txt --theme custom-my-company
   npm run generate -- --topic "Annual Review" --subtitle "FY2026" --header "ACME" --footer "Confidential"
   ```
4. A `.md` file is written to `slides/`
5. The agent may further edit the file directly for refinements
6. Run `npm run dev` to preview; `npm run build:pdf` for final output

**Outline format (for --outline file or direct editing):**

```markdown
# Presentation Title

## Slide Title
- Bullet point one
- Bullet point two

# Section Header

## Another Slide
Content text here.
```

Or JSON:
```json
[
  { "type": "title", "title": "My Talk", "subtitle": "2026" },
  { "type": "toc", "title": "Agenda", "bullets": ["Part 1", "Part 2"] },
  { "type": "section", "title": "Part 1" },
  { "type": "content", "title": "Key Points", "bullets": ["A", "B", "C"] },
  { "type": "references", "title": "References", "bullets": ["[1] Source"] },
  { "type": "closing", "title": "Thank You", "contact": "name@email.com" }
]
```

---

## Built-in Themes

Default theme is `godel`.

Core MarpX themes:
- `marpx`, `godel`, `socrates`, `sparta`, `cantor`, `church`, `copernicus`, `einstein`
- `frankfurt`, `galileo`, `gauss`, `gropius`, `haskell`, `hobbes`, `lorca`, `newton`

Legacy compatibility themes:
- `corporate`, `tech`, `minimal`

Template note:
- Core built-in scaffolds use `templates/<name>.md` (including `templates/marpx.md` if you add a dedicated marpx-base scaffold)
- Comprehensive MarpX reference scaffolds use `templates/marpx-<name>.md`

---

### Workflow C — Direct Authoring

Use when the user wants to write or edit slides directly.

1. Create or edit a `.md` file in `slides/` using the Marp syntax below
2. Set the theme in front matter: `theme: godel` (or any MarpX theme like `socrates`, `sparta`, etc.; legacy `corporate|tech|minimal`; or `custom-<name>`)
3. Run `npm run dev` for live preview
4. Run `npm run build` / `npm run build:pdf` for output

---

## Build Commands

Supported runtime: Node.js `>=18 <26` (Marp CLI build commands are not compatible with Node 26 in this project).

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Marp dev server with live reload at http://localhost:8080 |
| `npm run build` | Build all slides in `slides/` to HTML in `dist/` |
| `npm run build:pdf` | Build all slides to PDF in `dist/` |
| `npm run build:pptx` | Build all slides to PPTX in `dist/` |
| `npm run ingest` | Run the ingest CLI (pass args with `--`) |
| `npm run generate` | Run the generate CLI (pass args with `--`) |

---

## Marp Syntax Cheat Sheet

### Front Matter (required at top of each .md file)

```yaml
---
marp: true
theme: godel              # default: godel; also socrates/sparta/... or custom-<name>
paginate: true
header: "Header text"
footer: "Footer text"
---
```

### Slide Separator

Use `---` on its own line to create a new slide.

### Local Directives (per-slide overrides)

Place in an HTML comment immediately after `---`:

```markdown
<!-- _class: lead -->          # centered title layout
<!-- _class: lead invert -->   # centered + dark background
<!-- _class: invert -->        # dark background only
<!-- _class: title-academic --> # MarpX title slide
<!-- _class: chapter -->        # MarpX section/chapter divider
<!-- _class: toc -->            # MarpX table-of-contents slide
<!-- _class: references -->     # MarpX references slide
<!-- _class: end -->            # MarpX closing slide
<!-- _paginate: skip -->       # hide page number on this slide
<!-- _backgroundColor: #f0f4fa -->  # override background
<!-- _color: #333 -->               # override text color
```

Use `_` prefix to apply to one slide only. Without `_`, applies forward.

### Image Backgrounds

```markdown
![bg](./assets/image.jpg)              # full background, cover
![bg contain](./assets/diagram.png)    # fit inside slide
![bg left:40%](./assets/photo.jpg)     # left column, 40% width
![bg right:35%](./assets/photo.jpg)    # right column, 35% width
```

### Inline Image Sizing

```markdown
![w:400](./assets/logo.png)            # 400px wide
![h:200](./assets/chart.png)           # 200px tall
![w:300 h:200](./assets/img.png)       # exact size
```

### Image Filters

```markdown
![blur:2px](./assets/bg.jpg)
![brightness:0.7](./assets/bg.jpg)
![grayscale:1](./assets/photo.jpg)
```

### Speaker Notes

```markdown
## My Slide

Content here.

<!--
Speaker notes go here. Not visible on the slide.
Can span multiple lines.
-->
```

### Common Slide Patterns

**Title slide (MarpX):**
```markdown
<!-- _class: title-academic -->
<!-- _paginate: skip -->

# Presentation Title

## Subtitle
```

**Section divider (MarpX):**
```markdown
<!-- _class: chapter -->
<!-- _paginate: skip -->

# Section Name
```

**References slide (MarpX):**
```markdown
<!-- _class: references -->

## References
- [1] Primary source
- [2] Secondary source
```

**Two-column with image:**
```markdown
## Slide Title

![bg left:45%](./assets/image.jpg)

Right-side content here.
- Point one
- Point two
```

**Full-bleed image:**
```markdown
<!-- _class: lead -->

![bg cover](./assets/photo.jpg)

# Overlay Title
```

---

## Theme Customization

Each theme CSS file in `themes/` must start with:
```css
/* @theme theme-name */
```

Key selectors to modify:
- `section` — base slide (background, font, padding)
- `section.lead` — centered title/section slides
- `section.invert` — dark variant slides
- `section::after` — pagination (bottom-right)
- `header`, `footer` — absolute positioned header/footer

Generated themes (`themes/custom-*.css`) are created by the ingest pipeline.
You can manually edit these CSS files to fine-tune after generation.

MarpX is standalone in this repo: built-in MarpX themes and templates do not require cloning a separate MarpX repository.

---

## Auth Setup (Google Slides API)

**Option A: Service Account (recommended)**
1. Create a service account in Google Cloud Console with Slides API enabled
2. Download the JSON key file
3. In `.env`: `GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json`
4. Share the Google Slides deck with the service account email (Viewer access)

**Option B: OAuth2**
1. Create OAuth2 credentials in Google Cloud Console
2. Run a one-time auth flow to get a refresh token
3. In `.env`: set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

**No credentials?** Export the deck as PPTX (File → Download → PowerPoint) and use `--file` instead.

---

## Adding a New Built-in Theme

1. Create `themes/<name>.css` with `/* @theme <name> */` at the top
2. Copy the structure from `themes/corporate.css` as a starting point
3. Ensure you define: `section`, `section.lead`, `section.invert`, `section::after`, `header`, `footer`
4. Add the theme name to `MARP.themes` array in `src/utils/config.mjs`
5. Create a matching scaffold in `templates/<name>.md` (or `templates/marpx-<name>.md` for a comprehensive MarpX reference scaffold)

---

## File Naming Conventions

- Themes: `themes/<name>.css` — lowercase, hyphenated
- Generated themes: `themes/custom-<slug>.css`
- Slides: `slides/<topic-slug>.md` — lowercase, hyphenated
- Assets: `assets/<descriptive-name>.<ext>`
