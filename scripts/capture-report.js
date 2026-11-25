import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outputDir = path.resolve(projectRoot, 'screenshots-report')

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5173'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function clickButtonWithText(page, text) {
  const buttons = await page.$$('button')
  for (const btn of buttons) {
    const t = await page.evaluate((el) => el.innerText.trim(), btn)
    if (t.includes(text)) {
      await btn.click()
      return true
    }
  }
  return false
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const shot = async (name) => {
    await page.screenshot({ path: path.join(outputDir, name), fullPage: false })
    console.log('✓ Saved', name)
  }

  try {
    // ── 1. Dashboard ────────────────────────────────────────────
    console.log('[1/8] 01-dashboard.png')
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(1500)
    await shot('01-dashboard.png')

    // ── 2. Products list ────────────────────────────────────────
    console.log('[2/8] 02-products-list.png')
    await page.goto(`${BASE}/products`, { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(1200)
    await shot('02-products-list.png')

    // ── 3. Product search / filter ──────────────────────────────
    console.log('[3/8] 03-product-search-filter.png')
    await clickButtonWithText(page, 'Linh kiện PC')
    await sleep(400)
    const searchInput = await page.$('input[placeholder*="Tìm kiếm"]')
    if (searchInput) await searchInput.type('RTX', { delay: 60 })
    await sleep(900)
    await shot('03-product-search-filter.png')

    // ── 4. Stock-In form open ───────────────────────────────────
    console.log('[4/8] 04-stock-in-create.png')
    await page.goto(`${BASE}/stock-in`, { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(800)
    await clickButtonWithText(page, 'Lập phiếu nhập kho')
    await sleep(700)
    const noteIn = await page.$('input[placeholder*="khuyến mãi"]')
    if (noteIn) await noteIn.type('Nhập bổ sung linh kiện theo kế hoạch tuần 4', { delay: 30 })
    await sleep(600)
    await shot('04-stock-in-create.png')

    // ── 5. Stock-In saved ───────────────────────────────────────
    console.log('[5/8] 05-stock-in-saved.png')
    const submitIn = await page.$('button[type="submit"]')
    if (submitIn) await submitIn.click()
    await sleep(1500)
    await shot('05-stock-in-saved.png')

    // ── 6. Stock-Out validation error ───────────────────────────
    console.log('[6/8] 06-stock-out-validation.png')
    await page.goto(`${BASE}/stock-out`, { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(800)
    await clickButtonWithText(page, 'Lập phiếu xuất kho')
    await sleep(700)
    const qtyInputs = await page.$$('input[type="number"][min="1"]')
    const qtyInput = qtyInputs[0]
    if (qtyInput) {
      await qtyInput.click({ clickCount: 3 })
      await qtyInput.type('9999')
    }
    const submitOut = await page.$('button[type="submit"]')
    if (submitOut) await submitOut.click()
    await sleep(900)
    await shot('06-stock-out-validation.png')

    // ── 7. Stock-Out success ────────────────────────────────────
    console.log('[7/8] 07-stock-out-success.png')
    if (qtyInput) {
      await qtyInput.click({ clickCount: 3 })
      await qtyInput.type('1')
    }
    if (submitOut) await submitOut.click()
    await sleep(1500)
    await shot('07-stock-out-success.png')

    // ── 8. AI Assistant ─────────────────────────────────────────
    console.log('[8/8] 08-ai-assistant.png')
    await page.goto(`${BASE}/ai-assistant`, { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(900)
    await clickButtonWithText(page, 'Mặt hàng nào sắp hết tồn kho?')
    await sleep(1800) // Wait for AI response animation
    await shot('08-ai-assistant.png')

    console.log('\n=== ALL 8 SCREENSHOTS DONE ===')
    console.log('Saved to:', outputDir)

  } finally {
    await browser.close()
  }
}

run().catch((err) => { console.error('FAILED:', err); process.exit(1) })
