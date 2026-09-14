import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/souvi/.gemini/antigravity/brain/e5f872a3-68d4-4bc1-a32b-b19deac3657d';

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function createTarget(url = 'about:blank') {
  const res = await fetch(`http://localhost:9222/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return await res.json();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureSite(name, targetUrl, preloaderFrames = 8) {
  console.log(`Starting capture for ${name} (${targetUrl})...`);
  const target = await createTarget();
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Navigate
  await cdp.send('Page.navigate', { url: targetUrl });

  // Record preloader frame-by-frame
  console.log(`Capturing preloader frames for ${name}...`);
  for (let i = 0; i < preloaderFrames; i++) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}_preloader_f${i}.png`), buffer);
    await sleep(350);
  }

  // Wait for preloader to finish and content to settle
  console.log(`Waiting for ${name} preloader to conclude...`);
  await sleep(3500);

  // Capture Hero / Top
  const heroShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}_hero.png`), Buffer.from(heroShot.data, 'base64'));

  // Scroll down to section 1
  await cdp.send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 850, behavior: "instant" })',
  });
  await sleep(800);
  const sec1Shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}_section1.png`), Buffer.from(sec1Shot.data, 'base64'));

  // Scroll down to scatter section
  await cdp.send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 1800, behavior: "instant" })',
  });
  await sleep(800);
  const scatterShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}_scatter.png`), Buffer.from(scatterShot.data, 'base64'));

  // Scroll down to footer
  await cdp.send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })',
  });
  await sleep(800);
  const footerShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}_footer.png`), Buffer.from(footerShot.data, 'base64'));

  // Test product hover: scroll back to top of products, find first product card, trigger hover
  await cdp.send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 900, behavior: "instant" })',
  });
  await sleep(600);

  // Get first product card position
  const cardRectRes = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.querySelector('a[href^="/product/"]') || document.querySelector('[data-product-card]');
        if (!card) return null;
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()
    `,
    returnByValue: true,
  });

  if (cardRectRes.result?.value) {
    const { x, y } = cardRectRes.result.value;
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(x),
      y: Math.round(y),
    });
    await sleep(600);
    const hoverShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}_hover.png`), Buffer.from(hoverShot.data, 'base64'));
  }

  // Extract key computed styles & DOM metadata
  const metaRes = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const bodyStyle = window.getComputedStyle(document.body);
        const heroTitle = document.querySelector('h1') || document.querySelector('main h1');
        const heroStyle = heroTitle ? window.getComputedStyle(heroTitle) : null;
        const cards = Array.from(document.querySelectorAll('a[href^="/product/"]'));
        const nav = document.querySelector('nav') || document.querySelector('header');
        
        return {
          title: document.title,
          bodyBg: bodyStyle.backgroundColor,
          bodyColor: bodyStyle.color,
          fontFamily: bodyStyle.fontFamily,
          heroFontFamily: heroStyle ? heroStyle.fontFamily : null,
          heroFontSize: heroStyle ? heroStyle.fontSize : null,
          heroFontWeight: heroStyle ? heroStyle.fontWeight : null,
          heroTracking: heroStyle ? heroStyle.letterSpacing : null,
          productCount: cards.length,
          navText: nav ? nav.innerText.replace(/\\s+/g, ' ').trim() : null,
        };
      })()
    `,
    returnByValue: true,
  });

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, `${name}_meta.json`),
    JSON.stringify(metaRes.result?.value, null, 2)
  );

  cdp.close();
  await fetch(`http://localhost:9222/json/close/${target.id}`);
  console.log(`Finished capture for ${name}`);
}

async function run() {
  try {
    await captureSite('live', 'https://outfit.hellohello.is/', 8);
    await captureSite('local', 'http://localhost:3000/', 8);
    console.log('All captures complete!');
  } catch (err) {
    console.error('Error during capture:', err);
  }
}

run();
