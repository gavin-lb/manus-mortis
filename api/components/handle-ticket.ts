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
        .setCustomId("editTicket")
        .setEmoji({ name: "✏️" })
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("closeTicket")
        .setEmoji({ name: "🗑️" })
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger),
    )
    .toJSON(),
];

const HANDLER_COMPONENTS = [
  new ActionRowBuilder<ButtonBuilder>()
    .setComponents(
      new ButtonBuilder()
        .setCustomId("closeTicket")
        .setEmoji({ name: "🗑️" })
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger),
    )
    .toJSON(),
];

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const [ticketRecord, guildRecord] = await Promise.all([
    api.tickets.findByThreadId(interaction.channel.id),
    api.guild.findByServerId(interaction.guild!.id),
  ]);
  const { id: handlerRoleId } = guildRecord.ticketsHandler as {
    name: string;
    id: string;
  };

  if (ticketRecord.status === "open") {
    if (interaction.member?.user.id === ticketRecord.ownerId) {
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
