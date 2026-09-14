import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectOutfit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('https://outfit.hellohello.is/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000)); // wait for loader to fully clear

  const details = await page.evaluate(() => {
    function cleanHtml(el) {
      if (!el) return '';
      const clone = el.cloneNode(true);
      clone.querySelectorAll('path').forEach(p => {
        p.setAttribute('d', '...');
      });
      return clone.outerHTML;
    }

    const main = document.querySelector('main');
    const sections = Array.from(main ? main.children : []).map(c => ({
      tag: c.tagName,
      id: c.id,
      classes: c.className,
      text: c.innerText,
      html: cleanHtml(c),
    }));

    return {
      header: cleanHtml(document.querySelector('#header') || document.querySelector('nav')),
      sections,
    };
  });

  fs.writeFileSync('C:/Users/souvi/.gemini/antigravity/brain/e5f872a3-68d4-4bc1-a32b-b19deac3657d/outfit_dom_full.json', JSON.stringify(details, null, 2));
  console.log('Inspection saved to outfit_dom_full.json!');

  await browser.close();
}

inspectOutfit();
