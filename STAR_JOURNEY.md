# Star Journey — STEP 1

This is an additive enhancement. Existing copy, section order, case diagrams and layouts remain authoritative.

## Files
- star-journey.css: shared 4/6/8px stars, light/dark tokens, low contrast 1px segmented paths, reduced motion, print.
- star-journey.js: explicit meaning map, geometry cache, event-driven rAF, progress and node activation.
- index.html: stylesheet, aria-hidden overlay root and script hook only.

## Meaning map (actual page order)
Hero / about: discover, first star.
About / profile: identity.
Career: journey, milestone.
Selected Projects: constellation.
NEON: process / collaboration.
UNDECEMBER: evidence / decision.
SLIME: lifecycle / transition.
TALES RUNNER: service / business / risk.
DME: workflow / automation.
Maplestar / Business: business expansion.
AI: PM judgment expansion.
Closing: arrival; data-journey-role=convergence is the STEP 8 extension hook.
Contact: next connection.

## Implementation boundaries
13 narrative stars, 12 independent SVG segments, two tiny convergence branches. No random narrative connections. Existing Business precedes AI and is not moved. Desktop path gently varies within the outer content gutter; tablet simplifies curves; mobile uses x=10px vertical rail. Content never sits under a path. No scroll hijacking or layout contribution. All added decoration is aria-hidden and pointer-events none.

Recalculate geometry on load, fonts ready, resize, body ResizeObserver and native details toggle. Scroll only schedules one pending rAF and reads cached geometry. No permanent loop. Hidden document cancels pending frame. Reuse existing motion tokens, with no libraries. Reduced motion shows complete connections, removes drawing and transition. A failed Journey script leaves original site functional.

Later steps, not implemented here: individual career/project constellations, AI/Business networks, full Closing identity/convergence choreography, Hero redesign and global polish.
`nRegression integration: script.js existing navigation measurement also observes body resize, keeping active links aligned after native details expands.

## STEP 2 — First Star
The Hero start is an independent scene object, no longer an eyebrow icon. Desktop/tablet x=84% and y=38%/34% of Hero. Mobile x=61%, below the CTA with content-safe bottom padding. First SVG segment alone is routed through the forest opening, then through the empty transition to the About gutter. Remaining segments and meaning map unchanged. Baseline first segment hidden; natural scroll draws the active path. Reduced motion shows it statically. First halo pauses offscreen/hidden. No new event loop or asset.

## Architecture update
The multi-page hub now supersedes the long-scroll map described above. See MULTIPAGE.md and content/page-manifest.json for current destinations and shared component ownership. Star design tokens and Hero photography remain; native Hero stars navigate categories and detail breadcrumbs/node annotations carry the Journey metaphor. Old long-scroll modules are retained for source history, not loaded into generated pages.
