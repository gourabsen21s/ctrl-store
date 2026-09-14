import fs from 'fs';
import path from 'path';

const base = 'https://outfit.hellohello.is/_next/static/media/';
const fonts = [
  'NeueHaasGroteskTextPro-s.p.3b8d8eef.woff2',
  'NeueHaasGroteskTextPro_Medium-s.p.26ed73d7.woff2',
  'NeueHaasGroteskTextPro_Bold-s.p.d9a7309d.woff2',
];

async function run() {
  const dir = path.join(process.cwd(), 'public', 'fonts');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const f of fonts) {
    const url = base + f;
    console.log('Fetching', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to fetch', f, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(dir, f), buf);
    console.log('Saved', f, buf.length, 'bytes');
  }
}

run();
