/* ============================================================
   KNSS site builder — assembles every page from content JSON
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import {
  site, esc, url, icon, iconSize, WHATSAPP_ICON, logoMark, logo, page, header, footer, floats,
  sectionHead, checkList, ctaBand, faqSection, stepsSection, waCta, quoteCta, visitCta,
  iconBox, breadcrumbs, solutionDisplayName, SOLUTION_NAMES
} from './render.js';
import home from './content/home.json' with { type: 'json' };
import about from './content/about.json' with { type: 'json' };
import solutions from './content/solutions.json' with { type: 'json' };
import industries from './content/industries.json' with { type: 'json' };
import projects from './content/projects.json' with { type: 'json' };
import faqData from './content/faq.json' with { type: 'json' };
import legal from './content/legal.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '../..');
const write = (rel, html) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  /* GitHub Pages serves project sites from a sub-path (e.g. /KNSS/).
     Rewrite root-absolute internal URLs ("/assets/...", "/about-us.html")
     to depth-correct relative URLs so the site works at ANY base path. */
  const depth = rel.split('/').length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  html = html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_m, attr, p) => `${attr}="${prefix}${p}"`);
  fs.writeFileSync(file, html.trim() + '\n', 'utf8');
  console.log('✓', rel);
};

const solImg = (name) => `/assets/images/solutions/${name}.jpg`;

/* Category chips on project cards — correct acronym casing (never title-case
   programmatically; "cctv" would become "Cctv"). */
const PROJECT_CATEGORY_LABELS = {
  'cctv': 'CCTV',
  'networking': 'Networking',
  'biometric': 'Biometric',
  'intercom': 'Intercom',
  'fire-safety': 'Fire Safety'
};
const projectCategoryLabel = (c) => PROJECT_CATEGORY_LABELS[c] || c;

/* ============================================================
   SHARED SECTION BUILDERS
   ============================================================ */

const heroSection = () => `
<section class="hero" aria-labelledby="heroTitle">
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-grid-lines"></div>
    <div class="hero-glow hero-glow--1"></div>
    <div class="hero-glow hero-glow--2"></div>
    <div class="hero-pattern">${iconSize('shield')}${iconSize('network')}${iconSize('camera')}${iconSize('fingerprint')}${iconSize('fire')}${iconSize('intercom')}</div>
  </div>
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="hero-eyebrow reveal">CCTV <span>|</span> Intercom <span>|</span> Networking <span>|</span> Biometric <span>|</span> Fire Safety</p>
      <h1 id="heroTitle" class="hero-title reveal">Your Trusted Partner for <span class="accent-text">Security &amp; Networking</span> Solutions</h1>
      <p class="hero-lead reveal">Complete CCTV, networking, intercom, biometric and fire safety solutions for homes, offices and businesses — professionally installed and honestly supported across Theni district and Tamil Nadu.</p>
      <div class="hero-ctas reveal">
        ${quoteCta({ cls: 'btn btn--primary btn--lg', track: 'hero_cta_click' })}
        ${visitCta({ cls: 'btn btn--outline-light btn--lg', track: 'hero_cta_click' })}
        <a href="#" class="btn btn--wa btn--lg" data-wa data-track="hero_cta_click">${WHATSAPP_ICON}<span>WhatsApp Us</span></a>
      </div>
      <div class="hero-proof reveal">
        ${site.phoneHref
          ? `<a class="hero-proof-item" data-tel href="${site.phoneHref}" data-track="phone_click">${icon('phone-call')}<span>${esc(site.phoneDisplay)}</span></a>`
          : `<span class="hero-proof-item hero-proof-item--muted">${icon('phone-call')}<span>Call: number updating shortly</span></span>`}
        <span class="hero-proof-item">${icon('badge-check')}<span>GST Registered · ${esc(site.gstin)}</span></span>
        <span class="hero-proof-item">${icon('map-pin')}<span>Serving Theni &amp; Tamil Nadu</span></span>
      </div>
    </div>
    <div class="hero-media reveal">
      <figure class="hero-media-frame">
        <img src="/assets/images/hero-main.jpg" alt="Security technician professionally installing a dome CCTV camera on a modern commercial building" width="1600" height="900" fetchpriority="high">
      </figure>
      <div class="hero-chip hero-chip--1">${icon('camera')}<span><strong>CCTV Surveillance</strong><em>Remote mobile viewing</em></span></div>
      <div class="hero-chip hero-chip--2">${icon('network')}<span><strong>Networking</strong><em>Structured cabling</em></span></div>
      <div class="hero-chip hero-chip--3">${icon('shield-check')}<span><strong>Protect. Connect. Secure.</strong><em>One accountable partner</em></span></div>
    </div>
  </div>
  <div class="hero-strip" aria-hidden="true">
    <div class="container hero-strip-inner">
      <span>CCTV</span><span>Intercom</span><span>Networking</span><span>Biometric</span><span>Access Control</span><span>Fire Safety</span>
    </div>
  </div>
</section>`;

const trustHighlights = () => `
<section class="section section--tight section--white trust-strip" aria-label="Why customers choose us">
  <div class="container">
    <div class="trust-grid">
      ${home.trustHighlights.map((t) => `
      <div class="trust-item reveal">
        ${iconBox(t.icon, 'trust-icon')}
        <div class="trust-body"><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

const aboutSection = () => `
<section class="section section--white about-home-section" aria-labelledby="homeAboutTitle">
  <div class="container split">
    <div class="split-media reveal">
      <div class="media-frame-wrap">
        <figure class="frame frame--offset">
          <img src="/assets/images/about-team.jpg" alt="Keerthi Networks technicians reviewing an installation plan with CCTV equipment on site" loading="lazy" decoding="async" width="1536" height="1024">
        </figure>
        <div class="frame-badge frame-badge--bottom">${icon('shield-check')}<span><strong>Protect. Connect. Secure.</strong><em>Our promise on every project</em></span></div>
        <div class="frame-badge frame-badge--top">${icon('award')}<span><strong>100% Quality Hardware</strong><em>Genuine OEM Components</em></span></div>
      </div>
    </div>
    <div class="split-copy">
      <div class="section-head align-left reveal">
        <p class="eyebrow">About the Company</p>
        <h2 class="section-title" id="homeAboutTitle">Security, Surveillance &amp; Networking — Done Properly</h2>
      </div>
      <p class="reveal">Keerthi Networks and Security Solution is a security technology and infrastructure company based in Bodinayakanur, Theni district. We design, install and maintain the systems that keep properties safe and connected — CCTV surveillance, intercom and video door phones, computer networks, biometric attendance and access control, and fire safety equipment.</p>
      <p class="reveal">Because security and networking work best when they are planned together, you get one accountable partner instead of five different vendors — clearer coordination, neater installation and faster support.</p>
      <div class="about-highlights-grid reveal">
        <div class="about-hl-card">
          <span class="about-hl-num">5+</span>
          <span class="about-hl-label">Core Specialisations</span>
          <span class="about-hl-desc">CCTV, Intercom, Networks, Biometrics &amp; Fire</span>
        </div>
        <div class="about-hl-card">
          <span class="about-hl-num">100%</span>
          <span class="about-hl-label">Transparent Quotations</span>
          <span class="about-hl-desc">Itemised parts &amp; labour, no hidden margins</span>
        </div>
        <div class="about-hl-card">
          <span class="about-hl-num">1</span>
          <span class="about-hl-label">Accountable Partner</span>
          <span class="about-hl-desc">From initial site survey to long-term AMC</span>
        </div>
      </div>
      ${checkList(['One partner for security, communication and networking', 'Site-based system design — no guesswork', 'Neat, professional installation by trained technicians', 'Itemised quotations and honest recommendations'], 'reveal')}
      <div class="split-actions reveal">
        <a href="/about-us.html" class="btn btn--primary">Discover Our Story ${icon('arrow-right')}</a>
        <a href="/why-choose-us.html" class="btn btn--ghost-dark">Why choose us ${icon('arrow-right')}</a>
      </div>
    </div>
  </div>
</section>`;

const solutionsSection = () => `
<section class="section section--gray solutions-section" id="solutions" aria-labelledby="solutionsTitle">
  <div class="container">
    ${sectionHead({
      eyebrow: 'Our Solutions',
      title: '<span id="solutionsTitle">Complete Security &amp; Infrastructure Solutions</span>',
      lead: 'Five connected service lines, one accountable partner — designed around your property and installed to professional standards.'
    })}
    <div class="solutions-grid">
      ${site.solutionOrder.map((slug) => {
        const s = solutions[slug];
        return `
      <article class="sol-card reveal">
        <a class="sol-card-media" href="/solutions/${slug}.html" aria-label="${esc(s.name)} — explore solution">
          <div class="sol-card-media-frame">
            <img src="${solImg(s.image)}" alt="${esc(s.name)} solution by Keerthi Networks" width="768" height="512">
          </div>
          <span class="sol-card-icon">${icon({ 'cctv-surveillance': 'camera', 'intercom-systems': 'intercom', 'networking-solutions': 'network', 'biometric-access-control': 'fingerprint', 'fire-safety': 'fire' }[slug])}</span>
        </a>
        <div class="sol-card-body">
          <h3><a href="/solutions/${slug}.html">${esc(s.name)}</a></h3>
          <p>${esc(s.lead.split('. ')[0])}.</p>
          <ul class="sol-card-points">
            ${s.offers.slice(0, 3).map((o) => `<li>${icon('check')}<span>${esc(o.title)}</span></li>`).join('')}
          </ul>
          <div class="sol-card-actions">
            <a class="btn btn--ghost-dark btn--sm" href="/solutions/${slug}.html">Explore ${icon('arrow-right')}</a>
            ${waCta(s.waProduct, { cls: 'btn btn--wa btn--sm', label: 'WhatsApp' })}
          </div>
        </div>
      </article>`;
      }).join('')}
    </div>
  </div>
</section>`;

const whySection = () => `
<section class="section section--dark why-section" aria-labelledby="whyTitle">
  <div class="section-bg-pattern" aria-hidden="true">${iconSize('shield-check')}</div>
  <div class="container">
    ${sectionHead({ eyebrow: 'Why Keerthi Networks', title: '<span id="whyTitle">Built on Trust, Installed to Last</span>', lead: 'Security is not a gadget purchase — it is a long-term relationship with the partner who installed your system.', dark: true })}
    <div class="why-grid">
      <div class="why-item reveal">${iconBox('clipboard', 'icon-box--accent')}<div><h3>Requirement-First Approach</h3><p>We survey and understand before we recommend — you get a system designed for your property, not whatever is in stock.</p></div></div>
      <div class="why-item reveal">${iconBox('wrench', 'icon-box--accent')}<div><h3>Professional Installation</h3><p>Neat cabling, correct mounting and careful configuration — quality you can see in every detail of the finish.</p></div></div>
      <div class="why-item reveal">${iconBox('doc', 'icon-box--accent')}<div><h3>Transparent Quotations</h3><p>Itemised, clearly explained proposals. No hidden costs, no vague lump sums, no pressure tactics.</p></div></div>
      <div class="why-item reveal">${iconBox('headset', 'icon-box--accent')}<div><h3>After-Sales Support</h3><p>We stay reachable after installation — maintenance, troubleshooting and honest advice when you need it.</p></div></div>
      <div class="why-item reveal">${iconBox('network', 'icon-box--accent')}<div><h3>One-Stop Solution</h3><p>CCTV, intercom, networking, biometrics and fire safety from a single accountable partner.</p></div></div>
      <div class="why-item reveal">${iconBox('badge-check', 'icon-box--accent')}<div><h3>GST-Registered Business</h3><p>A registered, accountable business — GSTIN ${esc(site.gstin)} — with proper documentation on every engagement.</p></div></div>
    </div>
    <div class="center reveal"><a href="/why-choose-us.html" class="btn btn--outline-light">Why Choose Us — In Detail ${icon('arrow-right')}</a></div>
  </div>
</section>`;

const howWeWork = () => `
<section class="section section--navy process-section" aria-labelledby="howTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'How We Work', title: '<span id="howTitle">A Clear Process, From First Call to Ongoing Support</span>', lead: 'No confusion, no surprises — just a straightforward path from your requirement to a working system.', dark: true })}
    ${stepsSection(home.howWeWork)}
    <div class="center reveal">${visitCta({ cls: 'btn btn--primary btn--lg', track: 'site_visit_click' })}</div>
  </div>
</section>`;

const industriesStrip = () => {
  const pick = ['corporate-offices', 'retail', 'manufacturing', 'residential', 'schools', 'warehouses', 'hospitals', 'hotels'];
  return `
  <section class="section section--white industries-strip" aria-labelledby="indStripTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'Industries We Serve', title: '<span id="indStripTitle">Solutions for Every Kind of Property</span>', lead: 'From a single home to a multi-floor facility — the same engineering discipline applies.' })}
      <div class="industry-grid">
        ${pick.map((id) => {
          const ind = industries.industries.find((x) => x.id === id);
          return `<a class="industry-card reveal" href="/industries.html#${ind.id}">${iconBox(ind.icon)}<h3>${esc(ind.name)}</h3><p>${esc(ind.solutions[0])}</p></a>`;
        }).join('')}
      </div>
      <div class="center reveal"><a href="/industries.html" class="btn btn--ghost-dark">Explore All Industries ${icon('arrow-right')}</a></div>
    </div>
  </section>`;
};

const serviceArea = () => `
<section class="section section--gray area-section" aria-labelledby="areaTitle">
  <div class="container split">
    <div class="split-copy">
      <div class="section-head align-left reveal">
        <p class="eyebrow">Service Area</p>
        <h2 class="section-title" id="areaTitle">Proudly Based in Theni District, Serving Tamil Nadu</h2>
      </div>
      <p class="reveal">Our base is Bodinayakanur in Theni district — and our work takes us across the region. Nearby towns are our home ground; for larger projects we travel across Tamil Nadu.</p>
      <div class="area-tags reveal">
        <p class="area-label">${icon('map-pin')} Primary service area</p>
        <ul>${home.serviceArea.primary.map((c) => `<li class="tag tag--primary">${esc(c)}</li>`).join('')}</ul>
        <p class="area-label">${icon('navigation')} Extended coverage</p>
        <ul>${home.serviceArea.extended.map((c) => `<li class="tag">${esc(c)}</li>`).join('')}</ul>
      </div>
      <p class="area-note reveal">${esc(home.serviceArea.note)}</p>
    </div>
    <div class="split-media reveal">
      <div class="area-card">
        <div class="area-card-pin">${icon('map-pin')}</div>
        <h3>Keerthi Networks and Security Solution</h3>
        <address>${site.address.line1}<br>${site.address.line2}<br>${site.address.line3}<br>${site.address.line4}</address>
        <a class="btn btn--ghost-dark btn--sm" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent('Keerthi Networks and Security Solution, No. 159, Karuppasamy Koil Street, Dharmathupatti, Melachokkanathapuram, Bodinayakanur, Theni 625582, Tamil Nadu')}" target="_blank" rel="noopener">Get Directions ${icon('external')}</a>
      </div>
    </div>
  </div>
</section>`;

const featuredProjects = () => `
<section class="section section--white projects-strip" aria-labelledby="projStripTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Project Scopes', title: '<span id="projStripTitle">The Kind of Work We Deliver</span>', lead: 'Typical installation scopes for homes and businesses — photos are representative of each solution category.' })}
    <div class="mini-project-grid">
      ${projects.projects.slice(0, 4).map((p) => `
      <article class="mini-project reveal">
        <div class="mini-project-media"><img src="${solImg(p.image)}" alt="Representative photo of a ${esc(p.category.replace('-', ' '))} installation" loading="lazy" width="768" height="512"><span class="tag tag--accent">${esc(projectCategoryLabel(p.category))}</span></div>
        <div class="mini-project-body">
          <h3>${esc(p.title)}</h3>
          <p class="mini-project-meta">${icon('map-pin')} ${esc(p.location)} · ${esc(p.industry[0].toUpperCase() + p.industry.slice(1))}</p>
          <p>${esc(p.desc)}</p>
        </div>
      </article>`).join('')}
    </div>
    <div class="center reveal"><a href="/projects.html" class="btn btn--ghost-dark">View Projects ${icon('arrow-right')}</a></div>
  </div>
</section>`;

const testimonialsNote = () => `
<section class="section section--gray testimonials-note" aria-labelledby="testNoteTitle">
  <div class="container center-narrow reveal">
    <span class="icon-box icon-box--accent">${icon('quote')}</span>
    <h2 id="testNoteTitle">A Reputation Built One Customer at a Time</h2>
    <p>We are currently collecting verified feedback from our customers and will publish it here — unedited and with real names. In the meantime, we invite you to speak with us directly: ask your questions on WhatsApp and judge us by how we answer.</p>
    <div class="center">
      ${waCta('', { cls: 'btn btn--wa', label: 'Ask Us on WhatsApp' })}
    </div>
  </div>
</section>`;

const homeFaq = () => `
<section class="section section--white" aria-labelledby="homeFaqTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Common Questions', title: '<span id="homeFaqTitle">Frequently Asked Questions</span>', lead: 'Straight answers to what customers ask us most.' })}
    <div class="faq-narrow">
      ${faqSection(home.homeFaq, { id: 'homeFaq' })}
    </div>
    <div class="center reveal"><a href="/faq.html" class="btn btn--ghost-dark">View All FAQs ${icon('arrow-right')}</a></div>
  </div>
</section>`;

/* ============================================================
   INNER PAGE HERO
   ============================================================ */

const pageHero = ({ eyebrow, title, lead, waProduct = '', ctas = true, image = '', imageAlt = '' }) => `
<section class="page-hero" aria-labelledby="pageTitle">
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-grid-lines"></div>
    <div class="hero-glow hero-glow--1"></div>
    <div class="hero-pattern">${iconSize('shield')}${iconSize('network')}${iconSize('camera')}${iconSize('fingerprint')}</div>
  </div>
  <div class="container page-hero-inner">
    <div class="page-hero-copy">
      ${eyebrow ? `<p class="eyebrow eyebrow--light reveal">${esc(eyebrow)}</p>` : ''}
      <h1 id="pageTitle" class="reveal">${title}</h1>
      ${lead ? `<p class="page-hero-lead reveal">${lead}</p>` : ''}
      ${ctas ? `<div class="page-hero-ctas reveal">
        ${quoteCta({ cls: 'btn btn--primary', track: 'quote_click' })}
        ${waProduct ? waCta(waProduct, { cls: 'btn btn--wa', label: 'Chat on WhatsApp' }) : ''}
        ${visitCta({ cls: 'btn btn--outline-light', track: 'site_visit_click' })}
      </div>` : ''}
    </div>
    ${image ? `<div class="page-hero-media reveal"><figure class="page-hero-frame"><img src="${solImg(image)}" alt="${esc(imageAlt)}" width="768" height="512" loading="eager" fetchpriority="high"></figure></div>` : ''}
  </div>
</section>`;

/* ============================================================
   FORM BUILDERS
   ============================================================ */

const field = ({ id, name, label, type = 'text', required = false, maxlength = 120, autocomplete = '', placeholder = '', options = null, rows = 0, hint = '', col = '' }) => {
  const req = required ? '<span class="req" aria-hidden="true">*</span>' : '';
  const reqAttr = required ? ' required' : '';
  const describedBy = `aria-describedby="${id}-error"`;
  let control = '';
  if (options) {
    control = `<select id="${id}" name="${name}"${reqAttr} ${describedBy}>
      <option value="" selected disabled>Select an option</option>
      ${options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
    </select>`;
  } else if (rows) {
    control = `<textarea id="${id}" name="${name}" rows="${rows}" maxlength="${maxlength}" placeholder="${esc(placeholder)}"${reqAttr} ${describedBy}></textarea>`;
  } else {
    control = `<input id="${id}" name="${name}" type="${type}" maxlength="${maxlength}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}${reqAttr} ${describedBy}>`;
  }
  return `<div class="field ${col ? `field--${col}` : ''}">
    <label for="${id}">${esc(label)} ${req}</label>
    ${control}
    ${hint ? `<p class="field-hint">${esc(hint)}</p>` : ''}
    <p class="field-error" id="${id}-error" hidden></p>
  </div>`;
};

const formMeta = (formType) => `
  <input type="hidden" name="source_page" value="">
  <input type="hidden" name="form_type" value="${formType}">
  <input type="hidden" name="submitted_at" value="">`;

const formStatus = () => `<div class="form-status" role="status" aria-live="polite" hidden></div>`;

const contactForm = () => `
<form id="contactForm" class="form" data-form-type="contact" novalidate>
  ${formMeta('contact')}
  <div class="form-grid">
    ${field({ id: 'cf-name', name: 'name', label: 'Name', required: true, maxlength: 80, autocomplete: 'name', placeholder: 'Your full name' })}
    ${field({ id: 'cf-phone', name: 'phone', label: 'Phone Number', type: 'tel', required: true, maxlength: 15, autocomplete: 'tel', placeholder: '10-digit mobile number', hint: 'We will contact you on this number via WhatsApp or phone.' })}
    ${field({ id: 'cf-email', name: 'email', label: 'Email', type: 'email', maxlength: 120, autocomplete: 'email', placeholder: 'you@example.com', col: 'half' })}
    ${field({ id: 'cf-company', name: 'company', label: 'Company Name', maxlength: 100, autocomplete: 'organization', placeholder: 'Optional', col: 'half' })}
    ${field({ id: 'cf-location', name: 'location', label: 'Location', required: true, maxlength: 100, autocomplete: 'address-level3', placeholder: 'Town / city — e.g. Bodinayakanur' })}
    ${field({ id: 'cf-service', name: 'service', label: 'Service Required', required: true, options: ['CCTV', 'Intercom', 'Networking', 'Biometric', 'Access Control', 'Fire Safety', 'Multiple Services', 'Other'] })}
    ${field({ id: 'cf-message', name: 'message', label: 'Message', rows: 4, maxlength: 600, placeholder: 'Briefly describe your requirement — property type, number of cameras/points, timelines…', col: 'full' })}
  </div>
  ${formStatus()}
  <div class="form-actions">
    <button type="submit" class="btn btn--wa btn--lg">${WHATSAPP_ICON}<span>Send Enquiry on WhatsApp</span></button>
    <p class="form-note">${icon('info')} Your enquiry opens in <strong>WhatsApp</strong> with all details pre-filled — please press <strong>Send</strong> there. Nothing is sent automatically.</p>
  </div>
</form>`;

const quoteForm = () => `
<div class="form-progress" aria-hidden="true">
  <div class="form-progress-track"><div class="form-progress-fill" id="quoteProgress"></div></div>
  <p class="form-progress-label"><span id="quoteProgressLabel">0% complete</span> — all fields marked <span class="req">*</span> are needed for an accurate quote</p>
</div>
<form id="quoteForm" class="form" data-form-type="quote" novalidate>
  ${formMeta('quote')}
  <fieldset class="form-section">
    <legend><span>1</span> Contact Details</legend>
    <div class="form-grid">
      ${field({ id: 'qf-name', name: 'name', label: 'Name', required: true, maxlength: 80, autocomplete: 'name' })}
      ${field({ id: 'qf-phone', name: 'phone', label: 'Phone', type: 'tel', required: true, maxlength: 15, autocomplete: 'tel' })}
      ${field({ id: 'qf-email', name: 'email', label: 'Email', type: 'email', maxlength: 120, autocomplete: 'email', col: 'half' })}
      ${field({ id: 'qf-company', name: 'company', label: 'Company', maxlength: 100, autocomplete: 'organization', col: 'half' })}
    </div>
  </fieldset>
  <fieldset class="form-section">
    <legend><span>2</span> Location</legend>
    <div class="form-grid">
      ${field({ id: 'qf-address', name: 'address', label: 'Address', maxlength: 200, autocomplete: 'street-address', col: 'full', placeholder: 'Street / area / landmark' })}
      ${field({ id: 'qf-city', name: 'city', label: 'City / Town', required: true, maxlength: 80, autocomplete: 'address-level2', col: 'half' })}
      ${field({ id: 'qf-pin', name: 'pin', label: 'PIN Code', type: 'text', inputmode: 'numeric', maxlength: 6, autocomplete: 'postal-code', col: 'half', hint: '6-digit PIN code' })}
    </div>
  </fieldset>
  <fieldset class="form-section">
    <legend><span>3</span> Service Requirement</legend>
    <div class="form-grid">
      ${field({ id: 'qf-service', name: 'service', label: 'Service Required', required: true, options: ['CCTV', 'Intercom', 'Networking', 'Biometric', 'Access Control', 'Fire Safety', 'Multiple Solutions'] })}
      ${field({ id: 'qf-property', name: 'property', label: 'Property Type', required: true, options: ['Home', 'Office', 'Shop', 'Factory', 'Warehouse', 'Other'] })}
    </div>
  </fieldset>
  <fieldset class="form-section">
    <legend><span>4</span> Property Information</legend>
    <div class="form-grid">
      ${field({ id: 'qf-area', name: 'area', label: 'Approximate Area', maxlength: 40, col: 'half', placeholder: 'e.g. 1800 sq.ft', hint: 'Built-up area to be covered' })}
      ${field({ id: 'qf-floors', name: 'floors', label: 'Number of Floors', type: 'text', inputmode: 'numeric', maxlength: 10, col: 'half' })}
      ${field({ id: 'qf-users', name: 'users', label: 'Number of Users / Employees', type: 'text', inputmode: 'numeric', maxlength: 10, col: 'half' })}
      <div class="field field--half">
        <span class="field-label" id="qf-existing-label">Existing System?</span>
        <div class="radio-row" role="radiogroup" aria-labelledby="qf-existing-label">
          <label class="radio-pill"><input type="radio" name="existing" value="Yes"><span>Yes</span></label>
          <label class="radio-pill"><input type="radio" name="existing" value="No" checked><span>No</span></label>
        </div>
      </div>
    </div>
  </fieldset>
  <fieldset class="form-section">
    <legend><span>5</span> Additional Requirements</legend>
    <div class="form-grid">
      ${field({ id: 'qf-message', name: 'message', label: 'Additional Requirements', rows: 5, maxlength: 800, col: 'full', placeholder: 'Tell us anything else that helps us quote accurately — coverage expectations, preferred timing, budget range…' })}
    </div>
  </fieldset>
  ${formStatus()}
  <div class="form-actions">
    <button type="submit" class="btn btn--wa btn--lg">${WHATSAPP_ICON}<span>Request Quote on WhatsApp</span></button>
    <p class="form-note">${icon('info')} Your request opens in <strong>WhatsApp</strong> fully formatted — please press <strong>Send</strong> there to reach us.</p>
  </div>
</form>`;

const siteVisitForm = () => `
<form id="siteVisitForm" class="form" data-form-type="site-visit" novalidate>
  ${formMeta('site-visit')}
  <div class="form-grid">
    ${field({ id: 'sv-name', name: 'name', label: 'Name', required: true, maxlength: 80, autocomplete: 'name' })}
    ${field({ id: 'sv-phone', name: 'phone', label: 'Phone Number', type: 'tel', required: true, maxlength: 15, autocomplete: 'tel' })}
    ${field({ id: 'sv-email', name: 'email', label: 'Email', type: 'email', maxlength: 120, autocomplete: 'email', col: 'half' })}
    ${field({ id: 'sv-location', name: 'location', label: 'Location', required: true, maxlength: 100, autocomplete: 'address-level2', col: 'half', placeholder: 'Site town / area' })}
    ${field({ id: 'sv-service', name: 'service', label: 'Service Required', required: true, options: ['CCTV', 'Intercom', 'Networking', 'Biometric', 'Access Control', 'Fire Safety', 'Multiple Services', 'Not Sure — Need Advice'] })}
    <div class="field field--half">
      <label for="sv-date">Preferred Date <span class="req" aria-hidden="true">*</span></label>
      <input id="sv-date" name="date" type="date" required aria-describedby="sv-date-error">
      <p class="field-error" id="sv-date-error" hidden></p>
    </div>
    ${field({ id: 'sv-time', name: 'time', label: 'Preferred Time', required: true, options: ['Morning (9 AM – 12 PM)', 'Afternoon (12 PM – 4 PM)', 'Evening (4 PM – 7 PM)'] })}
    ${field({ id: 'sv-message', name: 'message', label: 'Requirement', rows: 4, maxlength: 600, col: 'full', placeholder: 'What should we look at during the visit? Property type, coverage areas, concerns…' })}
  </div>
  ${formStatus()}
  <div class="form-actions">
    <button type="submit" class="btn btn--wa btn--lg">${WHATSAPP_ICON}<span>Request Site Visit on WhatsApp</span></button>
    <p class="form-note">${icon('info')} Your request opens in <strong>WhatsApp</strong> pre-formatted — please press <strong>Send</strong> there. We will confirm the slot with you.</p>
  </div>
</form>`;

/* ============================================================
   PAGE BUILDERS
   ============================================================ */

const buildHome = () => {
  const crumbs = null;
  const content = `
  ${heroSection()}
  ${trustHighlights()}
  ${aboutSection()}
  ${solutionsSection()}
  ${whySection()}
  ${howWeWork()}
  ${industriesStrip()}
  ${serviceArea()}
  ${featuredProjects()}
  ${testimonialsNote()}
  ${homeFaq()}
  ${ctaBand({ title: home.finalCta.title, text: home.finalCta.text })}`;

  const webSiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': url('/#website'),
    url: url('/'),
    name: site.businessName,
    publisher: { '@id': url('/#organization') },
    inLanguage: 'en-IN'
  };
  const localBizLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': url('/#localbusiness'),
    name: site.businessName,
    parentOrganization: { '@id': url('/#organization') },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 159, Karuppasamy Koil Street, Dharmathupatti, Melachokkanathapuram',
      addressLocality: 'Bodinayakanur',
      addressRegion: 'Tamil Nadu',
      postalCode: '625582',
      addressCountry: 'IN'
    },
    areaServed: [...home.serviceArea.primary, ...home.serviceArea.extended].map((c) => ({ '@type': 'City', name: c })),
    knowsAbout: ['CCTV installation', 'Intercom systems', 'Structured cabling', 'Biometric attendance systems', 'Access control', 'Fire extinguishers']
  };
  write('index.html', page({
    path: '/', title: home.title, description: home.description, content, crumbs,
    activeId: 'home', bodyClass: 'page-home', pageType: 'home',
    extraJsonLd: [webSiteLd, localBizLd, faqJsonLdOf(home.homeFaq)]
  }));
};

const faqJsonLdOf = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
});

const buildAbout = () => {
  const content = `
  ${pageHero({ eyebrow: 'About Us', title: 'Keerthi Networks and Security Solution', lead: 'A security technology and infrastructure partner you can actually reach, actually talk to, and actually rely on.', ctas: false })}
  <section class="section section--white">
    <div class="container split">
      <div class="split-media reveal">
        <figure class="frame"><img src="/assets/images/about-team.jpg" alt="Keerthi Networks technicians at work reviewing an installation plan" loading="lazy" width="1536" height="1024"></figure>
      </div>
      <div class="split-copy">
        <div class="section-head align-left reveal"><p class="eyebrow">Who We Are</p><h2 class="section-title">Local Roots, Professional Standards</h2></div>
        ${about.intro.map((p) => `<p class="reveal">${p}</p>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section--tight section--gray" aria-label="Mission and vision">
    <div class="container">
      <div class="mv-grid">
        <div class="mv-card reveal"><span class="icon-box icon-box--accent">${icon('zap')}</span><h3>Our Mission</h3><p>${esc(about.mission)}</p></div>
        <div class="mv-card reveal"><span class="icon-box icon-box--accent">${icon('eye')}</span><h3>Our Vision</h3><p>${esc(about.vision)}</p></div>
      </div>
    </div>
  </section>
  <section class="section section--white" aria-labelledby="valuesTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'How We Operate', title: '<span id="valuesTitle">The Values Behind Every Installation</span>' })}
      <div class="values-grid">
        ${about.values.map((v) => `<div class="value-card reveal">${iconBox(v.icon)}<h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section--dark" aria-labelledby="wwdTitle">
    <div class="section-bg-pattern" aria-hidden="true">${iconSize('shield')}</div>
    <div class="container">
      ${sectionHead({ eyebrow: 'What We Do', title: '<span id="wwdTitle">Five Service Lines, One Standard</span>', dark: true })}
      <div class="wwd-grid">
        ${about.whatWeDo.map((s, i) => {
          const slug = site.solutionOrder[i];
          return `<a class="wwd-card reveal" href="/solutions/${slug}.html">${iconBox(s.icon, 'icon-box--accent')}<h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p><span class="link-arrow link-arrow--light">Explore ${icon('arrow-right')}</span></a>`;
        }).join('')}
      </div>
    </div>
  </section>
  <section class="section section--white" aria-labelledby="bizInfoTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'Business Information', title: '<span id="bizInfoTitle">Verified Business Details</span>', lead: 'We are a registered business and we put our details on the record.' })}
      <div class="biz-grid">
        <dl class="biz-list reveal">
          ${about.businessInfo.map((b) => `<div class="biz-row"><dt>${esc(b.label)}</dt><dd>${b.value}</dd></div>`).join('')}
        </dl>
        <div class="biz-side reveal">
          <h3>Service Areas</h3>
          <ul class="area-tags-list">
            ${[...home.serviceArea.primary, ...home.serviceArea.extended].map((c) => `<li class="tag">${esc(c)}</li>`).join('')}
          </ul>
          <a href="/contact-us.html" class="btn btn--ghost-dark btn--sm">Contact Details ${icon('arrow-right')}</a>
        </div>
      </div>
    </div>
  </section>
  ${ctaBand({ title: 'Let’s Discuss Your Requirement', text: 'Every good installation starts with a conversation. Tell us what you need — we will tell you honestly what will work.' })}`;

  write('about-us.html', page({
    path: '/about-us.html', title: about.title, description: about.description, content,
    crumbs: [{ label: 'About Us' }], activeId: 'about', pageType: 'about'
  }));
};

const SOLUTION_PAGE_ICONS = {
  'cctv-surveillance': 'camera',
  'intercom-systems': 'intercom',
  'networking-solutions': 'network',
  'biometric-access-control': 'fingerprint',
  'fire-safety': 'fire'
};

const buildSolution = (slug) => {
  const s = solutions[slug];
  const icon = SOLUTION_PAGE_ICONS[slug];
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${s.name} — ${site.businessName}`,
    serviceType: s.name,
    provider: { '@id': url('/#organization') },
    areaServed: [
      { '@type': 'City', name: 'Bodinayakanur' },
      { '@type': 'City', name: 'Theni' },
      { '@type': 'State', name: 'Tamil Nadu' }
    ],
    description: s.lead
  };
  const content = `
  ${pageHero({ eyebrow: 'Solution', title: s.h1, lead: s.lead, waProduct: s.waProduct, image: s.image, imageAlt: s.name + ' solutions installed by Keerthi Networks and Security Solution' })}
  <section class="section section--white" aria-labelledby="ovTitle">
    <div class="container split">
      <div class="split-copy">
        <div class="section-head align-left reveal">
          <p class="eyebrow">Overview</p>
          <h2 class="section-title" id="ovTitle">Professional ${esc(s.name)}, End to End</h2>
        </div>
        <p class="reveal">${esc(s.lead)}</p>
        ${checkList(s.offers.slice(0, 4).map((o) => o.title), 'reveal')}
        <div class="split-actions reveal">
          ${quoteCta({ cls: 'btn btn--primary', track: 'quote_click' })}
          ${waCta(s.waProduct, { cls: 'btn btn--wa', label: 'Chat on WhatsApp' })}
        </div>
      </div>
      <div class="split-media reveal">
        <figure class="frame frame--offset">
          <img src="${solImg(s.image)}" alt="${esc(s.name)} — professional installation and solutions by Keerthi Networks" loading="lazy" width="768" height="512">
        </figure>
        <div class="frame-badge">${iconBox(icon, 'icon-box--accent')}<span><strong>${esc(s.name)}</strong><em>Installed &amp; supported by our team</em></span></div>
      </div>
    </div>
  </section>
  <section class="section section--gray" aria-labelledby="probTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'Problems We Solve', title: '<span id="probTitle">The Challenges We Hear About Most</span>' })}
      <div class="problem-grid">
        ${s.problems.map((p) => `<div class="problem-card reveal"><span class="problem-marker">${'×'}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section--white" aria-labelledby="offerTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'What We Offer', title: `<span id="offerTitle">${esc(s.offerTitle)}</span>` })}
      <div class="offer-grid">
        ${s.offers.map((o) => `<div class="offer-card reveal">${iconBox(icon)}<h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section--gray" aria-labelledby="appTitle">
    <div class="container split">
      <div class="split-copy">
        <div class="section-head align-left reveal">
          <p class="eyebrow">Suitable Applications</p>
          <h2 class="section-title" id="appTitle">Where This Solution Fits</h2>
        </div>
        <p class="reveal">${esc(s.name)} from Keerthi Networks is trusted across a wide range of properties:</p>
        <ul class="app-chips reveal">${s.applications.map((a) => `<li class="tag tag--primary">${esc(a)}</li>`).join('')}</ul>
      </div>
      <div class="split-copy">
        <div class="section-head align-left reveal">
          <p class="eyebrow">Key Benefits</p>
          <h2 class="section-title">What You Gain</h2>
        </div>
        <div class="benefit-mini-grid">
          ${s.benefits.map((b) => `<div class="benefit-mini reveal">${iconBox(b.icon, 'icon-box--accent')}<div><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div></div>`).join('')}
        </div>
      </div>
    </div>
  </section>
  <section class="section section--navy" aria-labelledby="procTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'Our Process', title: '<span id="procTitle">How a Project Runs</span>', dark: true })}
      ${stepsSection(s.process.map((p, i) => ({ ...p, step: String(i + 1).padStart(2, '0'), icon: ['search', 'doc', 'wrench', 'gear', 'headset'][i] || 'gear' })))}
    </div>
  </section>
  <section class="section section--white" aria-labelledby="sfatTitle">
    <div class="container">
      ${sectionHead({ eyebrow: 'FAQ', title: '<span id="sfatTitle">Questions About ' + esc(s.name) + '</span>' })}
      <div class="faq-narrow">${faqSection(s.faq, { id: `faq-${slug}` })}</div>
    </div>
  </section>
  ${ctaBand({ title: `Need ${esc(s.name)} for Your Property?`, text: 'Tell us about your property and requirement — we will recommend a system that fits, with a clear and itemised quotation.' })}`;

  write(`solutions/${slug}.html`, page({
    path: `/solutions/${slug}.html`, title: s.title, description: s.description, content,
    crumbs: [{ label: 'Solutions', href: '/#solutions' }, { label: s.name }],
    activeId: 'solutions', pageType: 'service', waProduct: s.waProduct,
    extraJsonLd: [serviceLd, faqJsonLdOf(s.faq)]
  }));
};

const buildIndustries = () => {
  const content = `
  ${pageHero({ eyebrow: 'Industries', title: industries.h1, lead: industries.lead, ctas: false })}
  <section class="section section--white">
    <div class="container">
      <p class="industry-note reveal">${icon('info')} ${esc(industries.note)}</p>
      <div class="industry-full-list">
        ${industries.industries.map((ind) => `
        <article class="industry-full reveal" id="${ind.id}">
          <div class="industry-full-head">
            ${iconBox(ind.icon, 'icon-box--lg')}
            <div><h2>${esc(ind.name)}</h2><p>${esc(ind.benefits[0])}</p></div>
          </div>
          <div class="industry-full-cols">
            <div class="industry-col">
              <h3>${icon('alert-triangle')} Typical Challenges</h3>
              <ul class="list-dash">${ind.challenges.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
            </div>
            <div class="industry-col">
              <h3>${icon('shield-check')} Recommended Solutions</h3>
              ${checkList(ind.solutions)}
            </div>
            <div class="industry-col">
              <h3>${icon('badge-check')} Benefits</h3>
              ${checkList(ind.benefits)}
              <div class="industry-ctas">
                <a class="btn btn--ghost-dark btn--sm" href="/request-a-quote.html">Get Quote</a>
                ${waCta(`${ind.name} Solutions`, { cls: 'btn btn--wa btn--sm', label: 'WhatsApp' })}
              </div>
            </div>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>
  ${ctaBand({ title: 'Your Industry Not Listed?', text: 'These are the sectors we work with most — if your property is different, that is exactly where a proper site assessment helps. Ask us.' })}`;

  write('industries.html', page({
    path: '/industries.html', title: industries.title, description: industries.description, content,
    crumbs: [{ label: 'Industries' }], activeId: 'industries', pageType: 'industries'
  }));
};

const buildProjects = () => {
  const content = `
  ${pageHero({ eyebrow: 'Projects', title: projects.h1, lead: projects.lead, ctas: false })}
  <section class="section section--white">
    <div class="container">
      <div class="filters reveal" id="projectFilters">
        <div class="filter-group" role="group" aria-label="Filter by service">
          <span class="filter-label">Service</span>
          <button class="filter-btn is-active" data-filter-group="category" data-filter="all" aria-pressed="true">All</button>
          <button class="filter-btn" data-filter-group="category" data-filter="cctv" aria-pressed="false">CCTV</button>
          <button class="filter-btn" data-filter-group="category" data-filter="networking" aria-pressed="false">Networking</button>
          <button class="filter-btn" data-filter-group="category" data-filter="biometric" aria-pressed="false">Biometric</button>
          <button class="filter-btn" data-filter-group="category" data-filter="intercom" aria-pressed="false">Intercom</button>
          <button class="filter-btn" data-filter-group="category" data-filter="fire-safety" aria-pressed="false">Fire Safety</button>
        </div>
        <div class="filter-group" role="group" aria-label="Filter by industry">
          <span class="filter-label">Industry</span>
          <button class="filter-btn is-active" data-filter-group="industry" data-filter="all" aria-pressed="true">All</button>
          <button class="filter-btn" data-filter-group="industry" data-filter="residential" aria-pressed="false">Residential</button>
          <button class="filter-btn" data-filter-group="industry" data-filter="office" aria-pressed="false">Office</button>
          <button class="filter-btn" data-filter-group="industry" data-filter="commercial" aria-pressed="false">Commercial</button>
          <button class="filter-btn" data-filter-group="industry" data-filter="industrial" aria-pressed="false">Industrial</button>
        </div>
      </div>
      <p class="filter-count" id="projectCount" role="status"></p>
      <div class="projects-grid" id="projectsGrid">
        ${projects.projects.map((p, i) => `
        <article class="project-card reveal" data-category="${p.category}" data-industry="${p.industry}">
          <button type="button" class="project-card-media" data-lightbox="${i}" aria-label="View larger photo — ${esc(p.title)}" data-track="project_view">
            <img src="${solImg(p.image)}" alt="Representative photo of a ${esc(p.category.replace('-', ' '))} installation — ${esc(p.title)}" loading="lazy" width="768" height="512">
            <span class="project-card-zoom">${icon('search')}</span>
            <span class="tag tag--accent project-card-tag">${esc(projectCategoryLabel(p.category))}</span>
          </button>
          <div class="project-card-body">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.desc)}</p>
            <p class="project-card-meta">${icon('map-pin')} ${esc(p.location)}</p>
            <ul class="project-card-services">${p.services.map((s) => `<li class="tag">${esc(s)}</li>`).join('')}</ul>
          </div>
        </article>`).join('')}
      </div>
      <div class="empty-state" id="projectsEmpty" hidden style="display: none;">
        ${icon('search')}
        <h2>No projects match this combination</h2>
        <p>Try a different filter combination, or ask us directly about work similar to your requirement.</p>
        ${waCta('', { cls: 'btn btn--wa', label: 'Ask on WhatsApp' })}
      </div>
    </div>
  </section>
  ${ctaBand({ title: 'Want Work Like This at Your Property?', text: 'Tell us what you need — we will survey, design and install it with the same care.' })}`;

  write('projects.html', page({
    path: '/projects.html', title: projects.title, description: projects.description, content,
    crumbs: [{ label: 'Projects' }], activeId: 'projects', pageType: 'projects'
  }));
};

const buildWhy = () => {
  const pillars = [
    { icon: 'clipboard', t: 'Industry Experience', d: 'We work across homes, shops, offices, factories, schools, hospitals and apartments — every property type teaches us something that shows up in the next installation.' },
    { icon: 'gear', t: 'Technical Expertise', d: 'From camera optics and DVR/NVR configuration to CAT6 termination, biometric enrolment and extinguisher placement — we understand the equipment we install, not just how to mount it.' },
    { icon: 'doc', t: 'Customized Design', d: 'Your property is not a template. Coverage plans, cabling routes and device choices are designed around your site survey — never copied from a brochure.' },
    { icon: 'badge-check', t: 'Quality Components', d: 'We recommend dependable, warranty-backed equipment suited to your budget, and we say no to products we would not use ourselves.' },
    { icon: 'chart', t: 'Transparent Pricing', d: 'Itemised quotations with clear scope. You will always know what you are paying for — and what you are not.' },
    { icon: 'wrench', t: 'Professional Installation', d: 'Trained technicians, neat cabling, correct mounting heights and angles, tested terminations and a cleaned-up site at handover.' },
    { icon: 'headset', t: 'After-Sales Support', d: 'Systems need care. We remain available for maintenance, troubleshooting, refilling and upgrades — before small issues become failures.' },
    { icon: 'network', t: 'One-Stop Solution', d: 'CCTV, intercom, networking, biometrics and fire safety under one roof — coordinated design, single accountability, simpler support.' }
  ];
  const content = `
  ${pageHero({ eyebrow: 'Why Choose Us', title: 'The Difference Is in the Details', lead: 'Anyone can sell and mount a camera. We design systems, install them properly, and stay answerable for them afterwards.', ctas: false })}
  <section class="section section--white">
    <div class="container">
      <div class="pillar-grid">
        ${pillars.map((p) => `<div class="pillar reveal">${iconBox(p.icon, 'icon-box--accent')}<h2>${esc(p.t)}</h2><p>${esc(p.d)}</p></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section--dark promise-section">
    <div class="section-bg-pattern" aria-hidden="true">${iconSize('badge-check')}</div>
    <div class="container split">
      <div class="split-copy">
        <div class="section-head align-left reveal">
          <p class="eyebrow">Our Promise</p>
          <h2 class="section-title">What You Can Expect From Us</h2>
        </div>
        <p class="reveal">No false promises, no inflated claims — just the professional conduct we hold ourselves to on every project, large or small.</p>
      </div>
      <div class="promise-list">
        ${['An honest assessment of what you need — and what you do not', 'A written, itemised quotation before any work begins', 'Neat, tested, professional installation', 'A proper handover walkthrough so your team can use the system', 'Support after installation — we do not disappear'].map((t) => `<div class="promise-item reveal">${icon('check-circle')}<span>${esc(t)}</span></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="section section--white">
    <div class="container">
      ${sectionHead({ eyebrow: 'How We Work', title: '<span>From First Call to Long-Term Support</span>' })}
      ${stepsSection(home.howWeWork.slice(0, 4), { dark: false })}
    </div>
  </section>
  ${ctaBand({ title: 'Experience the Difference Yourself', text: 'Call, message or request a site visit — let the quality of our response be your first impression.' })}`;

  write('why-choose-us.html', page({
    path: '/why-choose-us.html', title: 'Why Choose Us | Keerthi Networks and Security Solution',
    description: 'Requirement-first design, professional installation, transparent pricing and dependable after-sales support — why customers choose Keerthi Networks in Theni and Bodinayakanur.',
    content, crumbs: [{ label: 'Why Choose Us' }], activeId: 'why', pageType: 'why'
  }));
};

const buildFaq = () => {
  const allItems = faqData.groups.flatMap((g) => g.items);
  const content = `
  ${pageHero({ eyebrow: 'FAQ', title: 'Frequently Asked Questions', lead: faqData.lead, ctas: false })}
  <section class="section section--white">
    <div class="container">
      <div class="faq-groups">
        ${faqData.groups.map((g, gi) => `
        <div class="faq-group reveal">
          <h2 class="faq-group-title">${esc(g.name)}</h2>
          ${faqSection(g.items, { id: `fg${gi}` })}
        </div>`).join('')}
      </div>
      <div class="faq-cta card card--tint reveal">
        <div><h2>Still Have a Question?</h2><p>We answer enquiry messages personally — no call centres, no bots.</p></div>
        <div class="card-actions">
          ${waCta('', { cls: 'btn btn--wa', label: 'Chat on WhatsApp' })}
          <a href="/contact-us.html" class="btn btn--ghost-dark">Contact Us</a>
        </div>
      </div>
    </div>
  </section>`;

  write('faq.html', page({
    path: '/faq.html', title: faqData.title, description: faqData.description, content,
    crumbs: [{ label: 'FAQ' }], activeId: '', pageType: 'faq', extraJsonLd: [faqJsonLdOf(allItems)]
  }));
};

const buildContact = () => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent('Keerthi Networks and Security Solution, No. 159, Karuppasamy Koil Street, Dharmathupatti, Melachokkanathapuram, Bodinayakanur, Theni 625582, Tamil Nadu')}`;
  const content = `
  ${pageHero({ eyebrow: 'Contact Us', title: 'Talk to a Real Person', lead: 'Message us on WhatsApp, send an email, or use the enquiry form — every message reaches us directly and gets a personal reply.', ctas: false })}
  <section class="section section--white contact-section">
    <div class="container contact-grid">
      <div class="contact-side">
        <div class="contact-card reveal">
          <h2>${icon('map-pin')} Visit Us</h2>
          <address>
            <strong>${esc(site.businessName)}</strong><br>
            ${site.address.line1}<br>${site.address.line2}<br>${site.address.line3}<br>${site.address.line4}
          </address>
          <a class="btn btn--ghost-dark btn--sm" href="${mapsUrl}" target="_blank" rel="noopener">Get Directions ${icon('external')}</a>
        </div>
        <div class="contact-card reveal">
          <h2>${icon('mail')} Email</h2>
          <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
        </div>
        <div class="contact-card reveal">
          <h2>${icon('phone-call')} Phone &amp; WhatsApp</h2>
          ${site.phoneHref
            ? `<p><a data-tel href="${site.phoneHref}" data-track="phone_click">${esc(site.phoneDisplay)}</a></p>`
            : `<p class="contact-muted">Phone number is being updated —<br>please reach us on WhatsApp or email.</p>`}
          ${waCta('', { cls: 'btn btn--wa btn--sm', label: 'Chat on WhatsApp' })}
        </div>
        <div class="contact-card reveal">
          <h2>${icon('clock')} Business Hours</h2>
          <p class="contact-muted">${esc(site.businessHours || '')}</p>
        </div>
        <div class="contact-card reveal">
          <h2>${icon('doc')} Business Registration</h2>
          <p>GSTIN: <strong>${esc(site.gstin)}</strong></p>
        </div>
      </div>
      <div class="contact-form-wrap reveal">
        <div class="section-head align-left">
          <p class="eyebrow">Send an Enquiry</p>
          <h2 class="section-title">Tell Us What You Need</h2>
          <p class="section-lead">Fill this in — we will prepare a professional WhatsApp message with your details. You just review and press send.</p>
        </div>
        ${contactForm()}
      </div>
    </div>
  </section>`;

  write('contact-us.html', page({
    path: '/contact-us.html', title: 'Contact Us | Keerthi Networks and Security Solution, Theni',
    description: `Contact Keerthi Networks and Security Solution — Bodinayakanur, Theni. Email ${site.email}, WhatsApp enquiry or visit us. CCTV, networking, biometric, intercom and fire safety solutions.`,
    content, crumbs: [{ label: 'Contact Us' }], activeId: 'contact', pageType: 'contact'
  }));
};

const buildQuote = () => {
  const content = `
  ${pageHero({ eyebrow: 'Request a Quote', title: 'Get a Clear, Itemised Quotation', lead: 'Fill in the details below — we will prepare a structured WhatsApp message with everything we need to quote accurately. No obligation, no pressure.', ctas: false })}
  <section class="section section--white form-page">
    <div class="container form-page-grid">
      <div class="form-page-side">
        <div class="side-card reveal">
          <h2>${icon('doc')} What Happens Next?</h2>
          <ol class="side-steps">
            <li><span>1</span><div><strong>Complete the form</strong><em>It takes about two minutes.</em></div></li>
            <li><span>2</span><div><strong>Press Send in WhatsApp</strong><em>Your details reach us instantly and privately.</em></div></li>
            <li><span>3</span><div><strong>We respond</strong><em>With questions if needed, or a clear quotation.</em></div></li>
            <li><span>4</span><div><strong>Site visit if required</strong><em>For accurate pricing on larger scopes.</em></div></li>
          </ol>
        </div>
        <div class="side-card side-card--tint reveal">
          <h2>${icon('info')} Prefer to Talk First?</h2>
          <p>Message us on WhatsApp — for many requirements a short conversation is the fastest route to a quote.</p>
          ${waCta('', { cls: 'btn btn--wa btn--sm', label: 'Chat on WhatsApp' })}
        </div>
      </div>
      <div class="form-page-main reveal">
        ${quoteForm()}
      </div>
    </div>
  </section>`;

  write('request-a-quote.html', page({
    path: '/request-a-quote.html', title: 'Request a Free Quote | Keerthi Networks and Security Solution',
    description: 'Request a free, itemised quotation for CCTV, intercom, networking, biometric access control or fire safety solutions in Theni, Bodinayakanur and across Tamil Nadu.',
    content, crumbs: [{ label: 'Request a Quote' }], activeId: '', pageType: 'quote'
  }));
};

const buildSiteVisit = () => {
  const content = `
  ${pageHero({ eyebrow: 'Request a Site Visit', title: 'Book a Site Assessment', lead: 'Good systems are designed on-site, not over the phone. Pick a date and time — we will confirm and be there.', ctas: false })}
  <section class="section section--white form-page">
    <div class="container form-page-grid">
      <div class="form-page-side">
        <div class="side-card reveal">
          <h2>${icon('search')} What We Assess on a Visit</h2>
          <ul class="list-check">
            <li>Coverage areas, entry points and blind spots</li>
            <li>Cable routes and mounting positions</li>
            <li>Network and power readiness</li>
            <li>Fire risk points and equipment placement</li>
            <li>The right system size for your budget</li>
          </ul>
        </div>
        <div class="side-card side-card--tint reveal">
          <h2>${icon('calendar')} Visiting Hours</h2>
          <p>${esc(site.businessHours || '')}</p>
          <p class="small-muted">Date and time are requests — we confirm by WhatsApp before setting out.</p>
        </div>
      </div>
      <div class="form-page-main reveal">
        ${siteVisitForm()}
      </div>
    </div>
  </section>`;

  write('request-site-visit.html', page({
    path: '/request-site-visit.html', title: 'Request a Site Visit | Keerthi Networks and Security Solution',
    description: 'Book a site assessment in Theni, Bodinayakanur or nearby areas for CCTV, networking, intercom, biometric access control or fire safety requirements.',
    content, crumbs: [{ label: 'Request a Site Visit' }], activeId: '', pageType: 'site-visit'
  }));
};

const buildLegal = () => {
  const kinds = [
    ['privacy-policy', legal.privacy], ['terms-and-conditions', legal.terms], ['disclaimer', legal.disclaimer]
  ];
  for (const [file, doc] of kinds) {
    const content = `
    ${pageHero({ eyebrow: 'Legal', title: doc.title, lead: doc.intro, ctas: false })}
    <section class="section section--white legal-section">
      <div class="container legal-wrap">
        <p class="legal-updated reveal">${esc(legal.updated)}</p>
        ${doc.sections.map((s, i) => `
        <div class="legal-block reveal">
          <h2><span class="legal-num">${String(i + 1).padStart(2, '0')}</span>${esc(s.h)}</h2>
          <p>${esc(s.p)}</p>
        </div>`).join('')}
        <div class="legal-contact reveal">
          <h2>Questions?</h2>
          <p>Write to <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> or send us a WhatsApp message.</p>
          ${waCta('', { cls: 'btn btn--wa btn--sm', label: 'Chat on WhatsApp' })}
        </div>
      </div>
    </section>`;
    write(`${file}.html`, page({
      path: `/${file}.html`, title: `${doc.title} | ${site.businessName}`,
      description: `${doc.title} of ${site.businessName} — ${doc.intro.slice(0, 130)}…`,
      content, crumbs: [{ label: doc.title }], pageType: 'legal'
    }));
  }
};

const build404 = () => {
  const content = `
  <section class="notfound">
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-grid-lines"></div>
      <div class="hero-glow hero-glow--1"></div>
    </div>
    <div class="container notfound-inner">
      ${logoMark('notfound-logo')}
      <p class="notfound-code" aria-hidden="true">4<span>0</span>4</p>
      <h1>Page Not Found</h1>
      <p class="notfound-lead">The page you are looking for may have been moved or renamed. Let us get you back on track — your security questions are always welcome.</p>
      <div class="notfound-ctas">
        <a href="/" class="btn btn--primary btn--lg">${icon('home')}<span>Go Home</span></a>
        <a href="/#solutions" class="btn btn--outline-light btn--lg"><span>Our Solutions</span></a>
        <a href="/contact-us.html" class="btn btn--outline-light btn--lg"><span>Contact Us</span></a>
        ${quoteCta({ cls: 'btn btn--primary btn--lg', track: 'quote_click' })}
        ${waCta('', { cls: 'btn btn--wa btn--lg', label: 'Chat on WhatsApp' })}
      </div>
    </div>
  </section>`;
  write('404.html', page({
    path: '/404.html', title: 'Page Not Found (404) | Keerthi Networks and Security Solution',
    description: 'The page you requested was not found. Return home, explore our solutions, or contact Keerthi Networks and Security Solution.',
    content, pageType: '404'
  }));
};

/* ============================================================
   META FILES
   ============================================================ */

const buildMeta = () => {
  const pages = [
    ['/', 1.0, 'weekly'],
    ['/about-us.html', 0.8, 'monthly'],
    ...site.solutionOrder.map((s) => [`/solutions/${s}.html`, 0.9, 'monthly']),
    ['/industries.html', 0.8, 'monthly'],
    ['/projects.html', 0.7, 'monthly'],
    ['/why-choose-us.html', 0.7, 'monthly'],
    ['/faq.html', 0.6, 'monthly'],
    ['/request-a-quote.html', 0.9, 'monthly'],
    ['/request-site-visit.html', 0.8, 'monthly'],
    ['/contact-us.html', 0.9, 'monthly'],
    ['/privacy-policy.html', 0.3, 'yearly'],
    ['/terms-and-conditions.html', 0.3, 'yearly'],
    ['/disclaimer.html', 0.3, 'yearly']
  ];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pri, freq]) => `  <url>
    <loc>${url(p)}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`);

  write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${url('/sitemap.xml')}
`);

  write('site.webmanifest', JSON.stringify({
    name: site.businessName,
    short_name: 'KNSS',
    description: 'CCTV, Intercom, Networking, Biometric, Access Control & Fire Safety solutions in Theni, Tamil Nadu.',
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: '#0B1F3A',
    theme_color: '#0B1F3A',
    lang: 'en-IN',
    icons: [
      { src: 'assets/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'assets/icons/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
    ]
  }, null, 2) + '\n');
};

/* ============================================================
   CLIENT CONFIG (single source of truth → assets/js/config.js)
   ============================================================ */

const buildConfig = () => {
  const js = `/* ============================================================
   SITE CONFIGURATION — single source of truth for contact info
   Generated by tools/site/build.js from tools/site/content/site.json
   Update content/site.json and re-run "node tools/site/build.js"

   Note: declared with "var" so SITE_CONFIG is reachable as
   window.SITE_CONFIG from every other script.
   ============================================================ */
var SITE_CONFIG = {
    businessName: ${JSON.stringify(site.businessName)},

    /* Client to provide verified phone number (currently unverified). */
    phone: ${JSON.stringify(site.phoneDisplay)},
    phoneHref: ${JSON.stringify(site.phoneHref)},

    /* Client to provide verified WhatsApp number (currently unverified). */
    whatsapp: ${JSON.stringify(site.whatsapp)},

    email: ${JSON.stringify(site.email)},

    address: ${JSON.stringify(site.address)},

    gstin: ${JSON.stringify(site.gstin)},

    businessHours: ${JSON.stringify(site.businessHours)},

    googleMapsUrl: ${JSON.stringify(site.googleMapsUrl)},

    /* Replace with real IDs before enabling analytics. */
    gaMeasurementId: ${JSON.stringify(site.gaMeasurementId)},
    gtmContainerId: ${JSON.stringify(site.gtmContainerId)}
};
`;
  write('assets/js/config.js', js);
};

/* ============================================================
   i18n DATA (Tamil dictionary → assets/js/i18n-data.js)
   Merged from tools/site/i18n/*.json — exact-English string map
   plus runtime message IDs and per-page titles.
   ============================================================ */

const buildI18n = () => {
  const dir = path.join(import.meta.dirname, 'i18n');
  const files = ['ta-ui.json', 'ta-solutions.json', 'ta-legal.json', 'ta-extra.json'];
  const strings = {};
  const runtime = {};
  const attrs = {};
  const meta = {};
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    Object.assign(strings, data.strings || {});
    Object.assign(runtime, data.runtime || {});
    Object.assign(attrs, data.attrs || {});
    Object.assign(meta, data.meta || {});
  }
  const js = `/* ============================================================
   I18N DATA — Tamil dictionary for the EN / த language toggle.
   Generated by tools/site/build.js from tools/site/i18n/*.json.
   Do not edit by hand — update the JSON sources and re-run
   "node tools/site/build.js". Declared with "var" so the data is
   reachable as window.KNSS_I18N_DATA from every other script.
   ============================================================ */
var KNSS_I18N_DATA = {
    lang: 'ta',
    strings: ${JSON.stringify(strings)},
    runtime: ${JSON.stringify(runtime)},
    attrs: ${JSON.stringify(attrs)},
    meta: ${JSON.stringify(meta)}
};
`;
  write('assets/js/i18n-data.js', js);
};

/* ============================================================
   RUN
   ============================================================ */

buildConfig();
buildI18n();
buildHome();
buildAbout();
for (const slug of site.solutionOrder) buildSolution(slug);
buildIndustries();
buildProjects();
buildWhy();
buildFaq();
buildContact();
buildQuote();
buildSiteVisit();
buildLegal();
build404();
buildMeta();
console.log('\nAll pages built.');
