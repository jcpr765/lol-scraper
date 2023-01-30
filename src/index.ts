import getBrowser from "./getBrowser";
import { DateTime, Interval } from "luxon";
import sendDiscordWebhook from "./sendDiscordWebhook";

export enum LeagueName {
  LCS = "LCS",
  LEC = "LEC",
  LCK = "LCK",
  LPL = "LPL",
}

const url = "https://lolesports.com/schedule?leagues=lcs,lec";

export const fetchThisWeeksEvents = async (week: Date = new Date()) => {
  const browser = await getBrowser();

  const page = await browser.newPage();

  const today = DateTime.fromJSDate(week);
  const weekInterval = Interval.after(today, { days: 7 });

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

export const handler = async (event: string): Promise<any> => {
  console.log("HANDLER EVENT", event, typeof event);

  const { league } = JSON.parse(event);

  const thisWeeksEvents = await fetchThisWeeksEvents();

  if (thisWeeksEvents.length > 0) {
    await sendDiscordWebhook(thisWeeksEvents, league);

    return {
      statusCode: 200,
      body: "Message successfully sent!",
    };
  }

  return {
    statusCode: 200,
    body: "No events to send found",
  };
};

export default handler;
