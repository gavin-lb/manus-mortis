import { PointRecord } from "@gadget-client/manus-mortis";
import { Events, type ClientEvents } from "discord.js";
import { api, logger } from "gadget-server";

const join = (record: PointRecord, channelId: string) => {
  logger.info({ user: record.userId, channelId }, "User joined voice channel");
  api.point.update(record.id, {
    joinedVoice: new Date(),
  });
};

const leave = async (record: PointRecord, channelId: string) => {
  const secondsSpentInVoice = Math.floor((Date.now() - record.joinedVoice!.valueOf()) / 1000);
  logger.info(
    { user: record.userId, secondsSpentInVoice, channelId },
    "User disconnected from voice channel",
  );
  await api.internal.point.update(record.id, {
    joinedVoice: null,
    _atomics: {
      secondsInVoice: {
        increment: secondsSpentInVoice,
      },
    },
  });
  api.point.computePoints(record.id);
};

export const name = Events.VoiceStateUpdate;

export async function handle(...args: ClientEvents[typeof name]): Promise<void> {
  const [oldState, newState] = args;
  logger.debug({ oldState, newState }, "Voice event");

  const record = await api.point.upsert({ userId: oldState.id, on: ["userId"] });

  const oldChannel = oldState.channelId;
  const newChannel = newState.channelId;

  const isAfk = newChannel === newState.guild.afkChannelId;
  const inVoice = record.joinedVoice !== null;

  if (!oldChannel && newChannel) {
    if (!isAfk) {
      join(record, newChannel);
    }
  } else if (oldChannel && !newChannel) {
    if (inVoice) {
      leave(record, oldChannel);
    }
  } else if (oldChannel != newChannel) {
    if (isAfk && inVoice) {
      leave(record, oldChannel!);
    } else if (!isAfk && !inVoice) {
      join(record, newChannel!);
    }
  }
}
