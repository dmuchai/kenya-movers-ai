/**
 * Simple screenshot capture using Playwright with visible browser
 * Specifically designed for Play Store submission requirements
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_URL = 'http://localhost:8081';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'play-store-assets', 'screenshots');

// Mobile viewport for Play Store screenshots
const MOBILE_VIEWPORT = {
  width: 360,
  height: 640
};

async function capturePlayStoreScreenshots() {
  console.log('📱 Starting Play Store screenshot capture...');
  
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false, // Keep browser visible
    slowMo: 1000 // Slow down for better capture
  });
  
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 3, // High resolution
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  try {
    console.log('🌐 Loading app...');
    await page.goto(APP_URL, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Wait for page to fully render
    await page.waitForTimeout(2000);

    // Screenshot 1: Main landing page
    console.log('📸 Capturing: Landing page');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'playstore-01-landing.png'),
      quality: 90
    });

    // Try to show quote form
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(1000);

    // Screenshot 2: Quote form section
    console.log('📸 Capturing: Quote form');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'playstore-02-quote-form.png'),
      quality: 90
    });

    console.log('✅ Screenshots captured successfully!');
    
    // Keep browser open for manual review
    console.log('📋 Please review the screenshots and then close the browser window.');
    console.log('💡 Screenshots saved to:', SCREENSHOTS_DIR);
    
    // Wait for user to close browser manually
    await page.waitForEvent('close', { timeout: 0 }).catch(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    try {
      await browser.close();
    } catch (e) {
      // Browser might already be closed
    }
  }
}

capturePlayStoreScreenshots().catch(console.error);