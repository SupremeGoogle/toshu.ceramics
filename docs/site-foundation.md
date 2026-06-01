# Site Foundation

This project will use `modern-web-guidance` as the local web-quality baseline.

## Stack

- Vite for fast local development and static production builds.
- React + TypeScript for component structure.
- CSS with modern layout primitives before adding styling libraries.
- `lucide-react` for interface icons.

## Web Principles

- Use semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
- Keep a single clear `h1` per page and avoid skipped heading levels.
- Use native links for navigation and buttons for actions.
- Give every interactive element an accessible name and visible focus state.
- Use CSS Grid/Flexbox with intrinsic sizing, `aspect-ratio`, and container queries.
- Use real image dimensions to prevent layout shift.
- Do not lazy-load the first hero/product image.
- Add `fetchpriority="high"` only to the primary LCP image.
- Lazy-load below-the-fold gallery images.
- Avoid third-party scripts until there is a confirmed need.

## Proposed Information Architecture

- Home: featured work, studio positioning, current availability.
- Shop or Available: current pieces, collection filters, inquiry or checkout path.
- Archive: sold works and past collections.
- Process: materials, making, firing, care.
- About: artist/studio story and values.
- Contact: Instagram, email, commissions, wholesale or collaboration inquiries.

## Asset Plan

- `public/images/hero/` for first-viewport imagery.
- `public/images/products/` for catalog photos.
- `public/images/process/` for studio/process photos.
- Convert delivered originals into AVIF/WebP plus fallback JPEG where needed.
- Keep alt text factual: object type, material, glaze/color, and relevant visual detail.

## Immediate Next Build

1. Confirm facts from Instagram or owner-provided content.
2. Add real visual assets.
3. Build the first screen around one strong ceramic image.
4. Add a product/gallery component with container-aware layout.
5. Add contact and inquiry flow.
