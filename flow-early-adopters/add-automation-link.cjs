// Patch the current Hosting HTML without rebuilding or replacing the older app.
const fs = require('node:fs');
const path = process.argv[2];
if (!path) throw new Error('Usage: node add-automation-link.cjs <index.html>');
let html = fs.readFileSync(path, 'utf8');
const href = 'https://flow-automation-intake.mr-pipper33.chatgpt.site/solutions?utm_source=flowearlyadopters&utm_medium=site&utm_campaign=automation-services';
const link = `<a data-flow-automation-link href="${href}">Automation Services</a>`;
if (!html.includes('data-flow-automation-link')) {
  if (html.includes('<nav class="flow-hub-nav"')) {
    html = html.replace(/(<nav class="flow-hub-nav"[^>]*>[\s\S]*?)(<\/nav>)/, `$1  ${link}\n    $2`);
  } else {
    html = html.replace('<body>', `<body>\n    <nav class="flow-hub-nav" aria-label="Flow sites">${link}</nav>`);
  }
}
if (!html.includes('id="flow-automation-nav-style"')) {
  html = html.replace('</head>', `<style id="flow-automation-nav-style">
      .flow-hub-nav { position: fixed; top: 14px; right: 14px; z-index: 12000; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 6px; max-width: calc(100vw - 24px); border: 1px solid rgba(255,255,255,.18); border-radius: 24px; background: rgba(10,10,18,.95); }
      .flow-hub-nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 12px; border-radius: 20px; color: #f8fafc; font: 700 12px/1.3 system-ui,sans-serif; text-decoration: none; }
      .flow-hub-nav a:hover, .flow-hub-nav a:focus-visible { color: #111827; background: #fbbf24; outline: 2px solid #fbbf24; outline-offset: 2px; }
      @media (max-width: 640px) { .flow-hub-nav { top: auto; bottom: 12px; right: 12px; left: 12px; transform: none; } .flow-hub-nav a { padding: 8px 10px; font-size: 11px; } }
    </style>\n  </head>`);
}
if ((html.match(/data-flow-automation-link/g) || []).length !== 1) throw new Error('Expected one automation link');
fs.writeFileSync(path, html);
console.log('Added Automation Services link');
