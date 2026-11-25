/**
 * capture-tech.js
 * Puppeteer script to capture screenshots 09-12 from HTML mockups.
 * Dragon Vision SmartStock AI – Technical Report Screenshots
 * Run: node scripts/capture-tech.js
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const MOCKUP_DIR = path.resolve(__dirname, 'mockups');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'screenshots-report');
const WIDTH = 1440;
const HEIGHT = 900;

const shots = [
  {
    file: 'mockup-09-code-frontend.html',
    out:  '09-code-frontend-ai.png',
    wait: 1000,
  },
  {
    file: 'mockup-10-code-backend.html',
    out:  '10-code-backend-service.png',
    wait: 1000,
  },
  {
    file: 'mockup-11-database.html',
    out:  '11-database-erd-schema.png',
    wait: 1200,
  },
  {
    file: 'mockup-12-docker.html',
    out:  '12-docker-and-deployment.png',
    wait: 1200,
  },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  for (const shot of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    const fileUrl = 'file:///' + path.join(MOCKUP_DIR, shot.file).replace(/\\/g, '/');
    console.log(`Opening: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await sleep(shot.wait);

    const outPath = path.join(OUTPUT_DIR, shot.out);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✅ Saved: ${outPath}`);

    await page.close();
  }

  await browser.close();
  console.log('\n🎉 All 4 technical screenshots captured successfully!');
})();

