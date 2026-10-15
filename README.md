# PixelPress — Episode 01: Zero Backend Build

A privacy-first, local-in-browser image compressor and format converter. Built with **React 18 + TypeScript + Vite**. Zero backend server, zero database, zero external APIs, zero telemetry trackers. All image decoding, resizing, compression, and ZIP bundling execute 100% locally on your machine.

---

## Capabilities & Architectural Highlights

- **100% Client-Side Sandbox:** All computations occur inside the local browser thread and canvas context. No images or metadata are ever transmitted across the network.
- **Decompression Bomb Guard:** Inspects binary headers (IHDR in PNG, SOF in JPEG, VP8X in WebP) to validate dimensions before decoding raw pixel buffers, protecting browser memory.
- **High Smoothing Fidelity:** Employs high-quality bicubic interpolation (`ctx.imageSmoothingQuality = 'high'`) and preserves EXIF smartphone orientation (`imageOrientation: 'from-image'`).
- **Resilient Batch Processing:** One corrupt file in a batch never blocks successful files. Download individual outputs directly or export all completed images into a standard ZIP archive.
- **High-Performance ZIP Engine:** Table-driven IEEE 802.3 CRC-32 (256-word precomputed lookup table) for instant ZIP packaging without main-thread UI stalls.
- **Accessible & Responsive:** WCAG 2.2 AA compliant contrast in both light and dark modes, keyboard focus trapping in dialogs, visible focus indicators, and touch targets ≥ 44px on mobile devices.

---

## Technical Stack

- **Framework:** React 18, TypeScript 5
- **Bundler:** Vite 5
- **Testing:** Vitest
- **Styling:** CSS Design Tokens with automatic/manual `light-dark()` theme support
- **Packaging:** PKWARE-compliant client-side streaming ZIP export

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested with Node v24)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### Running Tests
```bash
# Execute automated test suite
npm test
```

### Production Build
```bash
# Typecheck and compile static bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Keyboard Shortcuts & Navigation

| Key | Action | Context |
|---|---|---|
| `Tab` / `Shift+Tab` | Navigate controls with visible focus ring | Global |
| `Enter` / `Space` | Activate buttons, toggle checkboxes | Global |
| `Esc` | Dismiss modals and return focus to trigger | Modals |

---

## Privacy & Security Verification

PixelPress strictly guarantees:
- **0 external network requests** (`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`).
- **0 external scripts or stylesheets** (no Google Fonts, no remote CDNs).
- **0 analytics or tracking cookies**.
- Works seamlessly offline once loaded.
