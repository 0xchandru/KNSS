# Keerthi Networks and Security Solution — Website

Premium multi-page static website for **KEERTHI NETWORKS AND SECURITY SOLUTION**
(CCTV · Intercom · Networking · Biometric · Access Control · Fire Safety),
based in Bodinayakanur, Theni district, Tamil Nadu.

Built with **pure HTML5 + CSS3 + vanilla JavaScript** — zero frameworks, zero external dependencies required to run or deploy.

---

## Quick facts

| Item | Value |
| --- | --- |
| Pages | 18 HTML pages (Home, 5 Solution pages, Industries, Projects, Why Choose Us, FAQ, Forms, Legal, 404) |
| Stack | Pure HTML5, Vanilla CSS3 (custom design system), Vanilla ES-compatible JS |
| Bilingual | Full English & Tamil (தமிழ்) toggle with persistent state and per-page metadata |
| SEO & Schema | Complete LocalBusiness, WebSite, Service, FAQPage, BreadcrumbList JSON-LD + hreflang + Open Graph |
| Lead mechanism | Client-side validation → instant formatted **WhatsApp** enquiry. User reviews & presses Send. |
| Performance | Instant load, responsive 320px–4K, zero layout shift (CLS 0), semantic accessible HTML |

---

## Directory map

```
/
├── index.html                    Home page
├── about-us.html                 About Keerthi Networks
├── industries.html               12 Industry verticals & solutions
├── projects.html                 Filterable installation project gallery & lightbox
├── why-choose-us.html            Why choose us (8 pillars & promises)
├── faq.html                      Grouped accessible accordions
├── request-a-quote.html          Interactive 5-step quote form → WhatsApp
├── request-site-visit.html       Site-visit booking form → WhatsApp
├── contact-us.html               Contact details, business info & enquiry form
├── privacy-policy.html           Privacy Policy
├── terms-and-conditions.html     Terms and Conditions
├── disclaimer.html               Disclaimer
├── 404.html                      Custom branded 404 page
├── site-visit.html               Instant 301-equivalent redirect to request-site-visit.html
├── solutions/                    5 Dedicated Service Solution Pages
│   ├── cctv-surveillance.html
│   ├── intercom-systems.html
│   ├── networking-solutions.html
│   ├── biometric-access-control.html
│   └── fire-safety.html
├── assets/
│   ├── css/                      style.css (design system) · pages.css · responsive.css
│   ├── js/                       config.js · whatsapp.js · navigation.js · forms.js ·
│   │                             projects.js · faq.js · animations.js · analytics.js ·
│   │                             i18n.js · i18n-data.js · main.js
│   ├── images/                   Optimized photography & solution images
│   └── icons/                    Favicon SVG + PNG app icons + apple touch icon
├── robots.txt                    Production crawler rules & sitemap reference
├── sitemap.xml                   XML Sitemap with hreflang (en-IN, ta-IN, x-default)
├── site.webmanifest              PWA / mobile web manifest
└── tools/site/                   Optional source templating tooling (Node ≥ 18)
    ├── render.js                 Shared components, icons, headers, footers & SEO meta
    ├── build.js                  Static site compiler
    ├── content/*.json            Content JSON (site, home, about, solutions, faq...)
    └── i18n/*.json               Tamil translation dictionaries
```

---

## Static Hosting Instructions

The website is a **100% pure static website** (pure HTML5, CSS3, and vanilla JS) — no Node.js runtime, no backend, and no build dependencies required to deploy. You can upload it directly to any web hosting service:

- **Any Web Hosting / cPanel / Shared Hosting (Hostinger, Bluehost, GoDaddy, etc.)**:
  Simply upload the HTML files and the `assets/`, `solutions/`, `robots.txt`, `sitemap.xml`, and `site.webmanifest` to your web root (`public_html`).
- **Netlify / Vercel / Cloudflare Pages / GitHub Pages**:
  Simply connect your repository or drag-and-drop the files. No build command needed — the static files are ready to serve immediately.

---

## Business Information & Contact Configuration

All verified contact details are configured in `tools/site/content/site.json` and compiled into `assets/js/config.js`:

- **Business Name**: Keerthi Networks and Security Solution
- **Phone**: `+91 63815 51316` (`tel:+916381551316`)
- **WhatsApp**: `+91 63815 51316` (`916381551316`)
- **Email**: `knsschennai@gmail.com`
- **GSTIN**: `33JIDPK6358B1ZC`
- **Address**: No. 159, Karuppasamy Koil Street, Dharmathupatti, Melachokkanathapuram, Bodinayakanur, Theni – 625582, Tamil Nadu
- **Business Hours**: Mon – Sat: 9:00 AM – 7:30 PM
- **Production URL**: `https://www.knss.in/`

---

## Local Preview & Rebuilding

To preview locally:
```bash
python3 -m http.server 8080
# Opens at: http://localhost:8080
```

To update content and recompile:
```bash
# 1. Edit content in tools/site/content/*.json or translations in tools/site/i18n/*.json
# 2. Rebuild all pages:
node tools/site/build.js
```
*(Uses native Node.js built-ins — no npm dependencies or installation needed!)*
