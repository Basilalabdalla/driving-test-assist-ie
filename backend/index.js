require('dotenv').config(); // Loads secrets from .env
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin()); // Makes Puppeteer look like real Chrome

const app = express();
const port = 3000;

// Basic route to check if server is alive
app.get('/', (req, res) => {
  res.send('Driving Test Assist IE Backend is running!');
});

// Function to launch stealth browser
async function launchBrowser() {
  return await puppeteer.launch({
    headless: true,              // true = no visible window (change to false for debugging)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ],
    defaultViewport: { width: 1920, height: 1080 }
  });
}

// Example: Simple test route to check if we can open RSA login page
app.get('/test-rsa', async (req, res) => {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Add random delay to look human
    await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000)); // 1-3 seconds

    await page.goto('https://www.rsa.ie/my-road-safety', { waitUntil: 'networkidle2' });

    // Take screenshot for debugging (saved to backend folder)
    await page.screenshot({ path: 'rsa-homepage.png', fullPage: true });

    res.send('Successfully loaded RSA page! Check rsa-homepage.png in backend folder.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});