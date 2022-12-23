import puppeteer from "puppeteer";
import { DateTime, Interval } from "luxon";
const url = "https://lolesports.com/schedule?leagues=lcs";

(async () => {
  // Start browser
  const browser = await puppeteer.launch();

  // Navigate to page
  const page = await browser.newPage();

  await page.goto(url);

  // Click language selector
  const languageSwitchSelector = ".lang-switch-trigger";

  await page.waitForSelector(languageSwitchSelector);

  await page.click(languageSwitchSelector);

  // Click English (US)
  const englishSelector = '[data-testid="riotbar:localeswitcher:link-en-US"]';

  await page.waitForSelector(englishSelector);

  await page.click(englishSelector);

  // Close language select
  await page.waitForSelector(languageSwitchSelector);

  await page.click(languageSwitchSelector);

  const today = DateTime.fromJSDate(new Date("January 23, 2023"));

  const weekInterval = Interval.after(today, { days: 6 });

  const element = await page.waitForSelector(".EventDate");

  console.log(element);

  await await page.screenshot({ path: "screenshot.png" });

  await browser.close();
})();
