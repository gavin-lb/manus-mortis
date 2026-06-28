import { Events, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

const AVATAR_URL = "https://i.postimg.cc/ncCb1jTW/image.png";

export const name = Events.GuildMemberRemove;

export async function handle(...args: ClientEvents[typeof name]): Promise<void> {
  const [member] = args;

  logger.debug({ member }, "Member left server");
  for (const application of await api.submittedApplications.findMany({
    filter: { ownerId: { equals: member.user.id }, status: { equals: "open" } },
  })) {
    logger.debug({ application }, "Member had open application");

    api.submittedApplications.deny(application.id, {
      name: "Manus Mortis Bot",
      reason: "User has left the server.",
      avatar: AVATAR_URL,
    });
  }
}
