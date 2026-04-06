import { EmbedBuilder } from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { editChannel, MM_COLOUR, MM_EMOJI, sendMessage } from "/gadget/app/api/utils";

export const params = {
  name: { type: "string" },
  avatar: { type: "string" },
  reason: { type: "string" },
};

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  await preventCrossUserDataAccess(params, record);
  applyParams(params, record);

  const applicationRecord = await api.application.findById(record.applicationId);

  record.status = "denied";

  await sendMessage(record.threadId, {
    content: `<@${record.ownerId}>`,
    embeds: [
      new EmbedBuilder()
        .setColor(MM_COLOUR)
        .setTitle(`** ${MM_EMOJI} Application Denied ${MM_EMOJI}**`)
        .setDescription(
          "Regrettably, your application to Manus Mortis has been denied at this time.",
        )
        .setFields({ name: "Comments:", value: params.reason! })
        .setFooter({
          text: `Handled by @${params.name}`,
          iconURL: params.avatar,
        })
        .setTimestamp()
        .toJSON(),
    ],
  });
  editChannel(record.threadId, {
    name: `⛔Denied[@${record.ownerName}] ${applicationRecord.title}`,
    archived: true,
    locked: true,
  });

  await save(record);
};

export const options: ActionOptions = {
  actionType: "custom",
};
