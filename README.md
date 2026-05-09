# marp-agent-project

AI agent-driven Marp presentation builder. Generate polished slide decks from a topic, extract visual themes from existing Google Slides or PowerPoint files, or author Marp markdown directly — all from the CLI.

---

## What It Does

- **Ingest** an existing Google Slides deck or PPTX file and extract its color palette, fonts, and layout into a custom Marp CSS theme
- **Generate** a complete presentation from a topic description or structured outline, using a built-in or custom theme
- **Author** Marp markdown slides directly with a built-in MarpX theme family and a live preview server

---

## Prerequisites

- **Node.js 18-25** and **npm** (`@marp-team/marp-cli` currently fails under Node 26 in this project)
- No global installs required — Marp CLI is included as a dev dependency
- Standalone setup — MarpX themes are shipped in this repo (no separate MarpX repository dependency)

---

## Installation

```bash
git clone https://github.com/your-username/marp-agent-project.git
cd marp-agent-project
npm install
cp .env.example .env   # only needed for Google Slides API (see below)
```

---

## Quick Start

### Generate a presentation from a topic

```bash
npm run generate -- --topic "Q4 Business Review" --template corporate
```

This writes `slides/q4-business-review.md`. Then preview it:

```bash
npm run dev
# Open http://localhost:8080
```

### Import style from a PPTX file (no credentials needed)

```bash
npm run ingest -- --file ./export.pptx --scaffold --name my-brand
```

This creates:
- `themes/custom-my-brand.css` — extracted Marp theme
- `slides/my-brand.md` — scaffolded deck using that theme

### Import style from a Google Slides URL

```bash
npm run ingest -- --url "https://docs.google.com/presentation/d/DECK_ID/edit" --scaffold
```

Requires Google API credentials in `.env` — see [Google Slides API Setup](#google-slides-api-setup).

---

## Workflows

### Workflow A — Ingest an Existing Deck

Extract colors, fonts, and layout from a source presentation and generate a matching Marp CSS theme.

```bash
# From PPTX file
npm run ingest -- --file ./export.pptx

# From Google Slides URL
npm run ingest -- --url "https://docs.google.com/presentation/d/ID/edit"

# With scaffold: also generate a Marp .md file with the slide content
npm run ingest -- --file ./export.pptx --scaffold

# With custom theme name
npm run ingest -- --file ./export.pptx --name acme-brand --scaffold
```

**Output:**
- `themes/custom-<name>.css` — generated Marp theme
- `slides/<name>.md` — scaffolded deck (if `--scaffold` passed)

**Flags:**

| Flag | Description |
|------|-------------|
| `--file <path>` | Path to a `.pptx` file |
| `--url <url>` | Google Slides URL |
| `--name <slug>` | Theme name (default: derived from presentation title) |
| `--scaffold` | Also generate a slide deck from the source content |
| `--help` | Show usage |

---

### Workflow B — Generate from Scratch

Create a presentation from a topic description or a structured outline file.

```bash
# From a topic
npm run generate -- --topic "Platform Overview"

# With template and metadata
npm run generate -- --topic "Platform Overview" --template godel --subtitle "v2.0" --header "Acme" --footer "Confidential"

# From an outline file
npm run generate -- --outline ./my-outline.txt --theme custom-acme-brand

# Custom output path
npm run generate -- --topic "Annual Review" --output fy2026-review
```

**Output:** `slides/<topic-slug>.md`

**Flags:**

| Flag | Description |
|------|-------------|
| `--topic <text>` | Presentation topic (used as title) |
| `--outline <path>` | Path to outline file (`.txt`, `.md`, or `.json`) |
| `--template <name>` | Built-in template/theme (default: `godel`) |
| `--theme <name>` | Theme name to use (overrides template default) |
| `--subtitle <text>` | Subtitle for the title slide |
| `--header <text>` | Header text on all slides |
| `--footer <text>` | Footer text on all slides |
| `--output <path>` | Output path for the `.md` file |
| `--help` | Show usage |

**Outline formats accepted:**

Markdown bullets:
```markdown
# Presentation Title

## Slide Title
- Bullet point one
- Bullet point two

## Another Slide
Content text here.
```

JSON array:
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

### Workflow C — Direct Authoring

Write or edit `.md` files in `slides/` directly using Marp syntax.

1. Create or edit a file in `slides/`
2. Set the theme in front matter (see [Marp Syntax Reference](#marp-syntax-reference))
3. Run `npm run dev` for live preview at http://localhost:8080
4. Run `npm run build:pdf` to export

---

## Built-in Themes

Default theme is `godel`.

Core themes:
- `marpx`, `godel`, `socrates`, `sparta`, `cantor`, `church`, `copernicus`, `einstein`
- `frankfurt`, `galileo`, `gauss`, `gropius`, `haskell`, `hobbes`, `lorca`, `newton`

Legacy compatibility themes:
- `corporate`, `tech`, `minimal`

Custom themes from ingest are saved as `themes/custom-<name>.css` and can be hand-edited after generation.

---

## Build Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start live preview server at http://localhost:8080 |
| `npm run build` | Build all slides to HTML in `dist/` |
| `npm run build:pdf` | Build all slides to PDF in `dist/` |
| `npm run build:pptx` | Build all slides to PPTX in `dist/` |
| `npm run ingest` | Run the ingest CLI |
| `npm run generate` | Run the generate CLI |

---

## Google Slides API Setup

Only needed if you want to ingest directly from a Google Slides URL. For PPTX files, no credentials are required.

**Option A: Service Account (recommended)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project
2. Enable the **Google Slides API**
3. Create a **Service Account** and download the JSON key file
4. In `.env`: set `GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json`
5. Share your Google Slides deck with the service account email (Viewer access)

**Option B: OAuth2**

1. Create OAuth2 credentials in Google Cloud Console
2. Run a one-time auth flow to obtain a refresh token
3. In `.env`: set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`

**No credentials?** Export your deck as PPTX via File → Download → PowerPoint, then use `--file`.

---

## Marp Syntax Reference

### Front Matter

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

```markdown
---
```

### Per-Slide Directives

```markdown
<!-- _class: lead -->           # Centered title layout
<!-- _class: lead invert -->    # Centered + dark background
<!-- _class: invert -->         # Dark background only
<!-- _class: title-academic --> # MarpX title slide
<!-- _class: chapter -->        # MarpX section/chapter divider
<!-- _class: toc -->            # MarpX table-of-contents slide
<!-- _class: references -->     # MarpX references slide
<!-- _class: end -->            # MarpX closing slide
<!-- _paginate: skip -->        # Hide page number on this slide
<!-- _backgroundColor: #f0f4fa -->
<!-- _color: #333 -->
```

### Image Backgrounds

```markdown
![bg](./assets/image.jpg)              # Full background, cover
![bg contain](./assets/diagram.png)    # Fit inside slide
![bg left:40%](./assets/photo.jpg)     # Left column, 40% width
![bg right:35%](./assets/photo.jpg)    # Right column, 35% width
```

### Inline Image Sizing

```markdown
![w:400](./assets/logo.png)            # 400px wide
![h:200](./assets/chart.png)           # 200px tall
```

### Speaker Notes

```markdown
## My Slide

Content here.

<!--
Speaker notes go here.
Not visible on the slide.
-->
```

### Common Patterns

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

---

## Project Structure

```
scripts/          CLI entry points (ingest, generate)
src/
  ingest/         Extraction: google-slides, pptx-parser, style-extractor
  generate/       outline-parser, slide-templates, presentation orchestrator
  themes/         palette.mjs (color utils), generator.mjs (CSS output)
  utils/          config.mjs (env/paths), image-handler.mjs
themes/           CSS theme files — MarpX core (`marpx`, named themes), legacy compatibility, generated custom-*
templates/        Scaffold .md files (`<name>.md` built-ins, `marpx-<name>.md` comprehensive MarpX references)
slides/           Working directory — all active presentations live here
assets/           Downloaded or user-provided images
dist/             Build output (HTML, PDF, PPTX) — gitignored
```

---

## Adding a Custom Theme

1. Create `themes/<name>.css` with `/* @theme <name> */` at the top
2. Copy the structure from `themes/corporate.css` as a starting point
3. Define: `section`, `section.lead`, `section.invert`, `section::after`, `header`, `footer`
4. Add the theme name to `MARP.themes` in `src/utils/config.mjs`
5. Create a matching scaffold in `templates/<name>.md` (or `templates/marpx-<name>.md` for a comprehensive MarpX reference scaffold)
