#!/usr/bin/env node

/**
 * Automated Screenshot Generator for MoveEasy App
 * Captures key screens for Play Store submission
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Screenshot configuration
const SCREENSHOTS_DIR = './play-store-screenshots';
const APP_URL = 'http://localhost:8080';

// Device configurations for different screenshot types
const DEVICES = {
  phone: {
    name: 'phone',
    viewport: { width: 393, height: 851 }, // Pixel 5 size
    deviceScaleFactor: 2.75,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36'
  },
  tablet: {
    name: 'tablet', 
    viewport: { width: 820, height: 1180 }, // iPad Air size
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  }
};

// Screenshot scenarios
const SCREENSHOTS = [
  {
    name: '01-hero-landing',
    description: 'Hero/Landing Screen',
    path: '/',
    waitFor: 'networkidle',
    actions: []
  },
  {
    name: '02-quote-form-step1',
    description: 'Quote Form - Moving Details',
    path: '/',
    waitFor: 'networkidle',
    actions: [
      { type: 'scroll', selector: '#quote-form' }
    ]
  },
  {
    name: '03-quote-form-filled',
    description: 'Quote Form - Filled Example',
    path: '/',
    waitFor: 'networkidle',
    actions: [
      { type: 'scroll', selector: '#quote-form' },
      { type: 'fill', selector: 'input[placeholder*="pickup"], input[placeholder*="from"]', value: 'Nairobi CBD, Kenya' },
      { type: 'fill', selector: 'input[placeholder*="destination"], input[placeholder*="to"]', value: 'Mombasa, Kenya' },
      { type: 'select', selector: 'select', value: '3' },
      { type: 'wait', duration: 1000 }
    ]
  },
  {
    name: '04-contact-form',
    description: 'Contact Information Form',
    path: '/',
    waitFor: 'networkidle', 
    actions: [
      { type: 'scroll', selector: '#quote-form' },
      { type: 'fill', selector: 'input[placeholder*="pickup"], input[placeholder*="from"]', value: 'Nairobi CBD, Kenya' },
      { type: 'fill', selector: 'input[placeholder*="destination"], input[placeholder*="to"]', value: 'Mombasa, Kenya' },
      { type: 'click', selector: 'button[type="submit"], .quote-button' },
      { type: 'wait', duration: 2000 }
    ]
  },
  {
    name: '05-quote-results',
    description: 'Quote Results Display',
    path: '/',
    waitFor: 'networkidle',
    actions: [
      { type: 'scroll', selector: '#quote-form' },
      { type: 'fill', selector: 'input[placeholder*="pickup"], input[placeholder*="from"]', value: 'Nairobi CBD, Kenya' },
      { type: 'fill', selector: 'input[placeholder*="destination"], input[placeholder*="to"]', value: 'Mombasa, Kenya' },
      { type: 'click', selector: 'button[type="submit"], .quote-button' },
      { type: 'wait', duration: 3000 },
      { type: 'fill', selector: 'input[placeholder*="name"], input[type="text"]', value: 'John Doe' },
      { type: 'fill', selector: 'input[placeholder*="email"], input[type="email"]', value: 'john@example.com' },
      { type: 'fill', selector: 'input[placeholder*="phone"], input[type="tel"]', value: '+254712345678' },
      { type: 'click', selector: 'button[type="submit"]' },
      { type: 'wait', duration: 5000 }
    ]
  }
];

async function createScreenshotsDirectory() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function takeScreenshot(browser, device, screenshot) {
  console.log(`📱 Taking ${device.name} screenshot: ${screenshot.description}`);
  
  const context = await browser.newContext({
    ...device,
    viewport: device.viewport
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the page
    await page.goto(`${APP_URL}${screenshot.path}`, { 
      waitUntil: screenshot.waitFor || 'networkidle',
      timeout: 30000 
    });
    
    // Perform actions
    for (const action of screenshot.actions) {
      switch (action.type) {
        case 'fill':
          await page.fill(action.selector, action.value);
          break;
        case 'click':
          await page.click(action.selector);
          break;
        case 'select':
          await page.selectOption(action.selector, action.value);
          break;
        case 'scroll':
          await page.locator(action.selector).scrollIntoViewIfNeeded();
          break;
        case 'wait':
          await page.waitForTimeout(action.duration);
          break;
      }
      // Small delay between actions
      await page.waitForTimeout(500);
    }
    
    // Take screenshot
    const filename = `${screenshot.name}-${device.name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    await page.screenshot({
      path: filepath,
      fullPage: false,
      type: 'png'
    });
    
    console.log(`✅ Saved: ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error taking screenshot ${screenshot.name} for ${device.name}:`, error.message);
  } finally {
    await context.close();
  }
}

async function generateScreenshots() {
  console.log('🚀 Starting automated screenshot generation...');
  console.log(`📂 Screenshots will be saved to: ${SCREENSHOTS_DIR}`);
  
  await createScreenshotsDirectory();
  
  const browser = await chromium.launch({ 
    headless: false, // Set to true for faster execution
    slowMo: 100 // Slow down for debugging
  });
  
  try {
    // Generate screenshots for each device
    for (const [deviceName, deviceConfig] of Object.entries(DEVICES)) {
      console.log(`\n📱 Generating ${deviceName} screenshots...`);
      
      for (const screenshot of SCREENSHOTS) {
        await takeScreenshot(browser, deviceConfig, screenshot);
      }
    }
    
    console.log('\n🎉 Screenshot generation complete!');
    console.log(`\n📁 Check the screenshots in: ${SCREENSHOTS_DIR}`);
    console.log('\n📋 Next steps:');
    console.log('1. Review screenshots for quality');
    console.log('2. Edit/enhance if needed');
    console.log('3. Upload to Google Play Console');
    
  } catch (error) {
    console.error('❌ Error during screenshot generation:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot generator
if (require.main === module) {
  generateScreenshots().catch(console.error);
}

module.exports = { generateScreenshots };