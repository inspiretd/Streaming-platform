# TOMOSHA public UI audit

## Current state

The current public surface has a solid domain and API foundation, but it still reads like a technical catalog rather than a premium OTT product.

## Findings

- Content width is technically responsive, but the visual hierarchy is too utility-first and does not create a strong media canvas.
- The hero has no real artwork, so the first viewport becomes a dark information block instead of a cinematic entry point.
- The header is structurally correct, but the public navigation and actions are too quiet for a media product.
- Typography is readable in places, yet the main hero and section rhythm do not create enough contrast between primary and secondary content.
- Channel cards expose monograms as the main visual asset. This makes the catalog feel like a prototype and weakens brand recognition.
- Card artwork has no shared art direction. Accent colors are useful for status, but they should not replace media artwork.
- The first action is not clear enough: the user should immediately understand which channel is live and how to watch it.
- English copy is mixed into Uzbek copy across public surfaces, reducing local product polish.
- Desktop whitespace is not used as cinematic breathing room. It appears as unused space because there is no hero art or rail density to anchor it.
- Mobile navigation and reduced-motion primitives exist, but the public content model still needs rail-first composition and larger touch-friendly media targets.
- Existing states, focus rings, and secure playback boundaries are good foundations and must be preserved.

## Refactor direction

The public UI will move to a content-first OTT composition: cinematic hero, visible live rail, local channel rail, category tiles, schedule preview, and a restrained footer. Admin remains information-dense and separate. Backend, API, importer, security, and domain types remain unchanged.

## Acceptance checks

- No blank hero block.
- No monogram-only channel art.
- Uzbek Latin is the default public language.
- Desktop uses the available viewport instead of a narrow centered column.
- Mobile uses horizontal rails and a fixed bottom navigation without body overflow.
- Primary watch action is visible in the first viewport.
- Every interactive surface keeps visible focus, keyboard support, and reduced-motion behavior.
