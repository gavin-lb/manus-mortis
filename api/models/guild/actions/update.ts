import { GuildRecord as GadgetGuildRecord } from "@gadget-client/manus-mortis-v2";
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
  oldChannel: Channel | null,
  newChannel: Channel | undefined,
  existingPostMessageId: string | null,
  postMessage: RESTPostAPIChannelMessageJSONBody,
  setMessageId: (id: string) => void,
) => {
  if (!newChannel || newChannel === oldChannel) return;

  if (existingPostMessageId && oldChannel) {
    deleteMessage(oldChannel.id, existingPostMessageId);
    logger.debug({ existingPostMessageId, oldChannel }, "Deleting old post message");
  }

  const message = await sendMessage(newChannel.id, postMessage);
  logger.debug({ message, newChannel }, "Posted new message");

  setMessageId(message.id);
};

export const run: ActionRun = async ({ params, record }) => {
  await preventCrossUserDataAccess(params, record);

  const guildRecord = record as GuildRecord;
  const guildParams = params.guild as Partial<GuildRecord>;

  await updateChannel(
    guildRecord.postChannel,
    guildParams.postChannel,
    record.postMessageId,
    await getApplicationPost(),
    (id) => (guildRecord.postMessageId = id),
  );

  await updateChannel(
    guildRecord.bountyChannel,
    guildParams.bountyChannel,
    record.bountyPostMessageId,
    getBountyPost(guildRecord.bountyMessage),
    (id) => (guildRecord.bountyPostMessageId = id),
  );

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
