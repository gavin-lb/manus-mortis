import { EmbedBuilder } from "discord.js";
import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { deleteMessage, MM_COLOUR, sendMessage } from "/gadget/app/api/utils";

const MS_IN_HOUR = 3600000;

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);

  const guild = await api.guild.findByServerId(process.env.SERVER_ID!);
  const { id: bountyChannelId } = guild.bountyChannel as { name: string; id: string };
  const { id: bountyHunterRoleId } = guild.bountyHunter as { name: string; id: string };

  const expiresAt = new Date(Date.now() + (guild.bountyHours ?? 24) * MS_IN_HOUR);
  const link = `https://discord.com/channels/${record.guildId}/${record.channelId}/${record.messageId}`;
  const bountyMessage = await sendMessage(bountyChannelId, {
    content: `<@&${bountyHunterRoleId}> Fresh meat, lads! Claim this bounty before it expires <t:${Math.floor(
      expiresAt.getTime() / 1000,
    )}:R>!`,
    embeds: [
      new EmbedBuilder()
        .setColor(MM_COLOUR)
        .setTitle("💰 New bounty posted! 💰")
        .setURL(link)
        .setDescription(
          `**React to this message and claim your bounty:**
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
    allowed_mentions: { roles: [bountyHunterRoleId] },
  });

  const previousBounty = await api.bounty.maybeFindFirst({ sort: { createdAt: "Descending" } });

  record.bountyMessageId = bountyMessage.id;
  record.bountyChannelId = bountyChannelId;
  record.expiresAt = expiresAt;
  await save(record);

  // schedule expiration
  api.enqueue(api.bounty.expire, { id: record.id }, { startAt: record.expiresAt });

  if (guild.bountyReminderHours) {
    // schedule reminder
    api.enqueue(
      api.bounty.remind,
      { id: record.id },
      { startAt: new Date(Date.now() + guild.bountyReminderHours * MS_IN_HOUR) },
    );

    // remove previous reminder
    if (previousBounty?.reminderMessageId) {
      const { id: bountyReminderChannelId } = guild.bountyReminderChannel as {
        name: string;
        id: string;
      };
      deleteMessage(bountyReminderChannelId, previousBounty.reminderMessageId);
    }
  }
};

export const options: ActionOptions = {
  actionType: "create",
};
