import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:/Users/souvi/.gemini/antigravity/brain/e5f872a3-68d4-4bc1-a32b-b19deac3657d';

async function testHover() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500)); // wait for loader

  // Scroll to products
  await page.evaluate(() => window.scrollTo({ top: 350, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 600));

  // Find first product card link
  const card = await page.$('a[data-product]');
  if (card) {
    const box = await card.boundingBox();
    if (box) {
      // Hover right in center of the image
      await page.mouse.move(box.x + box.width / 2, box.y + 120);
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'ctrl_magnetic_cursor_hover.png') });
      console.log('Hover screenshot captured!');
    }
  }

  await browser.close();
}

testHover();
