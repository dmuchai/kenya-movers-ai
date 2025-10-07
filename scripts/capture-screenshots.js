/**
 * Playwright script to capture Play Store screenshots for MoveEasy app
 * Generates mobile-optimized screenshots demonstrating key app features
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_URL = 'http://localhost:8081';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'play-store-assets', 'screenshots');

// Mobile device dimensions for Play Store (recommended: 1080x1920 or similar 16:9 ratio)
const MOBILE_VIEWPORT = {
  width: 1080,
  height: 1920
};

async function captureScreenshots() {
  console.log('🚀 Starting Play Store screenshot capture...');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log(`📁 Created directory: ${SCREENSHOTS_DIR}`);
  }

  // Launch browser with mobile settings
  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 2, // High DPI for crisp screenshots
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log(`🌐 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    
    // Wait for app to load completely
    await page.waitForTimeout(3000);

    // Screenshot 1: Landing page with hero section
    console.log('📸 Capturing Screenshot 1: Landing page with quote form...');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-landing-hero.png'),
      fullPage: false, // Capture visible viewport only
      quality: 100
    });

    // Scroll down a bit to show the quote form
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1000);

    // Screenshot 2: Quote form in action
    console.log('📸 Capturing Screenshot 2: Quote form section...');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-quote-form.png'),
      fullPage: false,
      quality: 100
    });

    // Try to interact with the form to show functionality
    try {
      // Fill in some sample data to show the form in use
      const fromInput = await page.$('input[placeholder*="From"]');
      if (fromInput) {
        await fromInput.fill('Nairobi, Kenya');
        await page.waitForTimeout(500);
      }

      const toInput = await page.$('input[placeholder*="To"]');
      if (toInput) {
        await toInput.fill('Mombasa, Kenya');
        await page.waitForTimeout(500);
      }

      // Screenshot 3: Form with filled data
      console.log('📸 Capturing Screenshot 3: Filled quote form...');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '03-form-filled.png'),
        fullPage: false,
        quality: 100
      });

    } catch (error) {
      console.log('⚠️  Could not interact with form elements, capturing static form instead');
    }

    // Scroll down to show more content/features
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(1000);

    // Screenshot 4: Features or additional content
    console.log('📸 Capturing Screenshot 4: App features section...');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-features.png'),
      fullPage: false,
      quality: 100
    });

    // If there are navigation elements, try to capture different pages
    try {
      // Look for navigation or other page links
      const navLinks = await page.$$('nav a, .navigation a, [role="navigation"] a');
      
      if (navLinks.length > 0) {
        // Try to navigate to another page
        await navLinks[0].click();
        await page.waitForTimeout(2000);
        
        // Screenshot 5: Different page/section
        console.log('📸 Capturing Screenshot 5: Secondary page...');
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '05-secondary-page.png'),
          fullPage: false,
          quality: 100
        });
      }
    } catch (error) {
      console.log('⚠️  Could not navigate to secondary pages, using current view');
    }

    console.log('✅ Screenshot capture completed successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
    // List captured files
    const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
    console.log('\n📸 Captured screenshots:');
    files.forEach((file, index) => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${index + 1}. ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });

    console.log('\n🎯 Next steps:');
    console.log('1. Review screenshots in the play-store-assets/screenshots/ directory');
    console.log('2. Select the best 2-8 screenshots for Play Store submission');
    console.log('3. Upload to Google Play Console in the "Store listing" section');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Self-executing function with error handling
(async () => {
  try {
    await captureScreenshots();
    process.exit(0);
  } catch (error) {
    console.error('💥 Screenshot capture failed:', error.message);
    process.exit(1);
  }
})();