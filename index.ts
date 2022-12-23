import puppeteer from "puppeteer";
import { DateTime, Interval } from "luxon";
const url = "https://lolesports.com/schedule?leagues=lcs";

(async () => {
  // Start browser
  const browser = await puppeteer.launch();

  // Navigate to page
  const page = await browser.newPage();

  const today = DateTime.fromJSDate(new Date("January 23, 2023"));
  const weekInterval = Interval.after(today, { days: 6 });

  page.on("response", async (interceptedResponse) => {
    const response = await interceptedResponse;

    if (response.url().includes("getSchedule") && response.status() === 200) {
      try {
        const { data } = await response.json();

        const { events } = data.schedule;

        const thisWeeksEvents = [];

        for (const event of events) {
          const eventTime = DateTime.fromISO(event.startTime);

          if (weekInterval.contains(eventTime)) {
            thisWeeksEvents.push(event);
          }
        }

        console.log(thisWeeksEvents);
      } catch (error) {}
    }
  });

  await page.goto(url, { waitUntil: "load", timeout: 0 });

  await page.screenshot({ path: "screenshot.png" });

  await browser.close();
})();
