import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { DateTime, Interval } from "luxon";

const url = "https://lolesports.com/schedule?leagues=lcs";

const fetchThisWeeksEvents = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  const today = DateTime.fromJSDate(new Date("January 23, 2023"));
  const weekInterval = Interval.after(today, { days: 6 });

  let thisWeeksEvents = [];

  page.on("response", async (interceptedResponse) => {
    const response = await interceptedResponse;

    if (response.url().includes("getSchedule") && response.status() === 200) {
      try {
        const { data } = await response.json();

        const { events } = data.schedule;

        for (const event of events) {
          const eventTime = DateTime.fromISO(event.startTime);

          if (weekInterval.contains(eventTime)) {
            thisWeeksEvents.push(event);
          }
        }
      } catch (error) {}
    }
  });

  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

  await browser.close();

  return thisWeeksEvents;
};

// const testFetch = async () => {
//   const thisWeeksEvents = await fetchThisWeeksEvents();
//   console.log(thisWeeksEvents);
// };

// testFetch();

export const handler = async (): Promise<any> => {
  const thisWeeksEvents = await fetchThisWeeksEvents();

  const response = {
    statusCode: 200,
    body: JSON.stringify(thisWeeksEvents),
  };
  return response;
};
