import {
  APIMessageApplicationCommandInteraction,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ContextMenuCommandBuilder,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Claim Bounty")
    .setType(ApplicationCommandType.Message)
    .setIntegrationTypes(ApplicationIntegrationType.UserInstall),

  execute: async (interaction: APIMessageApplicationCommandInteraction) => {
    const userId = interaction.member!.user.id;

    const [[_, message]] = Object.entries(interaction.data.resolved.messages);

    const bounty = await api.bounty.maybeFindFirst({
      filter: {
        guildId: { equals: interaction.guild!.id },
        channelId: { equals: interaction.channel.id },
        messageId: { equals: message.id },
      },
    });

    if (!bounty) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "⚠️ Oops! No bounty could be found for this message",
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    if (bounty.status !== "active") {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `⚠️ Oops! This bounty expired <t:${Math.floor(
            bounty.expiresAt!.getTime() / 1000,
          )}:R>`,
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    if (!message.reactions || !message.reactions.map((react) => react.me).some(Boolean)) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `⚠️ Oops! You need to react to this post to claim the bounty!`,
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    const claimedBounty = await api.claimedBounty.maybeFindFirst({
      filter: {
        userId: { equals: userId },
        bountyId: { equals: bounty.id },
      },
    });

    if (claimedBounty) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `⚠️ Oops! You already claimed this bounty <t:${Math.floor(
            claimedBounty.createdAt.getTime() / 1000,
          )}:R>`,
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    const [pointRecord] = await Promise.all([
      api.internal.point.upsert({
        userId,
        _atomics: {
          reactCount: { increment: 1 },
        },
        on: ["userId"],
      }),
      api.claimedBounty.create({ userId, bounty: { _link: bounty.id } }),
    ]);
    api.point.computePoints(pointRecord.id);

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `💰 Bounty claimed! You have claimed ${pointRecord.reactCount} bounties`,
        flags: MessageFlags.Ephemeral,
      },
    };
  },
};
