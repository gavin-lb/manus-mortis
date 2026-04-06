import { Events, type Role, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

export const name = Events.GuildMemberUpdate;

export async function handle(...args: ClientEvents[typeof name]): Promise<void> {
  const [oldMember, newMember] = args;
  const newRole = newMember.roles.cache
    .filter((role: Role) => !oldMember.roles.cache.has(role.id))
    .first();

  logger.debug({ oldMember, newMember, newRole }, "GuildMemberUpdate event received");

  if (!newRole) {
    return;
  }

  for (const message of await api.welcomeMessage.findMany({
    filter: {
      type: { equals: "role" },
      role: { equals: { id: newRole.id, name: newRole.name } },
    },
  })) {
    api.welcomeMessage.send(message.id, {
      memberId: newMember.id,
      avatar: newMember.avatar ?? newMember.user.avatar ?? "",
      username: newMember.nickname ?? newMember.user.globalName ?? newMember.user.username,
    });
  }
}
