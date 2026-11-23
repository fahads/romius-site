# RoMIUS static website — migration preview

Astro 7 + Tailwind 4, with four schema-validated build-time content collections.
No CMS, database, Webflow JavaScript, jQuery, externally loaded fonts, or forms.

## Run locally

Use Node 24 (see `.node-version`). From this directory:

```sh
npm ci
npm run dev
```

Open the URL Astro prints (normally http://localhost:4321).

```sh
npm run check
npm run build
npm run verify
npm run preview
```

`verify` checks the built site. Rebuild after content edits before running it.

## Import into your existing repository

First preview this folder independently. When satisfied, create a migration branch in
`fahads/romius-site`, then copy this project's contents into the repository, preserving
its `.git` directory. Do not copy `node_modules`, `.astro`, or `dist`.

**Remove the starter's `public/robots.txt` if it exists**: this project generates
`/robots.txt` from `src/pages/robots.txt.ts`. Run `npm ci`, `npm run check`,
`npm run build`, and `npm run verify` after copying. Review `git diff` before committing.
No changes have been pushed or merged by this migration package.

## Where to edit

- `src/content/clinics/*.json`: clinic names, addresses, phone/fax, images, links, region and sort order.
- `src/content/surgeryLocations/*.json`: surgery locations and regional grouping.
- `src/content/providers/*.json`: providers, bios, qualifications and portraits.
- `src/content/conditions/*.json`: condition category, introduction and rich text.
- `src/assets/cms/`: imported CMS images, optimized locally. Image fields reference filenames.
- `src/templates/pages/`: editable exported page structure and copy.
- `src/templates/shared/`: shared navigation, footer and contact panel.
- `src/templates/cards/`: reusable list and card structure.
- `src/lib/site.ts`: build-time binding of collection entries into templates.
- `src/layouts/SiteLayout.astro`: shared document metadata and native menu/dialog controls.
- `public/css/romius-beta-v2.webflow.css`: original exported styling retained for visual fidelity.
- `public/css/migration.css`: layout and accessibility adjustments.

Cheerio and HTML sanitization run at build time, not in the browser. Medical rich text
is rendered with a restricted HTML allowlist. Tailwind utilities are available for
new components; its reset is omitted to preserve the exported design. This is a
fidelity-first migration, not a full rewrite of every Webflow CSS class into Tailwind.

Add or edit a JSON entry, then build: lists and provider/condition detail routes update
from the collections. Draft/archived entries are excluded. New detail pages can be
added through `src/pages`; edit static page templates for existing layout changes.

## Preview vs production

Indexing is disabled by default. Set `PUBLIC_ALLOW_INDEXING=true` only for an approved
production build. Canonicals target https://www.romiusinstitute.com. This flag is not
access control. No hosting, DNS or Cloudflare configuration is included or changed.

Review `docs/MIGRATION-NOTES.md` before launch. The live Webflow website is unchanged.
