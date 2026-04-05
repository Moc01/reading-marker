<div align="center">

<img src="icon128.png" alt="Reading Marker" width="96" />

# Reading Marker

**Bookmark your reading position on any page. Press once to mark, press again to jump back.**

Built for long articles, documentation, and AI chat interfaces (Claude, ChatGPT, etc.)

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](#installation)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square&logo=googlechrome&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## The Problem

You're reading a long article or scrolling through an AI conversation. You want to check something further up — but once you scroll away, **you lose your place**.

Reading Marker solves this with one keyboard shortcut.

## How It Works

| Action | Shortcut | What happens |
|--------|----------|-------------|
| **Set bookmark** | `Alt+B` | Places an orange marker line at your current reading position |
| **Jump back** | `Alt+B` | Scrolls back to the bookmarked position (when you've scrolled away) |
| **Update bookmark** | `Alt+B` | Updates the marker to a new position (when near the existing marker) |
| **Clear bookmark** | `Esc` | Removes the marker entirely |

> **macOS:** Use `Ctrl+Shift+B` instead of `Alt+B` (Option+B inserts special characters on Mac).

<!-- If you have a demo GIF, uncomment this:
<div align="center">
  <img src="assets/demo.gif" alt="Reading Marker Demo" width="720" />
</div>
-->

## Features

- **One key does it all** — `Alt+B` adapts based on context: set, jump back, or update
- **Works on SPA pages** — Tested on Claude, ChatGPT, and other AI chat interfaces
- **Smart scroll detection** — Automatically finds the right scrollable container, even in complex layouts with sidebars
- **Non-intrusive** — Subtle orange line with a small label; disappears when you clear it
- **Zero permissions abuse** — Only requests `activeTab` and `scripting` (no data collection, no network access)
- **Respects accessibility** — Disables animation for users with `prefers-reduced-motion`

## Installation

### From source (Developer mode)

1. Download or clone this repo:
   ```bash
   git clone https://github.com/reading-marker/reading-marker-ext.git
   ```
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the cloned folder
5. Done! Press `Alt+B` on any page to try it

> **Tip:** If `Alt+B` conflicts with another extension, customize it at `chrome://extensions/shortcuts`.

<!-- Uncomment when published to Chrome Web Store:
### From Chrome Web Store
[**Install Reading Marker →**](https://chrome.google.com/webstore/detail/YOUR_ID)
-->

## How It Works Under the Hood

```
User presses Alt+B
       │
       ▼
Chrome Commands API ──→ background.js (service worker)
       │                      │
       │              chrome.tabs.sendMessage()
       │                      │
       ▼                      ▼
content.js receives message ──→ toggleMarker()
       │
       ├─ No marker? → Place marker at 35% viewport height
       ├─ Near marker? → Update position
       └─ Far from marker? → Smooth scroll back
```

The extension uses Chrome's [Commands API](https://developer.chrome.com/docs/extensions/reference/api/commands) to capture keyboard shortcuts at the **browser level**, bypassing any page-level JavaScript interception. This is critical for SPA pages (Claude, ChatGPT, etc.) that aggressively handle keyboard events.

## Project Structure

```
reading-marker-ext/
├── manifest.json     ← Extension config, permissions, shortcut
├── background.js     ← Service worker: receives shortcut → forwards to content script
├── content.js        ← Core logic: marker placement, scroll detection, jump-back
├── style.css         ← Marker line + toast notification styles
├── icon48.png        ← Toolbar icon
└── icon128.png       ← Store icon
```

## Technical Challenges Solved

<details>
<summary><strong>SPA keyboard interception</strong></summary>

Apps like Claude and ChatGPT use capture-phase `stopImmediatePropagation()` on keyboard events, which prevents content scripts from receiving `keydown`. We solve this by using Chrome's Commands API, which captures shortcuts at the browser level before any page JavaScript runs.

</details>

<details>
<summary><strong>Scroll container detection in complex layouts</strong></summary>

Modern web apps use nested `div` containers with `overflow-y: auto` instead of window scrolling. A naively-detected container might be a sidebar instead of the main content area. We filter candidates by **minimum width** (at least 40% of viewport or 480px) and pick the one with the highest scroll overflow score.

</details>

<details>
<summary><strong>Extension errors on restricted pages</strong></summary>

Chrome extensions can't inject scripts into `chrome://`, `edge://`, or Web Store pages. All `chrome.*` API calls are wrapped in `try/catch` to prevent error accumulation in the extension manager.

</details>

## Customization

### Change the keyboard shortcut

1. Go to `chrome://extensions/shortcuts`
2. Find **Reading Marker** → **Toggle reading marker**
3. Click the input field and press your preferred key combination

### Change the marker color

Edit `style.css` and replace `#ff6b35` with your preferred color:

```css
.rm-marker-line {
  background: linear-gradient(90deg, transparent 0%, #ff6b35 8%, #ff6b35 92%, transparent 100%);
  box-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
}
```

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE) — use it however you want.
