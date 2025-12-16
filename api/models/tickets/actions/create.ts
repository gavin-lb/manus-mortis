import { ChannelType } from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { buildTicketMessage, createThread, sendMessage } from "/gadget/app/api/utils";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);

  const guildRecord = await api.guild.findByServerId(process.env.SERVER_ID!);
  const { id: channelId } = guildRecord.ticketsChannel as { name: string; id: string };
  const { id: handlerRoleId } = guildRecord.ticketsHandler as { name: string; id: string };

  const thread = await createThread(channelId, {
    name: `✉️[@${record.ownerName}] ${record.title}`,
    type: ChannelType.PrivateThread,
  });

  const message = await sendMessage(thread.id, {
    content: `<@${record.ownerId}><@&${handlerRoleId}>`,
    ...buildTicketMessage(record, " "),
  });

  record.threadId = thread.id;
  record.channelId = channelId;
  record.messageId = message.id;

  await save(record);
};

export const options: ActionOptions = {
  actionType: "create",
};
