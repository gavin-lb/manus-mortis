import { GuildRecord as GadgetGuildRecord } from "@gadget-client/manus-mortis";
import { RESTPostAPIChannelMessageJSONBody } from "discord.js";
import { ActionOptions, applyParams, logger, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import {
  deleteMessage,
  editMessage,
  getApplicationPost,
  getBountyPost,
  sendMessage,
} from "/gadget/app/api/utils";

interface Channel {
  id: string;
  name: string;
}

type GuildRecord = GadgetGuildRecord & {
  postChannel: Channel;
  bountyChannel: Channel;
};

const updateChannel = async (
  oldChannelId: string | undefined,
  newChannelId: string | undefined,
  existingPostMessageId: string | null,
  postMessage: RESTPostAPIChannelMessageJSONBody,
  setMessageId: (id: string) => void,
) => {
  if (!newChannelId || newChannelId === oldChannelId) return;

  if (existingPostMessageId && oldChannelId) {
    deleteMessage(oldChannelId, existingPostMessageId);
    logger.debug({ existingPostMessageId, oldChannelId }, "Deleting old post message");
  }

  const message = await sendMessage(newChannelId, postMessage);
  logger.debug({ message, newChannelId }, "Posted new message");

  setMessageId(message.id);
};

export const run: ActionRun = async ({ params, record }) => {
  await preventCrossUserDataAccess(params, record);

  const guildRecord = record as GuildRecord;
  const guildParams = params.guild as Partial<GuildRecord>;

  await updateChannel(
    guildRecord.postChannel?.id,
    guildParams.postChannel?.id,
    record.postMessageId,
    await getApplicationPost(),
    (id) => (guildRecord.postMessageId = id),
  );

  if (guildRecord.bountyMessage) {
    await updateChannel(
      guildRecord.bountyChannel?.id,
      guildParams.bountyChannel?.id,
      record.bountyPostMessageId,
      getBountyPost(guildRecord.bountyMessage),
      (id) => (guildRecord.bountyPostMessageId = id),
    );
  }

  if (
    guildRecord.bountyPostMessageId &&
    guildParams.bountyMessage &&
    guildParams.bountyMessage !== guildRecord.bountyMessage
  ) {
    editMessage(
      guildRecord.bountyChannel.id,
      guildRecord.bountyPostMessageId,
      getBountyPost(guildParams.bountyMessage),
    );
  }

  applyParams(params, record);
  await save(record);
};

export const options: ActionOptions = {
  actionType: "update",
};
