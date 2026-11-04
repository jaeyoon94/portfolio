# Multi-page portfolio

## Current source and generation

Edit `content/portfolio-source.html` for page content. Career dates and roles come from `content/career-history.json`; cover content and order come from `content/project-covers.json`; detail introductions come from `content/project-introductions.json`.

Run `node scripts/build-pages.cjs`, then `node scripts/verify-pages.cjs`.
The generator writes 12 static pages, `sitemap.xml`, `robots.txt` and the page manifest. No runtime framework or hosted build service is required. Vercel continues to serve the committed static output.

## Shared behavior

- Home: static night-sky photograph, five navigation links, eight small CSS-only twinkling points, selected project preview with six choices, closing and contact.
- Projects: six portrait covers followed by a compact participation history. Career retains the full responsibility summaries.
- Project details: distinct narratives with shared header, introduction, typography, footer and native navigation.
- Explicit browser reload returns to `index.html` at the top, as requested. Ordinary links, fragments and browser back remain native.
- No shooting stars, background drift or parallax scripts are loaded. Reduced motion hides the decorative twinkle.

## Images and SEO

`content/image-assets.json` maps original images to lighter WebP display copies and intrinsic dimensions. `scripts/image-assets.cjs` updates image tags without changing links used to enlarge originals. Original files are preserved. Evidence screenshots and charts remain legible and retain their existing scope labels.

The builder generates unique canonical and sharing metadata using `https://parkjaeyoon-portfolio.vercel.app`. Keep this origin in sync only if the real production domain changes.

Historical design notes in `STAR_JOURNEY.md` describe earlier long-page experiments. The current static multipage shell loads `site.js`, not the old long-page scripts.
