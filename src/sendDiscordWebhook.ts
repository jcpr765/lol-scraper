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

  const allDays = thisWeeksEvents.map((event) =>
    DateTime.fromISO(event.startTime).toFormat("cccc, L/d")
  );

  const allUniqueDays: string[] = allDays.filter((startTime, idx, self) => {
    return self.indexOf(startTime) === idx;
  });

  for (const day of allUniqueDays) {
    message += day + "\n\n";

    const dayEvents = thisWeeksEvents.filter(
      (event) => DateTime.fromISO(event.startTime).toFormat("cccc, L/d") === day
    );

    for (const event of dayEvents) {
      const matchTimestamp = `<t:${Math.round(
        DateTime.fromISO(event.startTime).toSeconds()
      )}:t>`;

      message += matchTimestamp + " ";

      const [team1, team2] = event.match.teams;

      message += `${team1.code} (${team1.record.wins}-${team1.record.losses}) vs ${team2.code} (${team2.record.wins}-${team2.record.losses})\n\n`;
    }
  }

  await axios.post(discordWebhookUrl, { content: message });
};
