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

  let message: string = "This week's events in LCS:\n";

  const allUniqueDates: string[] = thisWeeksEvents
    .map((event) => event.startTime)
    .filter((startTime, idx, self) => {
      return self.indexOf(startTime) === idx;
    });

  for (const date of allUniqueDates) {
    const matchDay = DateTime.fromISO(date)
      .setZone("America/Los_Angeles")
      .toFormat("cccc, L/d");

    message += matchDay + "\n\n";

    const dayEvents = thisWeeksEvents.filter(
      (event) => event.startTime === date
    );

    for (const event of dayEvents) {
      const matchTimePST = DateTime.fromISO(event.startTime)
        .setZone("America/Los_Angeles")
        .toFormat("hh:mm ZZZZ");

      message += matchTimePST + "\n";

      const [team1, team2] = event.match.teams;

      message += `${team1.code} (${team1.record.wins}-${team1.record.losses}) vs ${team2.code} (${team2.record.wins}-${team2.record.losses})\n\n`;
    }
  }

  await axios.post(discordWebhookUrl, { content: message });
};
