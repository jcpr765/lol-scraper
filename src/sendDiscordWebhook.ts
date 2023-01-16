import * as dotenv from "dotenv";
import axios from "axios";
import { LeagueName } from "./index";
import { DateTime } from "luxon";

interface Team {
  code: string;
  name: string;
  record: { wins: number; losses: number };
}

interface Event {
  startTime: string;
  league: { name: LeagueName; slug: string };
  match: {
    id: string;
    teams: Team[];
  };
}

const sendMessage = async (leagueEvents: Event[], webhookURL) => {
  if (leagueEvents.length === 0) {
    return;
  }

  let message: string = `This week's matches in ${leagueEvents[0].league.name}:\n`;

  const allDays = leagueEvents.map((event) =>
    DateTime.fromISO(event.startTime).toFormat("cccc, L/d")
  );

  const allUniqueDays: string[] = allDays.filter((startTime, idx, self) => {
    return self.indexOf(startTime) === idx;
  });

  for (const day of allUniqueDays) {
    message += day + "\n\n";

    const dayEvents = leagueEvents.filter(
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

  await axios.post(webhookURL, { content: message });
};

export default async (thisWeeksEvents: Event[], league: LeagueName) => {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config();
  }

  const LCSWebhookURL = process.env.LCS_WEBHOOK_URL;
  const LECWebhookURL = process.env.LEC_WEBHOOK_URL;

  switch (league) {
    case LeagueName.LCS:
      await sendMessage(
        thisWeeksEvents.filter((event) => event.league.name === LeagueName.LCS),
        LCSWebhookURL
      );
      break;
    case LeagueName.LEC:
      await sendMessage(
        thisWeeksEvents.filter((event) => event.league.name === LeagueName.LEC),
        LECWebhookURL
      );
      break;
  }
};
