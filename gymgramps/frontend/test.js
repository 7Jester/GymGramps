import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    try {
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
        console.log("Navigation complete.");
        await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
        console.log("CATCH ERROR:", e.message);
    } finally {
        await browser.close();
    }
})();
