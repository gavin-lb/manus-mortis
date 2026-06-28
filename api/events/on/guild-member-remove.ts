import { Events, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

const AVATAR_URL = "https://i.postimg.cc/ncCb1jTW/image.png";

export const name = Events.GuildMemberRemove;

export async function handle(...args: ClientEvents[typeof name]): Promise<void> {
  const [member] = args;

  logger.debug({ member }, "Member left server");

  const applications = api.submittedApplications.findMany({
    filter: { ownerId: { equals: member.user.id }, status: { equals: "open" } },
  });

  const tickets = api.tickets.findMany({
    filter: { ownerId: { equals: member.user.id }, status: { equals: "open" } },
  });

  for (const application of await applications) {
    logger.debug({ application }, "Member had open application");

    api.submittedApplications.deny(application.id, {
      name: "Manus Mortis Bot",
      reason: "User has left the server.",
      avatar: AVATAR_URL,
    });
  }

  for (const ticket of await tickets) {
    logger.debug({ ticket }, "Member had open ticket");

    api.tickets.close(ticket.id, {
      name: "Manus Mortis Bot",
    });
  }
}
