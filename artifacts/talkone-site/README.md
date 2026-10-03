# TalkOne frontend

Warm, responsive TalkOne marketing site and listener-interest form built in React, Vite, and TypeScript. The visual system references the provided app screenshots: deep navy, soft cream, and teal with the TalkOne speech-mark.

## Run locally

From the workspace root:

```sh
pnpm --filter @workspace/talkone-site run dev
```

Build with `pnpm --filter @workspace/talkone-site run build`; check types with `pnpm --filter @workspace/talkone-site run typecheck`.

## Structure

- `src/App.tsx` — routes, marketing sections, responsive navigation, FAQ interactions, and mock listener-interest submission.
- `src/data/siteContent.tsx` — shared site copy and navigation/FAQ content.
- `src/index.css` — palette, layout, responsive styles, and motion.
- `index.html` — default SEO and social metadata.

## Future listener API integration

The form handler is `handleListenerRegistration` in `src/App.tsx`. It currently validates a single phone number or email address and shows demo feedback; it makes no request and stores/transmits no data. Replace the clearly marked TODO in this handler with the authorized existing listener-registration integration when ready. Keep the current limitation: the supplied material shows ordinary account signup choices only, not listener-specific profile or verification fields.

## Editing content and visuals

Edit major marketing copy in `src/data/siteContent.tsx`. The hero artwork is composed in CSS in `src/index.css`; the TalkOne mark is an inline SVG icon composition in `Logo` within `src/App.tsx`. App-store, social, company, contact, privacy, and terms details are explicit placeholders and should only be replaced with official information.

No backend, APIs, account creation, OTP, payment, external fonts, or network integrations are included.