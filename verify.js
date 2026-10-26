const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080'); // http-server default port
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
})();
