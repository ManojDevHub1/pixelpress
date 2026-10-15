# PixelPress — Product & UX Blueprint

**Series:** Zero Backend Build · Episode 01  
**Product:** Privacy-first browser image compressor  
**Status:** Research-informed blueprint + interactive single-file prototype  
**Scope:** No custom backend, no database server, no API calls, local image processing  
**Prototype guardrails:** 10 files per batch, 20 MB per file, 30 megapixels per image

## 1. Decision summary

Build an app-first utility, not a marketing-heavy SaaS site. The primary success path is:

**Choose images → choose output settings → compress → compare → download.**

The differentiator is not simply “another image compressor.” It is **batch convenience + transparent output behavior + local processing**. Squoosh demonstrates that local-in-browser compression is a viable product pattern; iLoveIMG demonstrates how familiar batch workflows and related image tools are surfaced in the market. PixelPress should combine a short batch-oriented flow with a strong, verifiable privacy explanation.

Important evidence boundary: this is desk research, standards review, competitor benchmarking, and a heuristic design pass. It is **not** a primary user study with recruited participants. Personas below are hypotheses to test, not measured facts about your future users.

## 2. User jobs and behavior hypotheses

| Hypothesis persona | Primary job | What they need most | Likely friction to test |
|---|---|---|---|
| Frontend developer / designer | Optimize assets before shipping a site | Predictable formats, accurate before/after size, repeatable workflow | Hidden metadata loss, unexpected larger outputs, uncertain browser support |
| Creator / social-media user | Make a file small enough to upload or share | Few decisions, visual comparison, simple download | Codec terminology, confusing quality sliders, mobile file-picker friction |
| Small-shop owner / catalog operator | Process many product photos consistently | Multi-file queue, clear per-file status, download-all | Repeating a single-file flow, failures hidden among successes, filenames changed unexpectedly |
| Privacy-sensitive user | Compress personal or confidential images | Clear proof of local processing and no upload | Broad privacy promises with no explanation, unclear third-party tracking |

### Primary job-to-be-done

“When an image is too large or in the wrong format, help me make a usable, smaller version quickly, without losing more visual quality than I intended and without uploading my file to an unknown service.”

### UX implications

- Make file selection the main action above the fold. A landing-page tour should never gate the tool.
- Offer a sensible default, while keeping the format and quality visible.
- Keep the original visible beside the output. Report real measured bytes, not predicted savings.
- Show processing state per file and recover from individual errors without losing the rest of the batch.
- Put plain-language explanations next to advanced controls rather than sending users to documentation.
- Design for touch and keyboard as well as drag-and-drop.

Research basis: Nielsen Norman Group’s usability heuristics emphasize visible system status, familiar language, user control, error prevention, recognition rather than recall, and useful error recovery. These are general principles, not image-compressor-specific outcome statistics. Squoosh’s repository states that its compression runs locally; iLoveIMG promotes bulk operations as part of its image-tool workflow.

## 3. Defects and risks to address before production

### Product / UX faults

1. **Too many tools in v1.** Compression, resize, conversion, crop, presets, history, and account features can turn a single-purpose utility into a cluttered toolbox. Launch with compression + format output + optional resize + comparison + batch export.
2. **Quality is easy to misunderstand.** A quality number is codec-specific, not a cross-format visual-quality promise. Label the slider, offer plain-language presets later, and always invite visual inspection.
3. **“Savings” can lie.** Re-encoding can produce a larger file. Display “X% smaller,” “X% larger,” or “No change” based on actual output bytes. Do not display negative savings as if it were a gain.
4. **PNG is not a normal quality-slider format.** Native browser PNG export is lossless and its `toBlob()` quality argument does not control PNG compression. A premium product needs a dedicated local PNG optimization codec if it wants meaningful PNG-to-PNG optimization.
5. **Requested formats can silently fall back.** MDN documents that an unsupported `canvas.toBlob()` type can fall back to PNG. Verify the returned blob MIME type before naming or offering the file.
6. **Transparency can be destroyed.** JPEG has no alpha channel. If JPEG is selected for a transparent PNG/WebP, ask for a matte/background color or clearly announce the behavior.
7. **Metadata can change.** Canvas re-encoding does not promise byte-for-byte preservation of EXIF, ICC profiles, timestamps, or DPI metadata. Document what is and is not preserved; do not market it as a metadata-preserving tool.
8. **Animated files are not a safe v1 promise.** GIF and animated WebP need frame-aware handling. A simple bitmap-to-canvas path may export a still frame only. Exclude animation formats until preserving or intentionally flattening animation is an explicit, tested feature.
9. **HEIC/AVIF/SVG are decoder edge cases.** Browser/device support varies. Keep them out of the first input contract unless local decoders and safe SVG handling are added.
10. **File size is not enough to protect memory.** A compact file can decode into a very large pixel buffer. Guard decoded pixel dimensions, process sequentially or at tightly bounded concurrency, show understandable errors, and release image bitmaps/object URLs.
11. **Batch processing needs per-file outcomes.** Don’t let one corrupt image fail the whole batch. Support retry/remove and keep successful outputs.
12. **Batch download needs an explicit deliverable.** A “Download all” action should create a ZIP locally; otherwise the promise of batch processing is incomplete. The included prototype implements a basic stored ZIP for this purpose.
13. **Privacy copy must match the network behavior.** “No image uploads” does not mean the site makes zero network requests for its own assets. Bundle codec assets locally, do not use analytics by default, and verify production network traffic before making privacy claims.
14. **Drag-and-drop cannot be the only path.** Keep a visible file-picker button, keyboard activation, clear focus styles, and touch-sized controls.

### Engineering cautions

- Use `createImageBitmap()` or a similarly tested decoder with explicit handling for decode errors and orientation.
- Prefer `Blob`/`toBlob()` over `toDataURL()` for output to avoid large base64 strings.
- Move expensive encode/resize work into a Worker where practical; `OffscreenCanvas` is a candidate but still needs browser feature detection and fallback paths.
- Ensure object URLs are revoked when a file is removed, replaced, or the workspace is cleared.
- Keep all derived output names and file extensions consistent with the actual MIME type.
- Keep the first release input contract strict: JPG/JPEG, PNG, and WebP. Add formats only after cross-browser tests.

## 4. Information architecture

### V1 navigation

- **Main workspace `/`** — uploader, queue, preview, settings, output download.
- **How it works** — short in-context explainer, not a separate onboarding funnel.
- **Privacy** — clear local-processing statement and its limits.
- **Footer** — supported formats, limits, release/version details, source repository when available.

Do not add sign-in, pricing, profile, cloud storage, or fake dashboard navigation. A local-only utility has no need for those features in v1.

### Responsive wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ P. PixelPress · Zero Backend Build            How it works Privacy ◐ │
├──────────────────────────────────────────────────────────────────────┤
│                  LESS WEIGHT. MORE CONTROL.                           │
│             Make images smaller. Keep the control.                    │
│        Local processing · Batch-ready · Adjustable quality            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Drag images here                    [ Choose images ]           │  │
│  │ JPG · PNG · WebP · 10 files · 20 MB per file                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

After files are selected:
┌──────────────────┬────────────────────────────────┬─────────────────┐
│ FILE QUEUE       │ COMPARE OUTPUT                 │ OUTPUT SETTINGS │
│ thumb + name     │ ┌─────────────┬──────────────┐ │ format          │
│ input size/status│ │ Original    │ Compressed   │ │ quality         │
│ remove / select  │ │ preview     │ preview      │ │ optional resize │
│ per-file result  │ └─────────────┴──────────────┘ │ JPEG matte       │
│                  │ measured bytes + size change   │ local-processing│
└──────────────────┴────────────────────────────────┴─────────────────┘
┌──────────────────────────────────────────────────────────────────────┐
│ Original total | Output total | Actual size change | [Download ZIP]  │
│                                                   [Compress images]  │
└──────────────────────────────────────────────────────────────────────┘
```

On narrow screens, stack queue → comparison → settings → action bar; make the primary action easy to reach, and never force horizontal scrolling.

## 5. Critical path and state model

### User flow

1. **Empty:** show supported formats, file limits, local-processing statement, file picker, and drag/drop target.
2. **Validation:** reject unsupported type/size/count before processing, explain the exact file and fix.
3. **Ready:** show queue, thumbnail, dimensions, size, selected item, default WebP output, and visible settings.
4. **Processing:** disable conflicting changes; show current filename and completed-files count. Do not invent a precise per-image percentage where the browser API exposes none.
5. **Complete:** show actual output dimensions, MIME/extension, input/output bytes, percent smaller/larger, and per-file download state.
6. **Error:** keep other successful items, show plain-language recovery, and allow removing/retrying the failed item.
7. **Export:** build ZIP locally, name files safely, report success or a recoverable error.

### State machine

`empty → validating → ready → processing → complete`

Per-file status: `ready | processing | done | error`. Changing format, quality, resize limit, or JPEG matte invalidates derived results and requires recompression. Clearing/removing files must release associated object URLs and decoded resources.

## 6. Functional requirements for v1

### Must ship

- JPG/JPEG, PNG, WebP input; strict validation; file count, file-size, and decoded-pixel limits (the prototype uses 10 files, 20 MB per file, and 30 MP per image as conservative initial guardrails).
- Multi-file queue with select/remove/status and readable error messages.
- Output as WebP/JPEG/PNG where the browser supports it; runtime verification of MIME type.
- Quality control for lossy formats only; no misleading quality slider for PNG.
- Optional max-edge resize preserving aspect ratio.
- Explicit JPEG matte color for images with transparency.
- Side-by-side original/output preview.
- Exact byte counts, dimensions, and truthful size delta per image and in aggregate.
- Local ZIP export and output names consistent with actual format.
- Local-only processing; no analytics/telemetry by default.
- Keyboard, screen-reader, reduced-motion, touch, error, and responsive support.

### Defer until quality can be guaranteed

- GIF/animated WebP preservation.
- HEIC/AVIF/SVG input.
- Cloud sync, user accounts, history across devices, social sharing.
- AI upscaling, background removal, crop editor, watermarking, and “magic” features.
- Claims such as “lossless compression,” “best quality,” or “up to 90% smaller” unless tested against a representative corpus and stated with a methodology.

## 7. Recommended React implementation structure

```text
pixelpress/
├─ public/
│  ├─ icons/
│  └─ codecs/                 # locally bundled WASM/codecs, no runtime CDN fetch
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  └─ routes.tsx
│  ├─ components/
│  │  ├─ AppHeader.tsx
│  │  ├─ Dropzone.tsx
│  │  ├─ FileQueue.tsx
│  │  ├─ QueueItem.tsx
│  │  ├─ ComparePanel.tsx
│  │  ├─ OutputSettings.tsx
│  │  ├─ BatchActionBar.tsx
│  │  ├─ ProgressStatus.tsx
│  │  ├─ Toast.tsx
│  │  └─ PrivacyDialog.tsx
│  ├─ features/image-processing/
│  │  ├─ image-types.ts
│  │  ├─ validate-image.ts
│  │  ├─ decode-image.ts
│  │  ├─ resize-image.ts
│  │  ├─ encode-image.ts
│  │  ├─ compression-worker.ts
│  │  ├─ zip-export.ts
│  │  └─ object-url-manager.ts
│  ├─ hooks/
│  │  ├─ useImageQueue.ts
│  │  └─ useCompression.ts
│  ├─ lib/
│  │  ├─ format-bytes.ts
│  │  ├─ filename.ts
│  │  └─ feature-detection.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ global.css
│  │  └─ responsive.css
│  └─ test/
│     ├─ validate-image.test.ts
│     ├─ format-bytes.test.ts
│     ├─ zip-export.test.ts
│     └─ image-fixtures/
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

Recommended stack: React + TypeScript + Vite. Native browser APIs can handle basic decode/resize and JPEG/WebP encode, but for reliable production-quality PNG optimization and consistent codec behavior, bundle well-maintained local WASM encoders. Bundle codec files with the build rather than lazily downloading them from a third-party CDN if “no runtime external requests” is a requirement.

## 8. Accessibility and performance acceptance

- WCAG 2.2 AA target: text contrast at least 4.5:1 for normal text and 3:1 for large text; non-text controls/graphics at least 3:1 where required.
- Interactive target size: meet WCAG 2.2 minimum of 24×24 CSS px or an allowed spacing exception; aim larger for primary/touch controls.
- Visible keyboard focus; logical heading and tab order; labels attached to inputs; errors not conveyed by color alone; status changes announced without flooding screen readers.
- File-picker button must work independently from drag/drop.
- Respect `prefers-reduced-motion`; never rely on animation to communicate completion.
- Core Web Vitals field targets at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Process files sequentially or with bounded concurrency, especially on mobile. Guard decoded pixel counts; release ImageBitmap and object URLs when done.
- No remote fonts, analytics, or runtime CDN requests in the strict privacy build.

## 9. Validation plan before calling it production-ready

This prototype is not a substitute for testing with real users or image fixtures. Run the following tests before release.

### Moderated usability test (recommended first round: 5–8 people from the intended audiences)

1. “Make this image smaller for a website, without making it look obviously worse.”
2. “Convert a transparent logo and keep its transparent background.”
3. “Compress these five photos and save them together.”
4. “Resize this image so its longest edge is 1200 pixels.”
5. “Tell me whether the image left your device and what metadata might change.”

Observe where participants hesitate, what they expect the quality control to do, whether they notice larger outputs, and whether they can recover from a bad file. Do not coach unless they are blocked; ask them to think aloud and then debrief.

### Release gates

- ≥90% task completion in the first moderated round is a useful internal target, not an industry guarantee.
- No silent MIME fallback; file extension always matches output MIME.
- No failed file blocks successful files in a batch.
- ZIP opens correctly and contains all expected output files.
- Tests cover transparent images, EXIF-rotated photos, corrupt/zero-byte files, huge dimensions, duplicate filenames, unsupported output formats, PNG output larger than input, and removal/clear object-URL cleanup.
- Verify with DevTools Network that file bytes are not transmitted and there are no third-party tracking requests.
- Test current Chrome, Firefox, Safari, Edge, Android Chrome, and iOS Safari; record any unsupported output mode clearly.
- Check keyboard-only flow, screen reader status updates, 200% zoom/reflow, reduced motion, and contrast.

## 10. Research and standards references

- Nielsen Norman Group — [10 Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/)
- Nielsen Norman Group — [Memory: Recognition and Recall in User Interfaces](https://www.nngroup.com/articles/recognition-and-recall/)
- GoogleChromeLabs — [Squoosh: local in-browser image compression](https://github.com/GoogleChromeLabs/squoosh)
- iLoveIMG — [Image-tool feature and batch workflow overview](https://www.iloveimg.com/features)
- MDN — [HTMLCanvasElement.toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- MDN — [createImageBitmap() and orientation options](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap)
- web.dev — [OffscreenCanvas and Workers](https://web.dev/articles/offscreen-canvas)
- W3C WAI — [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- MDN — [WCAG color contrast guidance](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast)
- web.dev — [Web Vitals](https://web.dev/articles/vitals)
