import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:/Users/souvi/.gemini/antigravity/brain/e5f872a3-68d4-4bc1-a32b-b19deac3657d';

async function testPdp() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/product/heavy-tee-black', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: path.join(OUTPUT_DIR, 'ctrl_pdp_clean.png') });
  console.log('PDP screenshot captured!');
  await browser.close();
}

testPdp();
