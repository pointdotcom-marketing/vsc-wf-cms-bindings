# Webflow CMS Binding Highlighter

VS Code / Cursor extension that **highlights Webflow `{{wf ...}}` CMS bindings** in HTML, JSON, and JSON-LD (for example inside `<script type="application/ld+json">` blocks). **Your file on disk is never modified** — decorations are editor-only.

## Features

- Purple, rounded highlights so bindings stand out while you edit schema or embedded JSON.
- Optional decoded pill display, so `{{wf ...}}` appears as a compact field-name pill while the real source text stays intact.
- Hover a highlighted span to see decoded **field path** and **Webflow type** when parseable (`path`, `type` from the inner JSON).
- Toggle highlights without uninstalling.

## Usage

1. Open an `.html` file (or JSON / TS / JS per settings) that contains Webflow bindings such as:

```json
"url": "{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}"
```

2. Bindings are highlighted automatically when `webflowCmsBindings.enabled` is true.

3. Command Palette: **Webflow CMS Bindings: Toggle Highlights** to enable or disable decorations.

4. Command Palette: **Webflow CMS Bindings: Toggle Pill Display** to switch between highlighted encoded text and decoded field-name pills.

By default, the extension keeps the encoded binding visible and adds a purple highlight. To opt into compact decoded pills, use **Webflow CMS Bindings: Toggle Pill Display** or set:

```json
"webflowCmsBindings.displayMode": "pill"
```

To return to the default:

```json
"webflowCmsBindings.displayMode": "highlight"
```

## Settings

| Setting | Default | Description |
| -------- | ------- | ----------- |
| `webflowCmsBindings.enabled` | `true` | Master switch for highlights. |
| `webflowCmsBindings.displayMode` | `highlight` | `highlight` keeps encoded bindings visible. `pill` visually hides the encoded span and shows a decoded field-name pill while preserving source text. |
| `webflowCmsBindings.languages` | `html`, `javascript`, `typescript`, `json`, `jsonc` | Language IDs to decorate. |
| `webflowCmsBindings.debounceMs` | `100` | Delay after edits before refreshing decorations (ms). |

## Development

```bash
npm install
npm run compile
npm test
```

Press **F5** in VS Code with this folder open (**Run Extension**) to launch an Extension Development Host with this extension loaded.

## Install Locally

Do not choose `out/`, `out/src/`, or any compiled output folder in **Developer: Install Extension from Location...**. Those folders do not contain `package.json`, so Cursor cannot treat them as a valid extension.

For folder-based loading, choose the project root:

```text
/Users/austin/code/dxd/vscode-wf-cms-bindings
```

For a normal install, package a `.vsix` and install that file:

```bash
npm run compile
npm run package
```

Then run **Extensions: Install from VSIX...** and select the generated `webflow-cms-binding-highlighter-0.1.0.vsix`.

## How it works

The extension scans document text for spans starting with `{{wf`, parses the inner `{ ... }` object that Webflow embeds (including `&quot;` entity-encoded strings and `\}`-style closing braces), then applies editor decorations over each span. Underlying text — including entities — is unchanged; copy/paste and saves preserve Webflow’s encoding. In pill mode, the encoded span is visually hidden with decoration styling and the decoded field name is rendered as an editor-only attachment.
