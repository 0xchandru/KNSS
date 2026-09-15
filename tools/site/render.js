/* ============================================================
   KNSS site builder — shared render helpers, icons & templates
   ============================================================ */
import site from './content/site.json' with { type: 'json' };

export { site };

export const phoneDisplay = site.phoneDisplay || '';
export const phoneHref = site.phoneHref || '';

/* ---------- utilities ---------- */

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const url = (p = '/') => {
  const base = site.siteUrl.replace(/\/+$/, '');
  const path = ('/' + p).replace(/\/+/g, '/');
  return base + (path === '/' ? '/' : path);
};

const asset = (p) => '/' + p.replace(/^\/+/, '');

/* ---------- icon system (inline SVG, stroke = currentColor) ---------- */

const P = {
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm18 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z"/><path d="M3 14v-3a9 9 0 0 1 18 0v3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'phone-call': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94M14.05 6A5 5 0 0 1 18 10"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  intercom: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  doc: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  office: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  shop: '<path d="m2 7 2.4-3.6A2 2 0 0 1 6.06 2.5h11.88a2 2 0 0 1 1.66.9L22 7"/><path d="M2 7h20v3a2.5 2.5 0 0 1-5 .5 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5-.5Z"/><path d="M4 12.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7.5"/><path d="M9 21v-5h6v5"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  school: '<path d="M22 10v6"/><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  hospital: '<path d="M12 6v4"/><path d="M10 8h4"/><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4h6v4"/>',
  hotel: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  apartment: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  crane: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1Z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/>',
  govt: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 9 5H3z"/>',
  building: '<path d="M3 22h18"/><path d="M5 22V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 8h.01"/><path d="M15 8h.01"/><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M9 16h.01"/><path d="M15 16h.01"/><path d="M12 16h.01"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  quote: '<path d="M10 11H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4"/><path d="M20 11h-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  navigation: '<path d="m3 11 19-9-9 19-2-8z"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
};

export const icon = (name, cls = '') => {
  const body = P[name] || P.info;
  const c = cls ? ` class="${cls}"` : '';
  return `<svg${c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
};

export const iconSize = (name) => {
  const body = P[name] || P.info;
  const c = ' class="pattern-icon"';
  return `<svg${c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
};

export const WHATSAPP_ICON =
  '<svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';

export const SOCIAL_ICONS = {
  facebook: '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  instagram: '<svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
  youtube: '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  linkedin: '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
  twitter: '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
};

/* ---------- logo ---------- */

export const logoMark = (cls = 'logo-mark') => `
<img class="${cls}" src="/assets/icons/logo.png" alt="KNSS Logo" width="52" height="42" loading="eager">`;

export const logo = (href = '/', cls = '') => `
<a href="${href}" class="brand ${cls}" aria-label="Keerthi Networks and Security Solutions — Home">
  <img class="brand-logo-img" src="/assets/icons/knss-logo.png" alt="Keerthi Networks and Security Solutions Logo" width="52" height="42" loading="eager">
  <span class="brand-text">
    <span class="brand-name" lang="en">Keerthi Networks</span>
    <span class="brand-sub" lang="en">&amp; SECURITY SOLUTIONS</span>
  </span>
</a>`;

export const preloader = () => `
<div class="site-preloader" id="sitePreloader" aria-hidden="true">
  <div class="preloader-inner">
    <div class="preloader-shield">
      ${logoMark('preloader-logo-img')}
    </div>
    <div class="preloader-brand-title">
      <span lang="en">KNSS</span>
      <small lang="en">Keerthi Networks &amp; Security Solution</small>
    </div>
    <div class="preloader-bar" role="progressbar" aria-label="Loading site">
      <div class="preloader-progress"></div>
    </div>
  </div>
</div>`;

/* ---------- small reusable blocks ---------- */

export const iconBox = (name, cls = '') => `<span class="icon-box ${cls}">${icon(name)}</span>`;

export const checkList = (items, cls = '') =>
  `<ul class="list-check ${cls}">${items.map((t) => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>`;

export const sectionHead = ({ eyebrow = '', title = '', lead = '', align = 'center', dark = false } = {}) => `
<div class="section-head align-${align} ${dark ? 'on-dark' : ''} reveal">
  ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
  ${title ? `<h2 class="section-title">${title}</h2>` : ''}
  ${lead ? `<p class="section-lead">${lead}</p>` : ''}
</div>`;

export const waCta = (product, { cls = 'btn btn--wa', label = 'Chat on WhatsApp', track = 'whatsapp_click', iconShow = true } = {}) => `
<a href="#" class="${cls}" data-wa ${product ? `data-wa-product="${esc(product)}"` : ''} data-track="${track}">
  ${iconShow ? WHATSAPP_ICON : ''}<span>${esc(label)}</span>
</a>`;

export const quoteCta = ({ cls = 'btn btn--primary', label = 'Get Free Quote', track = 'quote_click' } = {}) =>
  `<a href="/request-a-quote.html" class="${cls}" data-track="${track}"><span>${esc(label)}</span>${icon('arrow-right')}</a>`;

export const visitCta = ({ cls = 'btn btn--ghost', label = 'Request Site Visit', track = 'site_visit_click' } = {}) =>
  `<a href="/request-site-visit.html" class="${cls}" data-track="${track}"><span>${esc(label)}</span></a>`;

export const ctaBand = ({ title = 'Ready to Secure Your Property?', text = '', note = '' } = {}) => `
<section class="cta-band" aria-labelledby="ctaBandTitle">
  <div class="container cta-band-inner">
    <div class="cta-band-copy reveal">
      <h2 id="ctaBandTitle">${title}</h2>
      ${text ? `<p>${text}</p>` : ''}
    </div>
    <div class="cta-band-actions reveal">
      ${quoteCta({ cls: 'btn btn--primary btn--lg', track: 'quote_click' })}
      <a href="#" class="btn btn--wa btn--lg" data-wa data-track="whatsapp_click">${WHATSAPP_ICON}<span>Chat on WhatsApp</span></a>
      ${visitCta({ cls: 'btn btn--outline-light btn--lg', track: 'site_visit_click' })}
    </div>
  </div>
  ${note ? `<p class="cta-band-note container">${esc(note)}</p>` : ''}
</section>`;

export const faqSection = (items, { id = 'faq' } = {}) => `
<div class="faq-list" id="${id}">
  ${items.map((f, i) => `
  <div class="faq-item reveal">
    <h3 class="faq-q">
      <button type="button" class="faq-btn" id="${id}-btn-${i}" aria-expanded="false" aria-controls="${id}-a-${i}">
        <span>${esc(f.q)}</span>
        <span class="faq-chevron">${icon('chevron-down')}</span>
      </button>
    </h3>
    <div class="faq-a" id="${id}-a-${i}" role="region" aria-labelledby="${id}-btn-${i}" hidden>
      <div class="faq-a-inner"><p>${esc(f.a)}</p></div>
    </div>
  </div>`).join('')}
</div>`;

export const stepsSection = (steps, { dark = true } = {}) => `
<ol class="steps ${dark ? 'on-dark' : ''}">
  ${steps.map((s) => `
  <li class="step reveal">
    <div class="step-top">
      <span class="step-num">${esc(s.step)}</span>
      <span class="step-icon">${icon(s.icon)}</span>
    </div>
    <h3 class="step-title">${esc(s.title)}</h3>
    <p class="step-text">${esc(s.text)}</p>
  </li>`).join('')}
</ol>`;

/* ---------- header ---------- */

const NAV = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About Us', href: '/about-us.html' },
  { id: 'solutions', label: 'Solutions', href: '#', dropdown: true },
  { id: 'industries', label: 'Industries', href: '/industries.html' },
  { id: 'projects', label: 'Projects', href: '/projects.html' },
  { id: 'why', label: 'Why Choose Us', href: '/why-choose-us.html' },
  { id: 'contact', label: 'Contact Us', href: '/contact-us.html' }
];

const SOLUTION_MENU = {
  'cctv-surveillance': 'Cameras, recording & remote monitoring',
  'intercom-systems': 'Audio & video door communication',
  'networking-solutions': 'Structured cabling, LAN & Wi-Fi',
  'biometric-access-control': 'Attendance & door access systems',
  'fire-safety': 'Extinguishers, inspection & refilling'
};

const SOLUTION_ICONS = {
  'cctv-surveillance': 'camera',
  'intercom-systems': 'intercom',
  'networking-solutions': 'network',
  'biometric-access-control': 'fingerprint',
  'fire-safety': 'fire'
};

/* ---------- language toggle (EN / த pill switch) ---------- */

export const langToggle = (variant = '') => `
<div class="lang-toggle${variant ? ' ' + variant : ''}" role="group" aria-label="Language / மொழி" data-lang-toggle>
  <button type="button" class="lang-btn is-active" data-lang-option="en" aria-pressed="true" lang="en" title="English">EN</button>
  <button type="button" class="lang-btn" data-lang-option="ta" aria-pressed="false" lang="ta" title="தமிழ்">த</button>
</div>`;

/* ---------- Config-driven social icons ---------- */
export const getActiveSocials = (variant = 'topbar') => {
  const socialMeta = {
    whatsapp: { cls: 'social-btn--wa', title: 'WhatsApp', label: 'Chat on WhatsApp', icon: WHATSAPP_ICON, isWa: true },
    facebook: { cls: 'social-btn--fb', title: 'Facebook', label: 'Follow KNSS on Facebook', icon: SOCIAL_ICONS.facebook },
    instagram: { cls: 'social-btn--ig', title: 'Instagram', label: 'Follow KNSS on Instagram', icon: SOCIAL_ICONS.instagram },
    youtube: { cls: 'social-btn--yt', title: 'YouTube', label: 'Watch KNSS on YouTube', icon: SOCIAL_ICONS.youtube },
    linkedin: { cls: 'social-btn--in', title: 'LinkedIn', label: 'Connect on LinkedIn', icon: SOCIAL_ICONS.linkedin },
    twitter: { cls: 'social-btn--tw', title: 'Twitter / X', label: 'Follow KNSS on Twitter / X', icon: SOCIAL_ICONS.twitter }
  };

  const active = Object.entries(site.socialLinks || {})
    .filter(([key, u]) => {
      if (variant === 'footer' && key === 'whatsapp') return false;
      return u && typeof u === 'string' && u.trim().length > 0 && socialMeta[key];
    });

  return active.map(([key, u]) => {
    const m = socialMeta[key];
    const itemCls = variant === 'topbar' ? `topbar-social-btn ${m.cls}` : `footer-social-btn ${m.cls}`;
    const waAttr = m.isWa ? ` data-wa data-track="${variant}_wa_click"` : ` data-track="${variant}_social_${key}"`;
    return `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" class="${itemCls}" aria-label="${esc(m.label)}" title="${esc(m.title)}"${waAttr}>${m.icon}</a>`;
  }).join('');
};

export const header = (activeId = '') => {
  const navItems = NAV.map((n) => {
    const isActive = (n.id === activeId);
    if (n.dropdown) {
      const items = site.solutionOrder
        .map((slug) => `<li><a href="/solutions/${slug}.html" data-nav="${slug}">${icon(SOLUTION_ICONS[slug])}<span class="dd-item-text"><span class="dd-item-name">${esc(SOLUTION_NAMES[slug])}</span><span class="dd-item-desc">${esc(SOLUTION_MENU[slug])}</span></span></a></li>`)
        .join('');
      return `<li class="has-dropdown">
        <button type="button" class="nav-link dropdown-toggle${isActive ? ' is-active' : ''}" id="solutionsToggle" aria-expanded="false" aria-controls="solutionsMenu" data-nav="${n.id}"><span>${n.label}</span>${icon('chevron-down', 'dd-chevron')}</button>
        <ul class="dropdown" id="solutionsMenu" aria-label="Solutions">
          ${items}
          <li class="dropdown-footer"><a href="/industries.html">Not sure what you need? ${icon('arrow-right')}</a></li>
        </ul>
      </li>`;
    }
    return `<li><a class="nav-link${isActive ? ' is-active' : ''}" href="${n.href}" data-nav="${n.id}"${isActive ? ' aria-current="page"' : ''}>${n.label}</a></li>`;
  }).join('');


  const topbarSocials = getActiveSocials('topbar');

  return `
<a class="skip-link" href="#main">Skip to main content</a>
<div class="topbar">
  <div class="container topbar-inner">
    <div class="topbar-left">
      <span class="topbar-item topbar-loc" title="Service Coverage Area">
        ${icon('map-pin')}
        <span>Chennai HQ · Serving All Over Tamil Nadu</span>
      </span>
      <span class="topbar-sep" aria-hidden="true"></span>
      <span class="topbar-item topbar-hours" title="Official Business Hours">
        ${icon('clock')}
        <span>${esc(site.businessHours)}</span>
      </span>
      <span class="topbar-sep topbar-sep--email" aria-hidden="true"></span>
      <a href="mailto:${esc(site.email)}" class="topbar-item topbar-email" aria-label="Email: ${esc(site.email)}" title="Send email to ${esc(site.email)}">
        ${icon('mail')}
        <span lang="en">${esc(site.email)}</span>
      </a>
    </div>
    <div class="topbar-right">
      <a href="${phoneHref}" class="topbar-item topbar-phone" data-tel aria-label="Call: ${esc(phoneDisplay)}">
        ${icon('phone-call')}
        <span lang="en">${esc(phoneDisplay)}</span>
      </a>
      ${topbarSocials ? `<span class="topbar-sep" aria-hidden="true"></span><div class="topbar-socials" aria-label="Social profiles">${topbarSocials}</div>` : ''}
      <span class="topbar-sep" aria-hidden="true"></span>
      <a href="/request-site-visit.html" class="topbar-cta-pill" data-track="topbar_visit_click">
        <span class="topbar-pulse" aria-hidden="true"></span>
        <span>Book Site Visit</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="topbar-link-arrow" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>
    </div>
    <div class="topbar-mobile">
      <a href="${phoneHref}" class="topbar-mob-item topbar-mob-phone" data-tel aria-label="Call: ${esc(phoneDisplay)}">
        ${icon('phone-call')}
        <span lang="en">${esc(phoneDisplay)}</span>
      </a>
      <span class="topbar-sep" aria-hidden="true"></span>
      <a href="mailto:${esc(site.email)}" class="topbar-mob-item topbar-mob-email" aria-label="Email: ${esc(site.email)}" title="${esc(site.email)}">
        ${icon('mail')}
      </a>
      ${topbarSocials ? `<span class="topbar-sep" aria-hidden="true"></span><div class="topbar-mob-socials">${topbarSocials}</div>` : ''}
      <span class="topbar-sep" aria-hidden="true"></span>
      <a href="/request-site-visit.html" class="topbar-mob-item topbar-mob-cta" data-track="topbar_mobile_visit">
        <span class="topbar-pulse" aria-hidden="true"></span>
        <span>Site Visit</span>
      </a>
    </div>
  </div>
</div>
<header class="site-header" id="siteHeader">
  <div class="navbar">
    <div class="container navbar-inner">
      ${logo()}
      <nav class="primary-nav" id="primaryNav" aria-label="Main navigation">
        <div class="primary-nav-head">
          <div class="primary-nav-brand">
            <img class="logo-mark logo-mark--nav" src="/assets/icons/knss-logo.png" alt="KNSS Logo" width="44" height="36" loading="eager">
            <span class="pnav-title">
              <span class="pnav-name" lang="en">Keerthi Networks</span>
              <span class="pnav-sub" lang="en">&amp; SECURITY SOLUTIONS</span>
            </span>
          </div>
          <div class="primary-nav-head-actions">
            ${langToggle('lang-toggle--drawer')}
            <button type="button" class="nav-close" id="navClose" aria-label="Close menu">${icon('x')}</button>
          </div>
        </div>
        <div class="primary-nav-body">
          <ul class="nav-list">${navItems}</ul>
        </div>
        <div class="primary-nav-footer">
          <div class="nav-cta-group">
            <a href="/request-a-quote.html" class="btn btn--primary btn--drawer-quote" data-track="quote_click">
              <span>Get Free Quote</span>${icon('arrow-right')}
            </a>
            <div class="nav-cta-row">
              <a href="/request-site-visit.html" class="btn btn--ghost-dark btn--sm" data-track="site_visit_click">
                ${icon('calendar')}<span>Site Visit</span>
              </a>
              <a href="#" class="btn btn--wa btn--sm" data-wa data-track="whatsapp_click">
                ${WHATSAPP_ICON}<span>WhatsApp</span>
              </a>
            </div>
          </div>
          <div class="nav-contact-mini">
            <a href="${phoneHref}" data-tel>${icon('phone-call')}<span>${esc(phoneDisplay)}</span></a>
            <a href="mailto:${esc(site.email)}">${icon('mail')}<span>${esc(site.email)}</span></a>
          </div>
        </div>
      </nav>
      <div class="navbar-actions">
        ${langToggle('lang-toggle--nav')}
        <a href="/request-a-quote.html" class="btn btn--primary navbar-quote" data-track="quote_click">Get Free Quote</a>
        <button type="button" class="hamburger" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
          <span class="hamburger-box"><span class="hamburger-inner"></span></span>
        </button>
      </div>
    </div>
  </div>
</header>
<div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>`;
};

/* ---------- footer ---------- */

export const footer = () => {
  const footerSocials = getActiveSocials('footer');
  return `
<footer class="site-footer">
  <div class="footer-pattern" aria-hidden="true">${iconSize('shield')}${iconSize('network')}${iconSize('camera')}${iconSize('fingerprint')}</div>

  <!-- Location Map Section -->
  <div class="footer-map-section">
    <div class="container">
      <div class="footer-map-card reveal">
        <div class="footer-map-info">
          <div class="footer-map-badge">${icon('map-pin')} <span>Our Location</span></div>
          <h2 class="footer-map-title">Visit Our Experience Center</h2>
          <p class="footer-map-lead">Headquartered in Chennai — proudly delivering certified CCTV, security, and enterprise networking engineering all over Tamil Nadu.</p>
          <address class="footer-map-address">
            <strong>${esc(site.businessName)}</strong><br>
            ${site.address.line1 ? `${site.address.line1}<br>` : ''}
            ${site.address.line2 ? `${site.address.line2}<br>` : ''}
            ${site.address.line3 ? `${site.address.line3}<br>` : ''}
            ${site.address.line4 ? `${site.address.line4}` : ''}
          </address>
          <div class="footer-map-meta">
            <span class="footer-map-hours">${icon('clock')} <span>${esc(site.businessHours)}</span></span>
          </div>
          <div class="footer-map-actions">
            <a href="${esc(site.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm footer-map-btn" data-track="footer_map_directions">
              <span>Get Directions</span>
              ${icon('external')}
            </a>
            <a href="/request-site-visit.html" class="btn btn--outline-light btn--sm footer-map-visit" data-track="footer_map_site_visit">
              ${icon('calendar')}<span>Request Site Visit</span>
            </a>
          </div>
        </div>
        <div class="footer-map-frame-wrap">
          <iframe
            class="footer-map-iframe"
            title="Keerthi Networks and Security Solution Office Location Map"
            src="https://maps.google.com/maps?q=13.0827,80.2707&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        ${logo()}
        <p class="footer-about">${esc(site.footerAbout)}</p>
        <p class="footer-gst"><span>GSTIN</span> ${esc(site.gstin)}</p>
        ${footerSocials ? `<div class="footer-socials" aria-label="Social media profiles">${footerSocials}</div>` : ''}
        <div class="footer-badge-row">
          <span class="footer-badge">${icon('shield-check')} Security Solutions</span>
          <span class="footer-badge">${icon('network')} Networking</span>
          <span class="footer-badge">${icon('fire')} Fire Safety</span>
        </div>
      </div>
      <nav class="footer-col" aria-label="Company">
        <h3>Company</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about-us.html">About Us</a></li>
          <li><a href="/industries.html">Industries</a></li>
          <li><a href="/projects.html">Projects</a></li>
          <li><a href="/why-choose-us.html">Why Choose Us</a></li>
          <li><a href="/faq.html">FAQ</a></li>
          <li><a href="/contact-us.html">Contact Us</a></li>
        </ul>
      </nav>
      <nav class="footer-col" aria-label="Solutions">
        <h3>Solutions</h3>
        <ul>
          ${site.solutionOrder.map((s) => `<li><a href="/solutions/${s}.html">${esc(SOLUTION_NAMES[s])}</a></li>`).join('')}
        </ul>
      </nav>
      <div class="footer-col footer-contact">
        <h3>Contact</h3>
        <ul>
          ${site.phoneHref ? `<li><a href="${site.phoneHref}" data-track="phone_click">${icon('phone-call')}<span lang="en">${esc(phoneDisplay)}</span></a></li>` : `<li><span class="footer-muted">${icon('phone-call')}<span>Phone: available shortly — please use WhatsApp or email</span></span></li>`}
          <li><a href="mailto:${esc(site.email)}">${icon('mail')}<span lang="en">${esc(site.email)}</span></a></li>
          <li><a href="https://wa.me/${esc(site.whatsapp)}" target="_blank" rel="noopener noreferrer" data-wa data-track="whatsapp_click">${WHATSAPP_ICON}<span>Chat on WhatsApp</span></a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p class="footer-copy">© <span id="year"></span> ${esc(site.businessName)}. All Rights Reserved.</p>
      <p class="footer-powered">Powered By <a href="https://billionbiz.in" target="_blank" rel="noopener noreferrer">BillionBiz</a></p>
      <ul class="footer-legal">
        <li><a href="/privacy-policy.html">Privacy Policy</a></li>
        <li><a href="/terms-and-conditions.html">Terms &amp; Conditions</a></li>
        <li><a href="/disclaimer.html">Disclaimer</a></li>
        <li><a href="/sitemap.xml">Sitemap</a></li>
      </ul>
    </div>
  </div>
</footer>`;
};

/* ---------- floating system ---------- */

export const floats = () => `
<a href="#" class="floating-whatsapp" id="floatingWhatsApp" data-wa aria-label="Chat with ${esc(site.businessName)} on WhatsApp" data-track="whatsapp_click">
  ${WHATSAPP_ICON}
  <span class="floating-whatsapp-tooltip" role="tooltip">Need help? Chat with us on WhatsApp</span>
</a>
<button type="button" class="back-to-top" id="backToTop" aria-label="Back to top" hidden>${icon('chevron-up')}</button>
<nav class="mobile-cta-bar" id="mobileCtaBar" aria-label="Quick actions">
  ${site.phoneHref
    ? `<a class="mcb-item" data-tel href="${site.phoneHref}" data-track="phone_click">${icon('phone-call')}<span>Call</span></a>`
    : `<a class="mcb-item mcb-item--disabled" data-call-unconfigured href="#" role="button" aria-disabled="true">${icon('phone-call')}<span>Call</span></a>`}
  <a class="mcb-item mcb-item--wa" href="#" data-wa data-track="whatsapp_click">${WHATSAPP_ICON}<span>WhatsApp</span></a>
  <a class="mcb-item mcb-item--quote" href="/request-a-quote.html" data-track="quote_click">${icon('doc')}<span>Get Quote</span></a>
</nav>
<div class="toast-region" id="toastRegion" aria-live="polite" aria-atomic="false"></div>`;

/* ---------- page shell ---------- */

const ORG_ID = url('/#organization');

export const orgJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: site.businessName,
  alternateName: 'KNSS',
  description: 'Security, surveillance, communication and networking solutions provider offering CCTV, intercom, networking, biometric access control and fire safety solutions.',
  url: url('/'),
  email: site.email,
  ...(site.phoneDisplay ? { telephone: site.phoneDisplay } : {}),
  image: url('/assets/images/og-bg.jpg'),
  logo: url('/assets/icons/icon-512.png'),
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Chennai',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    postalCode: '600001',
    addressCountry: 'IN'
  },
  areaServed: [
    { '@type': 'City', name: 'Chennai' },
    { '@type': 'State', name: 'Tamil Nadu' },
    { '@type': 'Country', name: 'India' }
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:30'
    }
  ],
  knowsAbout: ['CCTV Surveillance', 'Intercom Systems', 'Computer Networking', 'Biometric Attendance', 'Access Control', 'Fire Safety Equipment'],
  ...(site.socialLinks && site.socialLinks.whatsapp ? { sameAs: [site.socialLinks.whatsapp] } : {})
});

const breadcrumbJsonLd = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    ...(c.href ? { item: url(c.href) } : {})
  }))
});

const faqJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
});

export const breadcrumbs = (crumbs) => `
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <div class="container">
    <ol class="breadcrumbs-list">
      <li><a href="/"><span aria-hidden="true">⌂</span> Home</a><span class="bc-sep" aria-hidden="true">›</span></li>
      ${crumbs.map((c, i) => {
  const last = i === crumbs.length - 1;
  return `<li ${last ? 'aria-current="page"' : ''}>${c.href && !last ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`}${last ? '' : '<span class="bc-sep" aria-hidden="true">›</span>'}</li>`;
}).join('')}
    </ol>
  </div>
</nav>`;

const jsonLdTag = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

/* WebPage schema for individual pages */
const webPageJsonLd = ({ canonicalUrl, title, description, dateModified }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': canonicalUrl + '#webpage',
  url: canonicalUrl,
  name: title,
  description: description,
  inLanguage: 'en-IN',
  isPartOf: { '@id': url('/#website') },
  about: { '@id': ORG_ID },
  dateModified: dateModified || new Date().toISOString().slice(0, 10)
});

export function page({
  path,
  title,
  description,
  content,
  crumbs = null,
  activeId = '',
  bodyClass = '',
  pageType = 'page',
  waProduct = '',
  extraJsonLd = [],
  ogImage = '/assets/images/og-bg.jpg',
  robotsMeta = 'index, follow, max-image-preview:large'
}) {
  const wpLd = webPageJsonLd({ canonicalUrl: url(path), title, description });
  const ld = [orgJsonLd(), wpLd, ...(crumbs ? [breadcrumbJsonLd(crumbs)] : []), ...extraJsonLd];
  const ogImg = url(ogImage);
  const canonical = url(path);
  /* hreflang: EN canonical + TA via ?lang=ta query parameter */
  const taUrl = canonical + (canonical.includes('?') ? '&' : '?') + 'lang=ta';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="${esc(robotsMeta)}">
  <link rel="alternate" hreflang="en-IN" href="${canonical}">
  <link rel="alternate" hreflang="ta-IN" href="${taUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <meta name="theme-color" content="#0B1F3A">
  <meta name="author" content="${esc(site.businessName)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.businessName)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_IN">
  <meta property="og:locale:alternate" content="ta_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImg}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/icons/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Michroma&family=Orbitron:wght@700;800;900&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Michroma&family=Orbitron:wght@700;800;900&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap"></noscript>
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
  <link rel="stylesheet" href="/assets/css/responsive.css">
  <script>document.documentElement.classList.add('js');try{var _p=new URLSearchParams(window.location.search).get('lang');if(_p==='ta'||(!_p&&localStorage.getItem('knss-lang')==='ta')){document.documentElement.lang='ta';document.documentElement.classList.add('lang-ta');}}catch(e){}try{if(sessionStorage.getItem('knss_preloaded')){document.documentElement.classList.add('preloader-done');}}catch(e){}</script>
  ${ld.map(jsonLdTag).join('\n  ')}
</head>
<body data-page="${esc(path)}" data-page-type="${esc(pageType)}" ${waProduct ? `data-wa-product="${esc(waProduct)}"` : ''} class="${esc(bodyClass)}">
${preloader()}
${header(activeId)}
<main id="main">
${crumbs ? breadcrumbs(crumbs) : ''}
${content}
</main>
${footer()}
${floats()}
<script src="/assets/js/config.js" defer></script>
<script src="/assets/js/i18n-data.js"></script>
<script src="/assets/js/i18n.js"></script>
<script src="/assets/js/whatsapp.js" defer></script>
<script src="/assets/js/navigation.js" defer></script>
<script src="/assets/js/animations.js" defer></script>
<script src="/assets/js/faq.js" defer></script>
<script src="/assets/js/projects.js" defer></script>
<script src="/assets/js/forms.js" defer></script>
<script src="/assets/js/analytics.js" defer></script>
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

/* solution display names (shared) — raw text; ALWAYS insert via esc() */
export const SOLUTION_NAMES = {
  'cctv-surveillance': 'CCTV Surveillance',
  'intercom-systems': 'Intercom Systems',
  'networking-solutions': 'Networking Solutions',
  'biometric-access-control': 'Biometric & Access Control',
  'fire-safety': 'Fire Safety Solutions'
};

export const solutionDisplayName = (slug) => SOLUTION_NAMES[slug] || slug;
