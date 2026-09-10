# Keerthi Networks and Security Solution — Website

Premium multi-page static website for **KEERTHI NETWORKS AND SECURITY SOLUTION**
(CCTV · Intercom · Networking · Biometric · Access Control · Fire Safety),
based in Bodinayakanur, Theni district, Tamil Nadu.

Built with **pure HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no
libraries, no build-time dependencies required to deploy.

---

## Quick facts

| Item | Value |
| --- | --- |
| Pages | 18 HTML pages (home, 5 solution pages, forms, legal, 404 …) |
| Stack | HTML5, CSS3 (custom properties, grid, flexbox), vanilla ES5-compatible JS |
| Fonts | Inter + Barlow Condensed (Google Fonts, loaded non-blocking with system fallbacks) |
| Conversion path | Call → WhatsApp → Request Quote → Request Site Visit |
| Lead mechanism | All forms validate locally, then open **WhatsApp** with a structured, encoded message. Nothing is auto-sent — the user presses Send. |

## Directory map

```
/
├── index.html                    Home
├── about-us.html
├── industries.html               12 industry sections
├── projects.html                 Filterable gallery + lightbox
├── why-choose-us.html
├── faq.html                      Grouped accessible accordions
├── request-a-quote.html          Grouped quote form → WhatsApp
├── request-site-visit.html       Site-visit form → WhatsApp
├── contact-us.html               Contact card + enquiry form → WhatsApp
├── privacy-policy.html
├── terms-and-conditions.html
├── disclaimer.html
├── 404.html
├── solutions/
│   ├── cctv-surveillance.html
│   ├── intercom-systems.html
│   ├── networking-solutions.html
│   ├── biometric-access-control.html
│   └── fire-safety.html
├── assets/
│   ├── css/   style.css (design system) · pages.css · responsive.css
│   ├── js/    config.js · whatsapp.js · navigation.js · forms.js ·
│   │          projects.js · faq.js · animations.js · analytics.js · main.js
│   ├── images/  optimised JPG photography (AI-generated placeholders)
│   └── icons/   favicon.svg + PNG icons (brand shield)
├── robots.txt · sitemap.xml · site.webmanifest
└── tools/site/                   OPTIONAL build tooling (Node ≥ 18)
    ├── render.js                 Shared templates/icons/SEO head
    ├── build.js                  Page assembler
    └── content/*.json            Single-source content & copy
```

## Editing the site

**The published files are plain HTML — you can hand-edit any page directly.**

For sitewide changes (header, footer, copy, adding pages), the optional builder
keeps everything consistent:

```bash
# 1. edit content
$EDITOR tools/site/content/site.json      # business info → drives config.js
$EDITOR tools/site/content/*.json         # page copy

# 2. rebuild all pages + config + sitemap
node tools/site/build.js
```

The builder **regenerates** the HTML files — if you have hand-edited pages you
want to keep, either port the changes into `tools/site/content/*.json` or skip
the builder.

### Contact information — single source of truth

All phone / WhatsApp / email / hours values live in `tools/site/content/site.json`
and are compiled into `assets/js/config.js` (`SITE_CONFIG`). Every WhatsApp
link and phone CTA on the site is generated from that one file at runtime.

## ⚠️ Before launch — placeholder checklist

These must be replaced with **verified** client information:

- [ ] `phone` / `phoneHref` — currently `PHONE_NUMBER_HERE`
- [ ] `whatsapp` — currently `WHATSAPP_NUMBER_HERE`
- [ ] `businessHours` — currently `BUSINESS_HOURS_HERE`
- [ ] `googleMapsUrl` — currently `GOOGLE_MAPS_URL_HERE` (map "Get Directions"
      currently uses a Google Maps *search* URL with the verified address)
- [ ] `gaMeasurementId` / `gtmContainerId` — analytics stay dormant until real
      IDs are set (events already push to `dataLayer`)
- [ ] `siteUrl` in `site.json` — currently `https://keerthinetworks.in/`
      (drives canonical URLs, sitemap, Open Graph)
- [ ] Replace AI-generated placeholder photography with genuine project photos
      (never present stock/AI images as client sites)
- [ ] Add genuine testimonials / brands / certifications only after verification

While WhatsApp/phone are unconfigured the CTAs remain visible but inert and
show a polite notice — no broken or fake links are ever produced.

## Local preview

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

(Any static server works. Opening files via `file://` also works except that
some browsers restrict service-worker-less manifests — use a local server.)

## Deployment

Upload the repository root (excluding `tools/` if you like — it is not
referenced by the site) to any static host:

- **GitHub Pages** — `404.html` is used automatically.
- **Netlify / Vercel / Cloudflare Pages** — zero config; add a redirect rule
  for clean URLs if desired.
- Serve over **HTTPS** only.

## Analytics events (wired, dormant until IDs provided)

`phone_click`, `whatsapp_click`, `hero_cta_click`, `quote_click`,
`site_visit_click`, `contact_form_start/submit`, `quote_form_start/submit`,
`site_visit_form_start/submit`, `project_view`, `project_filter`,
`service_view`.

## Backend-ready lead capture

Each form embeds hidden metadata — `source_page`, `form_type`, `submitted_at` —
and validates client-side. To attach a real backend later (Express, PHP,
Supabase, Firebase…), post the same payloads to your endpoint inside
`assets/js/forms.js` (see the submit handler) while keeping the WhatsApp flow
as the direct customer path. Suggested lead statuses: New → Contacted →
Site Visit → Quotation → Negotiation → Won/Lost.

## Accessibility & performance notes

- Skip link, focus-visible styles, ARIA-labeled menus/accordions/lightbox,
  `prefers-reduced-motion` support.
- Responsive from 320 px up; mobile gets a bottom **Call | WhatsApp | Get Quote**
  bar that never overlaps the floating WhatsApp button.
- Lazy-loaded images with explicit dimensions (no layout shift), deferred
  scripts, inline SVG icons, zero third-party JS.
