import {
  type APIInteractionResponse,
  APIMessageComponentGuildInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { deleteParentMessage } from "../utils";

export default async (
  interaction: APIMessageComponentGuildInteraction,
): Promise<APIInteractionResponse> => {
  const [{ ownerId, id: ticketId }, { ticketsHandler }] = await Promise.all([
    api.tickets.findByThreadId(interaction.channel.id),
    api.guild.findByServerId(interaction.guild!.id),
  ]);
  const { id: handlerId } = ticketsHandler as { name: string; id: string };

  if (interaction.member.user.id === ownerId || interaction.member?.roles.includes(handlerId)) {
    api.tickets.close(ticketId, {
      name: interaction.member.user.global_name,
    });
    deleteParentMessage(interaction.token);
    return {
      type: InteractionResponseType.DeferredMessageUpdate,
    };
  }

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.Ephemeral,
      content: "⚠️ Error: you don't have permission to do that",
    },
  };
};
