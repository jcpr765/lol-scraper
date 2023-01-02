// Run the logic that would run in the lambda locally
import { fetchThisWeeksEvents } from "./index";
import sendDiscordWebhooks from "./sendDiscordWebhook";
const testSend = async () => {
  const thisWeeksEvents = await fetchThisWeeksEvents(
    new Date("January 23, 2023")
  );
  sendDiscordWebhooks(thisWeeksEvents);
};

testSend();
