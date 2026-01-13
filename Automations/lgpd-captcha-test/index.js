const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true if you don't want to see the browser
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to LGPD captcha page...');

  // You can switch between local mockup and production URL
  const localUrl = 'http://localhost:8080/index.html';
  const productionUrl = 'https://www.superleme.com.br/aceite/lgpd/SWCIP9yZlBk2vbKT6tFoYkezJBK48HkvzCPhCFqljp_98gqmg2IAAAFC';

  // Use local mockup by default, change to productionUrl to test in production
  const url = localUrl;

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('Page loaded successfully!');
    console.log('Page title:', await page.title());

    // Keep the browser open for manual testing
    console.log('\nBrowser will stay open for testing. Press Ctrl+C to close.');

    // Uncomment the line below if you want the browser to close automatically
    // await browser.close();

  } catch (error) {
    console.error('Error loading page:', error.message);
    await browser.close();
  }
})();
