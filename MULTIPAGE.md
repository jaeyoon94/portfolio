# Multi-page portfolio

## Structure
Home is a map, detail pages contain the full source material. No framework/router was added. All generated HTML works with native links and browser history; JavaScript only enhances the theme, hover/focus paths, menu closing and legacy bookmarks.

Pages: index.html, about.html, career.html, projects.html, project-neon.html, undecember.html, legend-of-slime.html, tales-runner.html, project-dme.html, goddess-order.html, ai.html, business.html.

## Editing / regeneration
content/portfolio-source.html preserves the original complete single-page source. Existing migrated sections are extracted without rewriting their content; only link targets change. scripts/build-pages.cjs owns shared header, footer, page titles, descriptions, breadcrumbs, destination navigation and source-section routing. Run `node scripts/build-pages.cjs` after editing the source/shared template. This is an optional dependency-free maintenance script, not a runtime/build prerequisite.

content/page-manifest.json records page names and source-section destinations. site.css and site.js provide the shared multipage shell. Existing design, Hero assets and hero-motion.js are reused. Legacy script.js/star-journey.js stay available as the former long-scroll implementation but are not loaded into the new pages. Star design tokens remain shared. The hub's five native anchor stars take over experience navigation; detail pages use restrained star nodes, project entry connections and breadcrumbs rather than a page-wide sky.

## Content ownership
Home: existing Hero copy, short introduction, NEON / UNDECEMBER / DME previews, identity summary, original Contact CTA.
About: full About, original Closing synthesis/evidence, documents.
Career: original full timeline and existing role-evolution summary.
Projects: existing full selected-project entries; six cases remain accessible, including Goddess Order.
Project pages: each complete original case study, preserving diagrams/metrics/caveats.
AI: complete capability framework and cross-page DME evidence links.
Business: existing MapleStar and Artale content, clearly labelled personal planning portfolios; Tales Runner is separately linked as actual experience.

No unverified pricing tables, market data or KPI hypotheses were created. Additional original BM materials are needed to expand beyond the existing summaries.
