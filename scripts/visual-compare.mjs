import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:\\Users\\souvi\\.gemini\\antigravity\\brain\\e5f872a3-68d4-4bc1-a32b-b19deac3657d';

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  async function processSite(name, url) {
    console.log(`\nProcessing ${name} at ${url}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // We want to capture frames during initial load/preloader
    // Start navigation
    const navPromise = page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Capture preloader frames every 200ms
    const frameCount = 10;
    for (let i = 0; i < frameCount; i++) {
      try {
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `${name}_preloader_f${i}.png`),
        });
      } catch (e) {
        // ignore if not ready
      }
      await new Promise(r => setTimeout(r, 200));
    }

    await navPromise;

    // Wait for preloader to fully complete and fade away
    console.log(`Waiting for ${name} preloader to disappear...`);
    await new Promise(r => setTimeout(r, 3500));

    // 1. Hero / settled viewport
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}_01_hero.png`) });

    // 2. Scroll to Drop Countdown & Collection Header
    await page.evaluate(() => window.scrollTo({ top: 380, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}_02_drop_and_header.png`) });

    // 3. Scroll to Product Grid
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}_03_products.png`) });

    // 4. Scroll to Pagination & Store Gateway
    await page.evaluate(() => window.scrollTo({ top: 3800, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}_04_pagination_gateway.png`) });

    // 5. Scroll to Referral & Newsletter Sections
    await page.evaluate(() => window.scrollTo({ top: 4600, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}_05_referral_newsletter.png`) });

    // 6. Scroll to bottom / footer
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}_06_footer.png`) });

    // 6. Inspect key design tokens & DOM properties
    const siteData = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const h1 = document.querySelector('h1') || document.querySelector('h2');
      const h1Style = h1 ? window.getComputedStyle(h1) : null;
      const cards = Array.from(document.querySelectorAll('a[href^="/product/"]'));
      const header = document.querySelector('header') || document.querySelector('nav');
      
      return {
        title: document.title,
        bodyBg: bodyStyle.backgroundColor,
        bodyColor: bodyStyle.color,
        bodyFont: bodyStyle.fontFamily,
        h1Font: h1Style?.fontFamily,
        h1Size: h1Style?.fontSize,
        h1Weight: h1Style?.fontWeight,
        h1Tracking: h1Style?.letterSpacing,
        productCount: cards.length,
        headerHtml: header?.outerHTML?.slice(0, 500),
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${name}_data.json`),
      JSON.stringify(siteData, null, 2)
    );

    await page.close();
    console.log(`Done processing ${name}.`);
  }

  try {
    // await processSite('outfit_live', 'https://outfit.hellohello.is/');
    await processSite('ctrl_local', 'http://localhost:3000/');
    console.log('\nAll captures successfully generated!');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

capture();
