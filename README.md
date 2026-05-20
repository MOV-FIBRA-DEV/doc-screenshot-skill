# doc-screenshot

A [Claude Code](https://claude.com/claude-code) skill that documents web app
screens by capturing **annotated screenshots** — numbered click-order flows or
labeled UI options — ready to drop into wiki/docs pages.

## What it does

When you ask Claude to "document page X", the skill:

1. Opens the page in Chrome via the `chrome-devtools` MCP.
2. Annotates the real DOM elements with an injected overlay.
3. Saves the PNG(s) plus a `legenda.md` caption file under
   `docs/screenshots/<page>/`.

Two modes:

- **Numbered** — one screenshot with numbered pins ①②③ marking a click order.
- **Sequence** — one screenshot per step (the skill performs each click).

Six annotation primitives: box, numbered pin, callout, arrow, spotlight, and
blur/redaction (to hide sensitive data before publishing).

## Requirements

- [Claude Code](https://claude.com/claude-code)
- Node.js (the MCP runs via `npx`)
- The `chrome-devtools` MCP server — see [doc-screenshot/INSTALL.md](doc-screenshot/INSTALL.md)

## Installation

1. Copy the `doc-screenshot/` folder into your project's `.claude/skills/`
   (or your user-level `~/.claude/skills/`):

   ```
   .claude/skills/doc-screenshot/
   ├── SKILL.md
   ├── annotate.js
   └── INSTALL.md
   ```

2. Install the Chrome DevTools MCP — see
   [doc-screenshot/INSTALL.md](doc-screenshot/INSTALL.md).

3. Restart Claude Code. The skill auto-loads.

## Usage

Just ask, in natural language:

> "documente a página http://localhost:3000/settings, modo numerado — marque o
> botão Salvar, o seletor de tema e o campo de nome"

Claude opens the page, annotates those elements, and saves the result under
`docs/screenshots/settings/`.

## How the annotation works

`annotate.js` is a dependency-free function injected into the page via the
MCP's `evaluate_script`. It reads each element's real position
(`getBoundingClientRect()`) and draws an isolated overlay (`pointer-events:
none`, maximum z-index) — so annotations anchor to the actual DOM and never
interfere with the page. The screenshot then "freezes" the overlay into the
PNG.

## Out of scope

The skill stops at the annotated PNGs and the `legenda.md` caption. Uploading
images to a wiki, creating pages, and post-processing images are deliberately
left as separate steps.

## License

MIT — see [LICENSE](LICENSE).
