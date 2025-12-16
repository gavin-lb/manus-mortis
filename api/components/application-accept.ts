import {
  type APIInteractionResponse,
  APIMessageComponentInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { deleteParentMessage, getAvatarURL } from "../utils";

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const {
    id: recordId,
    status,
    application: { handlerRole },
  } = await api.submittedApplications.findByThreadId(interaction.channel.id, {
    select: { id: true, status: true, application: { handlerRole: true } },
  });
  const { id: handlerRoleId } = handlerRole as { name: string; id: string };

  if (status === "open") {
    const user = interaction.member!.user;

    if (interaction.member?.roles.includes(handlerRoleId)) {
      api.submittedApplications.accept(recordId, {
        name: user.global_name,
        avatar: getAvatarURL(user),
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
  } else {
    return {
      type: InteractionResponseType.DeferredMessageUpdate,
    };
  }
};
