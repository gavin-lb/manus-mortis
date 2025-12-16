import {
  type APIInteractionResponse,
  APIMessageComponentInteraction,
  InteractionResponseType,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputStyle,
} from "discord.js";
import { api } from "gadget-server";

const DENY_MODAL = new ModalBuilder()
  .setCustomId("denyApplication")
  .setTitle("Deny Application")
  .addLabelComponents(
    new LabelBuilder()
      .setLabel("Comments")
      .setDescription(
        "Provide some comments to the applicant to let them know why they were denied.",
      )
      .setTextInputComponent((builder) =>
        builder
          .setCustomId("comments")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Enter comments..."),
      ),
  )
  .toJSON();

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const {
    status,
    application: { handlerRole },
  } = await api.submittedApplications.findByThreadId(interaction.channel.id, {
    select: { id: true, status: true, application: { handlerRole: true } },
  });
  const { id: handlerRoleId } = handlerRole as { name: string; id: string };

  if (status === "open") {
    if (interaction.member?.roles.includes(handlerRoleId)) {
      return {
        type: InteractionResponseType.Modal,
        data: DENY_MODAL,
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
