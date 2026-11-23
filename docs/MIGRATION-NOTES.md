# Migration notes — 2026-11-23

## Imported

| Collection | Records |
| --- | ---: |
| Clinics | 15 |
| Surgery locations | 16 |
| Providers | 21 |
| Conditions | 15 |

All 67 rows were marked neither draft nor archived. JSON is now the source of truth;
CSV copies under source-csv are audit snapshots and are not read at build time.
No reference/multi-reference relationships were inferred. Provider `location` is blank
throughout the source. The 57 CMS asset URLs were downloaded; 56 raster assets were
converted to WebP, oriented, stripped of metadata and bounded to 1600px. One existing
WebP was preserved. Exported static images and fonts are local. Google Montserrat
font files were localized as well.

## Routes

Eight public site pages: /, /about, /clinic-locations, /surgery-locations,
/providers, /contact, /patient-resources, /uropharm.
21 provider detail pages preserve /providers/{slug}.
15 condition detail pages preserve /condition/{slug}.
A custom 404 is included: 45 HTML pages total, plus sitemap.xml and robots.txt.
The exported site's public homepage, provider directory and clinic directory were
cross-checked against the live website. The live sitemap.xml returned 404 at capture.
A complete historical route/redirect inventory was not supplied and remains a launch task.

## Source issues requiring client review

- 14 providers have empty biographies and education fields. Pages show name, role,
  portrait where available and neutral contact guidance; no biographies were invented.
- All provider location fields are blank. The source template hardcoded the same
  clinic and surgery assignments for every provider. Those unverified assignments
  were omitted. Populate actual relationships after practice confirmation.
- `pelvic-organ-prolapse` has no category. Its detail page is generated, but it is
  excluded from the Men/Women lists until a category is supplied.
- The About page says “17 Locations”; the collections have 15 clinics and 16 surgery
  locations. Those counts may represent different concepts. The original statement
  is retained pending confirmation.
- The condition template contained unrelated business-consulting CTA text. It was
  replaced with neutral contact/scheduling wording; clinical content was preserved.
- Some patient portal links include authenticationRequestId parameters, which may
  expire. They are preserved but need stable destinations confirmed by the practice.
- Original “free consultation” wording elsewhere is retained; confirm it is accurate.
- UroPharm's source fax label links to the phone number. Preserved; verify intent.
- Footer social links are '#' placeholders in the export. Supply real URLs or remove
  those icons before launch. Template attribution is preserved pending license review.

## Deliberate implementation differences

- Original CSS, visual structure, imagery and fonts are retained for fidelity.
  Tailwind is available, but the design is not fully rewritten as utility classes.
- Webflow and jQuery runtimes are removed. Mobile navigation uses a small native
  script; patient-portal accordions use details/summary; the contact panel uses dialog.
  Decorative Webflow entrance/parallax/marquee animations are not reproduced.
- Shared header/footer/contact content is centralized. The standalone pharmacy page
  retains its separate presentation. Home physician cards derive from providers;
  their order follows the CSV rather than the old hand-written order.
- Telephone extensions use `;ext=` rather than merging extension digits into the number.
- The homepage team CTA now links to /providers instead of its old self-link.
- Blank CMS detail templates for clinic/surgery locations and unused template, blog,
  ecommerce, career, and draft pages are not published. Original exports remain in
  the user's ZIP. Confirm any historical URLs and redirects before launch.
- The new contact dialog replaces the sliding panel; menu/accordion/dialog behavior
  was tested, but this is not an accessibility certification or clinical review.

## Validation

- Astro check: zero errors/warnings/hints.
- Static build: 45 pages.
- Build verification: collection counts, provider/condition routes, local navigation,
  src/srcset/CSS assets, no blank CMS placeholders, no forms, telephone extension.
- Chromium tests: sampled desktop pages, mobile menu, accordion, dialog and Escape.
- At 390px, eight sampled pages showed no horizontal overflow.
- Sampled image loads and JavaScript: no failures.
- All pages need final client visual/content acceptance before production cutover.
