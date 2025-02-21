import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

// Function to add random delay between actions ..( to avoid bot detection)
const randomDelay = async (min = 100, max = 500) => {
  const delay = Math.floor(Math.random() * (max - min) + min);
  await new Promise(resolve => setTimeout(resolve, delay));
};

 
const CHESS_USERNAME = process.env.CHESS_USERNAME;
const CHESS_PASSWORD = process.env.CHESS_PASSWORD;

if (!CHESS_USERNAME || !CHESS_PASSWORD) {
  throw new Error('Chess.com credentials not found in environment variables');
}

export async function POST(request: NextRequest) {
  let browser;
  try {
    const body = await request.json();
    const { gameUrl } = body;

     
    console.log('Received game URL for analysis:', gameUrl);

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    
    // Add human-like behaviur
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Emulate human-like behavior
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    });

    console.log('Navigating to login page...');
    await page.goto('https://www.chess.com/login', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await randomDelay(2000, 3000);

    // Take pre-login screenshot
    
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
    
    
    // const preLoginTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // await page.screenshot({
    //   path: path.join(screenshotsDir, `pre-login-${preLoginTimestamp}.png`),
    //   fullPage: true
    // });
    console.log('Pre-login screenshot captured');

    // Debug: Log the form elements we find
    const formElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(input => ({
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder
      }));
    });
    console.log('Found form elements:', formElements);

    // Debug: Log form elements before interaction
    console.log('Starting login process...');

    // Handle username input using environment variable
    const usernameEntered = await page.evaluate((username) => {
      const input = document.querySelector('#username') as HTMLInputElement;
      if (input && username) {
        input.value = username;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, CHESS_USERNAME);

    if (!usernameEntered) {
      throw new Error('Could not enter username');
    }

    await randomDelay(800, 1200);

    // Handle password input using environment variable
    const passwordEntered = await page.evaluate((password) => {
      const input = document.querySelector('#password') as HTMLInputElement;
      if (input && password) {
        input.value = password;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, CHESS_PASSWORD);

    if (!passwordEntered) {
      throw new Error('Could not enter password');
    }

    await randomDelay(800, 1500);

    // Click login button
    const buttonClicked = await page.evaluate(() => {
      const button = document.querySelector('button[type="submit"][id="login"]') as HTMLButtonElement;
      if (button) {
        button.click();
        return true;
      }
      return false;
    });

    if (!buttonClicked) {
      // Take screenshot of the failed state
      // const failedTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // await page.screenshot({
      //   path: path.join(screenshotsDir, `failed-button-${failedTimestamp}.png`),
      //   fullPage: true
      // });
      console.log('Failed to click login button');
      throw new Error('Could not find or click login button');
    }

    // Wait after login attempt
    await randomDelay(3000, 4000);

    // Take post-login screenshot
    // const postLoginTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // const postLoginPath = path.join(screenshotsDir, `post-login-${postLoginTimestamp}.png`);
    // await page.screenshot({
    //   path: postLoginPath,
    //   fullPage: true
    // });

    
    console.log('Login screenshot captured, proceeding to game URL...');
    await randomDelay(1000, 2000);

    // Navigate to the game URL
    console.log('Navigating to game URL:', gameUrl);
    await page.goto(gameUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await randomDelay(1500, 2500);

    // Take screenshot of the game page
    const gamePageTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const gamePagePath = path.join(screenshotsDir, `game-page-${gamePageTimestamp}.png`);
    // await page.screenshot({
    //   path: gamePagePath,
    //   fullPage: true
    // });
    console.log('Game page screenshot captured');
    // Get game information
    const gameInfo = await page.evaluate(() => {
      const whitePlayer = document.querySelector('[data-player="white"]')?.textContent;
      const blackPlayer = document.querySelector('[data-player="black"]')?.textContent;
      const result = document.querySelector('.game-result')?.textContent;
      
      return {
        white: whitePlayer || 'Unknown',
        black: blackPlayer || 'Unknown',
        result: result || 'Unknown',
        url: window.location.href
      };
    });

    console.log('Game Information:', gameInfo);

    // Wait for the Game Review button and click it
    await randomDelay(2000, 3000);

    const reviewButtonClicked = await page.evaluate(() => {
      // First button variant
      const gameOverButton = document.querySelector(
        'button.cc-button-component.cc-button-primary.cc-button-xx-large.cc-button-full.game-over-review-button-background'
      ) as HTMLButtonElement;

      // Second button variant - using more reliable approach
      const allButtons = Array.from(document.querySelectorAll('button.cc-button-component.cc-button-primary'));
      const reviewButton = allButtons.find(button => {
        const hasGameReviewText = button.textContent?.includes('Game Review');
        const hasCorrectClasses = button.classList.contains('cc-button-large') && 
                                button.classList.contains('cc-button-full');
        return hasGameReviewText && hasCorrectClasses;
      }) as HTMLButtonElement;

      if (gameOverButton) {
        console.log('Found game over review button');
        gameOverButton.click();
        return true;
      }

      if (reviewButton) {
        console.log('Found regular review button');
        reviewButton.click();
        return true;
      }

      // Log available buttons for debugging
      const allAvailableButtons = Array.from(document.querySelectorAll('button')).map(b => ({
        classes: b.className,
        text: b.textContent?.trim(),
        ariaLabel: b.getAttribute('aria-label')
      }));
      console.log('Available buttons:', allAvailableButtons);

      return false;
    });

    if (!reviewButtonClicked) {
      console.log('Game Review button not found');
      // Take screenshot of the failed state
      // const failedReviewTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // await page.screenshot({
        //   path: path.join(screenshotsDir, `review-button-not-found-${failedReviewTimestamp}.png`),
        //   fullPage: true
        // });
        console.log('Game Review button not found');
      throw new Error('Could not find Game Review button');
    }

    // Wait for analysis to load
    console.log('Waiting for analysis to load...');
    await randomDelay(5000, 8000); // Longer wait for analysis to load

    // Take screenshot of the analysis page
    // const analysisTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // const analysisPath = path.join(screenshotsDir, `game-analysis-${analysisTimestamp}.png`);
    // await page.screenshot({
    //   path: analysisPath,
    //   fullPage: true
    // });

    console.log('Analysis screenshot captured');

    return NextResponse.json({ 
      message: 'Game analysis accessed successfully',
      url: gameUrl,
      gameScreenshotPath: gamePagePath,
      // analysisScreenshotPath : analysisPath,
      gameInfo
    });

  } catch (error) {
    console.error('Error in automation:', error);
    return NextResponse.json(
      { error: 'Failed to process request Please try again ' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await randomDelay(500, 1000);
      await browser.close();
    }
  }
} 