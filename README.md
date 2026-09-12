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
├── .htaccess                     Apache / LiteSpeed / cPanel production configuration
├── _redirects                    Netlify & Cloudflare Pages redirects
├── _headers                      Netlify & Cloudflare Pages security & caching headers
├── vercel.json                   Vercel deployment configuration
├── .nojekyll                     GitHub Pages Jekyll bypass
├── package.json                  Zero-dependency build and preview scripts
└── tools/site/                   Optional templating & build tooling (Node ≥ 18)
    ├── render.js                 Shared components, icons, headers, footers & SEO meta
    ├── build.js                  Static site compiler
    ├── content/*.json            Content JSON (site, home, about, solutions, faq...)
    └── i18n/*.json               Tamil translation dictionaries
```

---

## Production Deployment Guides

The website is ready to deploy immediately to any static hosting provider or web server:

### 1. cPanel / Apache / Shared Hosting (Hostinger, Bluehost, GoDaddy, etc.)
1. Compress the contents of this folder into a `.zip` file (exclude `.git` if you prefer).
2. In your hosting cPanel, open **File Manager** and navigate to `public_html/`.
3. Upload and extract the zip file.
4. The included `.htaccess` file automatically configures:
   - GZIP / Deflate compression for all text, HTML, CSS, JS, and SVG.
   - High-speed browser caching for images, CSS, JS, and fonts.
   - Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
   - Clean URLs (e.g. `/about-us` resolves to `/about-us.html`).
   - Custom 404 handling via `/404.html`.
   - Protection blocking direct access to `/tools/` and `.git`.

### 2. Netlify
- **Option A (Drag & Drop)**: Drag the project folder directly into [Netlify Drop](https://app.netlify.com/drop).
- **Option B (Git)**: Connect your Git repository.
  - Build command: `npm run build` (or leave empty; pages are pre-built).
  - Publish directory: `.`
- The included `_redirects` and `_headers` files are automatically applied.

### 3. Vercel
- Import the Git repository in your Vercel Dashboard.
- Framework Preset: **Other**.
- Root Directory: `./`.
- The included `vercel.json` provides clean URLs, redirects, and caching headers automatically.

### 4. Cloudflare Pages
- Connect your Git repository or use Direct Upload.
- Build command: `npm run build` (or none).
- Build output directory: `.`.
- The included `_redirects` and `_headers` files are automatically applied.

### 5. GitHub Pages
1. Push to your GitHub repository `main` branch.
2. In repository **Settings** → **Pages**, select **Deploy from a branch** → `main` → `/ (root)`.
3. The included `.nojekyll` file ensures all static assets and subfolders are served directly without Jekyll filtering.
4. Custom 404 (`404.html`) is served automatically.

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
- **Production URL**: `https://keerthinetworks.in/`

---

## Local Development & Rebuilding

To preview locally:
```bash
npm run preview
# or: python3 -m http.server 8080
# Opens at: http://localhost:8080
```

To update content and recompile:
```bash
# 1. Edit content in tools/site/content/*.json or translations in tools/site/i18n/*.json
# 2. Rebuild all pages:
npm run build
```
*(Uses native Node.js built-ins — no `npm install` needed!)*
