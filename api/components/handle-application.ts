import {
  ActionRowBuilder,
  type APIInteractionResponse,
  APIMessageComponentInteraction,
  ButtonBuilder,
  ButtonStyle,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";

const OWNER_COMPONENTS = [
  new ActionRowBuilder<ButtonBuilder>()
    .setComponents(
      new ButtonBuilder()
        .setCustomId("applicationWithdraw")
        .setEmoji({ name: "🗑️" })
        .setLabel("Withdraw")
        .setStyle(ButtonStyle.Danger),
    )
    .toJSON(),
];

const HANDLER_COMPONENTS = [
  new ActionRowBuilder<ButtonBuilder>()
    .setComponents(
      new ButtonBuilder()
        .setCustomId("applicationAccept")
        .setEmoji({ name: "✅" })
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("applicationDeny")
        .setEmoji({ name: "⛔" })
        .setLabel("Deny")
        .setStyle(ButtonStyle.Danger),
    )
    .toJSON(),
];

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const record = await api.submittedApplications.findByThreadId(interaction.channel.id, {
    select: {
      status: true,
      ownerId: true,
      application: { handlerRole: true },
    },
  });
  const { id: handlerRoleId } = record.application.handlerRole as {
    name: string;
    id: string;
  };

  if (record.status === "open") {
    if (interaction.member?.user.id === record.ownerId) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral,
          components: OWNER_COMPONENTS,
        },
      };
    }

    if (interaction.member?.roles.includes(handlerRoleId)) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral,
          components: HANDLER_COMPONENTS,
        },
      };
    }
  }

  return {
    type: InteractionResponseType.DeferredMessageUpdate,
  };
};
