// Run the logic that would run in the lambda locally
import { fetchThisWeeksEvents, LeagueName } from "./index";
import sendDiscordWebhooks from "./sendDiscordWebhook";
const testSend = async () => {
  const thisWeeksEvents = await fetchThisWeeksEvents(
    new Date("January 17, 2023")
  );
  sendDiscordWebhooks(thisWeeksEvents, LeagueName.LCS);
  sendDiscordWebhooks(thisWeeksEvents, LeagueName.LEC);
};

testSend();
