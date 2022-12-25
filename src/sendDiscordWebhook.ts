import * as dotenv from "dotenv";
import axios from "axios";
import { DateTime } from "luxon";

enum LeagueName {
  LCS,
  LEC,
  LCK,
  LPL,
}

interface Team {
  code: string;
  name: string;
  record: { wins: number; losses: number };
}

interface Event {
  startTime: string;
  league: { leagueName: LeagueName; slug: string };
  match: {
    id: string;
    teams: Team[];
  };
}

export default async (thisWeeksEvents: Event[]) => {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config();
  }

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  let message: string = "This week's events in LCS:";

  for (const event of thisWeeksEvents) {
    const matchTimePST = DateTime.fromISO(event.startTime)
      .setZone("America/Los_Angeles")
      .toFormat("cccc, L/d hh:mm ZZZZ");

    message += matchTimePST + "\n";

    const [team1, team2] = event.match.teams;

    message += `${team1.code} (${team1.record.wins}-${team1.record.losses}) vs ${team2.code} (${team2.record.wins}-${team2.record.losses})\n`;
  }

  await axios.post(discordWebhookUrl, { content: message });
};
