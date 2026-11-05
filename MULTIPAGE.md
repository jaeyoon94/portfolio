# Multi-page portfolio

## Current source and generation

Edit `content/portfolio-source.html` for page content. Career dates and roles come from `content/career-history.json`; cover content and order come from `content/project-covers.json`; detail introductions come from `content/project-introductions.json`.

Run `node scripts/build-pages.cjs`, then `node scripts/verify-pages.cjs`.
The generator writes 14 static pages, `sitemap.xml`, `robots.txt` and the page manifest. No runtime framework or hosted build service is required. Vercel continues to serve the committed static output.

## Shared behavior

- Home: static night-sky photograph, five navigation links, eight small CSS-only twinkling points, selected project preview with seven choices, closing and contact.
- Projects: seven project covers followed by a compact participation history. Career retains the full responsibility summaries.
- Project details: distinct narratives with shared header, introduction, typography, footer and native navigation.
- Explicit browser reload keeps the current page and query, clears any fragment without navigating, and scrolls to the top. Ordinary links, direct fragments and browser back remain native.
- No shooting stars, background drift or parallax scripts are loaded. Reduced motion hides the decorative twinkle.

## Images and SEO

`content/image-assets.json` maps original images to lighter WebP display copies and intrinsic dimensions. `scripts/image-assets.cjs` updates image tags without changing links used to enlarge originals. Original files are preserved. Evidence screenshots and charts remain legible and retain their existing scope labels.

The builder generates unique canonical and sharing metadata using `https://parkjaeyoon-portfolio.vercel.app`. Keep this origin in sync only if the real production domain changes.

Historical design notes in `STAR_JOURNEY.md` describe earlier long-page experiments. The current static multipage shell loads `site.js`, not the old long-page scripts.

## The K and VDI addition

SK C&C employment and The K participation are separate records in career-history.json. VDI is a separate company-work case in vdi.html; scripts/skcc-career.cjs renders only its compact Career entry. It is not attributed to the banking project. The K content is in the canonical portfolio source.

Only the-k.html loads bi-data.js and bi-dashboard.js. The first creates deterministic synthetic records and the shared aggregate model; the second renders SVG charts, accessible data tables and filters. No Power BI file, bank dataset or external chart runtime is embedded. Customer types are mutually exclusive, active customer counts are distinct IDs, and month-on-month comparisons use the last selected month against its previous calendar month. The 100.0% displayed shares use largest-remainder rounding.

Run node scripts/verify-bi.cjs for all period/service aggregation invariants. scripts/bi-cover.cjs derives the illustrative cover from the same demonstration data during page generation.
