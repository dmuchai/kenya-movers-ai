#!/usr/bin/env node

/**
 * Automated Screenshot Generator for MoveLink App
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
      { type: 'scrollToElement', selector: '[data-testid="quote-form"], #quote-form, .quote-form' }
    ]
  },
  {
    name: '03-quote-form-filled',
    description: 'Quote Form - Filled Example',
    path: '/',
    waitFor: 'networkidle',
    actions: [
      { type: 'scrollToElement', selector: '[data-testid="quote-form"], #quote-form, .quote-form' },
      { type: 'fillAndWait', selector: '[data-testid="pickup-input"], input[name="pickup"], input[placeholder*="pickup"]', value: 'Nairobi CBD, Kenya' },
      { type: 'fillAndWait', selector: '[data-testid="destination-input"], input[name="destination"], input[placeholder*="destination"]', value: 'Mombasa, Kenya' },
      { type: 'selectAndWait', selector: '[data-testid="property-type"], select[name="propertyType"], select', value: '3' }
    ]
  },
  {
    name: '04-contact-form',
    description: 'Contact Information Form',
    path: '/',
    waitFor: 'networkidle', 
    actions: [
      { type: 'fillQuoteForm', pickup: 'Nairobi CBD, Kenya', destination: 'Mombasa, Kenya' },
      { type: 'clickAndWait', selector: '[data-testid="submit-quote"], button[type="submit"], .quote-button', waitForSelector: '[data-testid="contact-form"], .contact-form, form' }
    ]
  },
  {
    name: '05-quote-results',
    description: 'Quote Results Display',
    path: '/',
    waitFor: 'networkidle',
    actions: [
      { type: 'fillQuoteForm', pickup: 'Nairobi CBD, Kenya', destination: 'Mombasa, Kenya' },
      { type: 'clickAndWait', selector: '[data-testid="submit-quote"], button[type="submit"], .quote-button', waitForSelector: '[data-testid="contact-form"], .contact-form, form' },
      { type: 'fillContactForm', name: 'John Doe', email: 'john@example.com', phone: '+254712345678' },
      { type: 'clickAndWait', selector: '[data-testid="submit-contact"], button[type="submit"]', waitForSelector: '[data-testid="quote-results"], .quote-results, .results' }
    ]
  }
];

// Helper functions for common action sequences
const ActionHelpers = {
  // Fill quote form with pickup and destination
  async fillQuoteForm(page, { pickup, destination }) {
    await this.scrollToElement(page, { selector: '[data-testid="quote-form"], #quote-form, .quote-form' });
    await this.fillAndWait(page, { selector: '[data-testid="pickup-input"], input[name="pickup"], input[placeholder*="pickup"]', value: pickup });
    await this.fillAndWait(page, { selector: '[data-testid="destination-input"], input[name="destination"], input[placeholder*="destination"]', value: destination });
  },

  // Fill contact form with user details
  async fillContactForm(page, { name, email, phone }) {
    await this.fillAndWait(page, { selector: '[data-testid="name-input"], input[name="name"], input[placeholder*="name"]', value: name });
    await this.fillAndWait(page, { selector: '[data-testid="email-input"], input[name="email"], input[type="email"]', value: email });
    await this.fillAndWait(page, { selector: '[data-testid="phone-input"], input[name="phone"], input[type="tel"]', value: phone });
  },

  // Scroll to element with explicit wait
  async scrollToElement(page, { selector }) {
    const element = await page.waitForSelector(selector, { timeout: 10000 });
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // Brief pause for smooth scrolling
  },

  // Fill input with explicit wait for element
  async fillAndWait(page, { selector, value }) {
    const element = await page.waitForSelector(selector, { timeout: 10000 });
    await element.fill(value);
    await page.waitForTimeout(300); // Brief pause for input processing
  },

  // Select option with explicit wait
  async selectAndWait(page, { selector, value }) {
    const element = await page.waitForSelector(selector, { timeout: 10000 });
    await element.selectOption(value);
    await page.waitForTimeout(300); // Brief pause for selection processing
  },

  // Click element and wait for a specific condition
  async clickAndWait(page, { selector, waitForSelector }) {
    const element = await page.waitForSelector(selector, { timeout: 10000 });
    await element.click();
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 15000 });
    }
    await page.waitForTimeout(500); // Brief pause for UI updates
  }
};

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
    
    // Perform actions using helper functions
    for (const action of screenshot.actions) {
      try {
        switch (action.type) {
          case 'fillQuoteForm':
            await ActionHelpers.fillQuoteForm(page, action);
            break;
          case 'fillContactForm':
            await ActionHelpers.fillContactForm(page, action);
            break;
          case 'scrollToElement':
            await ActionHelpers.scrollToElement(page, action);
            break;
          case 'fillAndWait':
            await ActionHelpers.fillAndWait(page, action);
            break;
          case 'selectAndWait':
            await ActionHelpers.selectAndWait(page, action);
            break;
          case 'clickAndWait':
            await ActionHelpers.clickAndWait(page, action);
            break;
          // Legacy support for old action types
          case 'fill':
            const fillElement = await page.waitForSelector(action.selector, { timeout: 10000 });
            await fillElement.fill(action.value);
            break;
          case 'click':
            const clickElement = await page.waitForSelector(action.selector, { timeout: 10000 });
            await clickElement.click();
            break;
          case 'select':
            const selectElement = await page.waitForSelector(action.selector, { timeout: 10000 });
            await selectElement.selectOption(action.value);
            break;
          case 'scroll':
            const scrollElement = await page.waitForSelector(action.selector, { timeout: 10000 });
            await scrollElement.scrollIntoViewIfNeeded();
            break;
          case 'wait':
            await page.waitForTimeout(action.duration);
            break;
        }
        
        // Brief pause between actions for better reliability
        await page.waitForTimeout(200);
        
      } catch (actionError) {
        console.warn(`⚠️  Action failed for ${action.type}: ${actionError.message}`);
        // Continue with other actions rather than failing completely
      }
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
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.DEBUG ? 100 : 0
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
  generateScreenshots().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { generateScreenshots };