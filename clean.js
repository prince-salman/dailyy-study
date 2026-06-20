const fs = require('fs');
const files = [
  'src/app/admin/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/staff/page.tsx',
  'src/app/payment/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/pricing/page.tsx',
  'src/components/PWAInstallPrompt.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/BottomNav.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, '');
  c = c.replace(/^[ \t]*\/\/.*$/gm, '');
  c = c.replace(/\n\s*\n\s*\n/g, '\n\n');
  fs.writeFileSync(f, c.trim() + '\n');
});
