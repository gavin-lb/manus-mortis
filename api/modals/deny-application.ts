import {
  APIModalSubmitInteraction,
  APIModalSubmitTextInputComponent,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { deleteParentMessage, getAvatarURL } from "../utils";

export default async (interaction: APIModalSubmitInteraction) => {
  const [
    {
      component: { value: reason },
    },
  ] = interaction.data.components as { component: APIModalSubmitTextInputComponent }[];

  const {
    id: recordId,
    application: { handlerRole },
    status,
  } = await api.submittedApplications.findByThreadId(interaction.channel!.id, {
    select: { id: true, status: true, application: { handlerRole: true } },
  });
  const { id: handlerRoleId } = handlerRole as { name: string; id: string };

  if (status === "open") {
    if (interaction.member?.roles.includes(handlerRoleId)) {
      const user = interaction.member!.user;
      api.submittedApplications.deny(recordId, {
        name: user.global_name,
        avatar: getAvatarURL(user),
        reason,
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
