import {
  APIMessageApplicationCommandInteraction,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ContextMenuCommandBuilder,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { truncate } from "lodash";
import { getAvatarURL, getGuildMember } from "/gadget/app/api/utils";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Post Bounty")
    .setType(ApplicationCommandType.Message)
    .setIntegrationTypes(ApplicationIntegrationType.UserInstall),

  execute: async (interaction: APIMessageApplicationCommandInteraction) => {
    const guild = await api.guild.findByServerId(process.env.SERVER_ID!);
    const guildMember = await getGuildMember(guild.serverId, interaction.member!.user.id);

    if (!guildMember.roles.includes((guild.bountyPoster as { name: string; id: string }).id)) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "⚠️ Oops! You don't have permission to post bounties!",
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    const [[_, message]] = Object.entries(interaction.data.resolved.messages);
    const formattedMessage = truncate(
      message.content.replace(/<:.+?:.+?>/g, "").replace(/\n/g, "\n > "),
      { length: 300 },
    );

    const bounty = await api.bounty.create({
      guildId: interaction.guild!.id,
      channelId: interaction.channel.id,
      messageId: message.id,
      author: message.author.global_name ?? message.author.username,
      avatar: getAvatarURL(message.author),
      formattedMessage,
    });

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ Bounty posted: https://discord.com/channels/${guild.id}/${bounty.bountyChannelId}/${bounty.bountyMessageId}`,
        flags: MessageFlags.Ephemeral,
      },
    };
  },
};
