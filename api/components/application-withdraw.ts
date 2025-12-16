import {
  type APIInteractionResponse,
  APIMessageComponentInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { deleteParentMessage } from "../utils";

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const {
    id: recordId,
    status,
    ownerId,
  } = await api.submittedApplications.findByThreadId(interaction.channel.id, {
    select: { id: true, status: true, ownerId: true },
  });

  if (status === "open") {
    if (interaction.member?.user.id === ownerId) {
      api.submittedApplications.withdraw(recordId);
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
  } else {
    return {
      type: InteractionResponseType.DeferredMessageUpdate,
    };
  }
};
