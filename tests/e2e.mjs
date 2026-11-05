// בדיקת Playwright מקצה לקצה: בית, בחירת משימה, ציור אמיתי בעכבר, גילוי, יומן ושיטה, ונייד.
// הרצה: npm run build && npx vite preview --port 4173 &  ואז  AI_MENU_JS=<נתיב ל-ai-menu.js> node tests/e2e.mjs
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const SHOTS = process.env.SHOTS ?? 'test-results'
fs.mkdirSync(SHOTS, { recursive: true })
let fails = 0
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fails++ }

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
if (process.env.AI_MENU_JS) await ctx.route('**/ai-menu.js', (r) => r.fulfill({ path: process.env.AI_MENU_JS, contentType: 'text/javascript' }))
await ctx.route('**/fonts.g*/**', (r) => r.abort())
await ctx.route('**/functions/v1/**', (r) => r.abort())

await page.goto(BASE)
ok(await page.locator('html[dir=rtl]').count() === 1, 'RTL on html')
ok(await page.getByText('שלושה גילויים').isVisible(), 'home insight line')
if (process.env.AI_MENU_JS) ok(await page.locator('ai-menu .logo').isVisible(), 'A&I logo button in the top bar')
ok(!(await page.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), 'no loose development buttons in the bar')
ok(await page.locator('[data-testid=window]').isVisible(), 'experiential window object')
await page.waitForTimeout(4500)
await page.screenshot({ path: `${SHOTS}/1-home.png` })

await page.getByTestId('start').click()
await page.getByTestId('directive-tree').waitFor()
ok(await page.locator('[data-testid^=directive-]').count() === 6, 'six directives')
await page.screenshot({ path: `${SHOTS}/2-pick.png` })
await page.getByTestId('directive-tree').click()

const sheet = page.getByTestId('sheet')
await sheet.waitFor()
const box = await sheet.boundingBox()
const P = (x, y) => [box.x + box.width * x, box.y + box.height * y]
async function stroke(pts, steps = 30) {
  await page.mouse.move(...P(...pts[0]))
  await page.mouse.down()
  for (let i = 1; i < pts.length; i++) await page.mouse.move(...P(...pts[i]), { steps })
  await page.mouse.up()
}
await page.waitForTimeout(2500) // השהיה לפני הקו הראשון
await stroke([[0.5, 0.92], [0.5, 0.45]], 20) // גזע
await page.locator('.swatch').nth(6).click()
await page.getByRole('button', { name: 'רחב' }).click()
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2
  await stroke([[0.5, 0.35], [0.5 + Math.cos(a) * 0.2, 0.35 + Math.sin(a) * 0.2]], 10)
}
await page.getByRole('button', { name: 'צבע רטוב' }).click()
await page.locator('.swatch').nth(4).click()
await stroke([[0.15, 0.15], [0.25, 0.12], [0.2, 0.22]], 15) // שמש
await page.getByRole('button', { name: 'מחק' }).click()
await stroke([[0.5, 0.9], [0.52, 0.88]], 4)
await page.getByRole('button', { name: 'פחם' }).click()
await page.locator('.swatch').nth(1).click()
await stroke([[0.1, 0.94], [0.9, 0.94]], 25) // קרקע
await page.screenshot({ path: `${SHOTS}/3-studio.png` })
await page.getByTestId('finish').click()

await page.waitForURL(/\/reveal\//)
await page.getByTestId('insight').waitFor()
ok((await page.getByTestId('insight').innerText()).length > 3, 'insight line rendered')
ok(await page.getByTestId('card-strength').isVisible(), 'strength card')
ok(await page.getByTestId('card-shadow').isVisible(), 'shadow card')
const scales = await page.locator('.rv-scale').count()
ok(scales >= 11, `measure scales (${scales})`)
await page.getByTestId('card-strength').getByRole('button', { name: 'מדבר אליי' }).click()
await page.waitForTimeout(1200)
await page.screenshot({ path: `${SHOTS}/4-reveal.png`, fullPage: true })
const strengthName = await page.locator('[data-testid=card-strength] .rv-title').innerText()
console.log('revealed strength:', strengthName)

await page.goto(`${BASE}/journal`)
ok(await page.locator('.jr-item').count() === 1, 'journal holds the drawing')
ok((await page.locator('.jr-stat .big-num').nth(2).innerText()).includes('100%'), 'resonance rate computed')
await page.screenshot({ path: `${SHOTS}/5-journal.png` })

await page.goto(`${BASE}/method`)
ok(await page.locator('.mt-table tbody tr').count() === 12, 'twelve rules in method table')
await page.screenshot({ path: `${SHOTS}/6-method.png`, fullPage: true })

const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
if (process.env.AI_MENU_JS) await m.route('**/ai-menu.js', (r) => r.fulfill({ path: process.env.AI_MENU_JS, contentType: 'text/javascript' }))
await m.route('**/fonts.g*/**', (r) => r.abort())
const mp = await m.newPage()
for (const path of ['/', '/draw', '/draw?d=bridge', '/method']) {
  await mp.goto(BASE + path)
  await mp.waitForTimeout(400)
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ok(overflow <= 0, `mobile ${path}: no horizontal scroll (${overflow})`)
}
await mp.goto(BASE + '/')
await mp.waitForTimeout(4000)
await mp.screenshot({ path: `${SHOTS}/7-mobile-home.png`, fullPage: true })
await mp.goto(BASE + '/draw?d=bridge')
await mp.screenshot({ path: `${SHOTS}/8-mobile-studio.png` })

ok(errors.length === 0, `no page errors ${errors.join(' | ')}`)
await browser.close()
console.log(fails ? `${fails} FAILED` : 'ALL GREEN')
process.exit(fails ? 1 : 0)
