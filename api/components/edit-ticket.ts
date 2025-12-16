import {
  type APIInteractionResponse,
  APIMessageComponentInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { buildTicketModal } from "../utils";

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const { ownerId, title, body } = await api.tickets.findByThreadId(interaction.channel.id);

  if (interaction.member?.user.id === ownerId) {
    return {
      type: InteractionResponseType.Modal,
      data: buildTicketModal(title, body),
    };
  }

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.Ephemeral,
      content: "⚠️ Error: Only the ticket owner can edit a ticket",
    },
  };
};
