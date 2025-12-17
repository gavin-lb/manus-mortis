import { Events, Guild, VoiceState, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

export const name = Events.ClientReady;

export function handle(...args: ClientEvents[typeof name]): void {
  const [client]: [(typeof args)[0] & { uuid?: string }] = args;
  client.uuid = crypto.randomUUID();
  logger.info(`Ready! Logged in as ${client.user.username} with uuid: ${client.uuid}`);

  client.guilds.cache.forEach(async (guild: Guild) => {
    const usersInVoice = await api.point.findMany({
      filter: {
        joinedVoice: {
          notEquals: null,
        },
      },
    });

    guild.voiceStates.cache.forEach((state: VoiceState) => {
      if (
        state.channel?.id &&
        state.channel.id !== state.guild.afkChannelId &&
        usersInVoice.every((user) => user.userId !== state.id)
      ) {
        logger.info({ state }, "New user found in voice channel");
        api.point.upsert({
          userId: state.id,
          joinedVoice: new Date(),
          on: ["userId"],
        });
      }
    });

    usersInVoice.forEach((user) => {
      if (
        guild.voiceStates.cache.every(
          (state: VoiceState) =>
            state.id !== user.userId && state.channel?.id !== state.guild.afkChannelId,
        )
      ) {
        logger.info({ user }, "User vanished from voice channel");
        api.point.update(user.id, {
          joinedVoice: null,
        });
      }
    });
  });
}
