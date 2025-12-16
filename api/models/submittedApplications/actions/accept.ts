import { EmbedBuilder } from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { addRole, editChannel, MM_COLOUR, MM_EMOJI, sendMessage } from "/gadget/app/api/utils";

export const params = {
  name: { type: "string" },
  avatar: { type: "string" },
};

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);

  const applicationRecord = await api.application.findById(record.applicationId);

  record.status = "accepted";

  ((record.roles ?? []) as string[]).forEach((roleId) =>
    addRole(process.env.SERVER_ID!, record.ownerId, roleId),
  );

  await sendMessage(record.threadId, {
    content: `<@${record.ownerId}>`,
    embeds: [
      new EmbedBuilder()
        .setColor(MM_COLOUR)
        .setTitle(`** ${MM_EMOJI} Application Accepted ${MM_EMOJI}**`)
        .setDescription("Congratulations, your application to Manus Mortis has been accepted!")
        .setFooter({ text: `Handled by @${params.name}`, iconURL: params.avatar })
        .setTimestamp()
        .toJSON(),
    ],
  });

  editChannel(record.threadId, {
    name: `✅Accepted[@${record.ownerName}] ${applicationRecord.title}`,
    archived: true,
    locked: true,
  });
  await save(record);
};

export const options: ActionOptions = {
  actionType: "custom",
};
