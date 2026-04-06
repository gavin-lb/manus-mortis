import { Events, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

export const name = Events.GuildMemberAdd;

export async function handle(...args: ClientEvents[typeof name]): Promise<void> {
  const [newMember] = args;

  for (const message of await api.welcomeMessage.findMany({
    filter: {
      type: { equals: "member" },
    },
  })) {
    logger.debug(`Sending welcome message to ${newMember.user.username}`);
    api.welcomeMessage.send(message.id, {
      memberId: newMember.id,
      avatar: newMember.avatar ?? newMember.user.avatar ?? "",
      username: newMember.nickname ?? newMember.user.globalName ?? newMember.user.username,
    });
  }
}
