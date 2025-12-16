import { Events, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

export const name = Events.MessageCreate;

export async function handle(...args: ClientEvents[typeof name]): Promise<void> {
  const [message] = args;
  logger.debug({ message }, "Message event");

  if (message.author.bot) return;

  const { id } = await api.internal.point.upsert({
    userId: message.author.id,
    _atomics: {
      messageCount: { increment: 1 },
    },
    on: ["userId"],
  });
  api.point.computePoints(id);
}
