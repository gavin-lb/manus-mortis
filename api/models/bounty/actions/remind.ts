import { EmbedBuilder } from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { MM_COLOUR, sendMessage } from "/gadget/app/api/utils";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);

  const guild = await api.guild.findByServerId(process.env.SERVER_ID!);
  const { id: channelId } = guild.bountyReminderChannel as {
    name: string;
    id: string;
  };
  const { id: posterRoleId } = guild.bountyPoster as {
    name: string;
    id: string;
  };

  const link = `https://discord.com/channels/${record.guildId}/${record.channelId}/${record.messageId}`;
  const reminderMessage = await sendMessage(channelId, {
    content: `<@&${posterRoleId}> Previous bounty was posted <t:${Math.floor(record.createdAt.getTime() / 1000)}:R>!`,
    embeds: [
      new EmbedBuilder()
        .setColor(MM_COLOUR)
        .setTitle("⏰ Bounty Reminder ⏰")
        .setURL(link)
        .setDescription(
          `**Previous bounty:**
            ${link}
            > ${record.formattedMessage}`,
        )
        .setThumbnail("https://i.postimg.cc/xdj5jg9n/mm.png")
        .setTimestamp()
        .setFooter({
          text: record.author,
          iconURL: record.avatar,
        })
        .toJSON(),
    ],
    allowed_mentions: { roles: [posterRoleId] },
  });

  record.reminderMessageId = reminderMessage.id;
  await save(record);
};

export const options: ActionOptions = {
  actionType: "update",
};
