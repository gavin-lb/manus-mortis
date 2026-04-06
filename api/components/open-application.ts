import { APIMessageUserSelectInteractionData, InteractionResponseType } from "discord.js";
import { api } from "gadget-server";

export default async ({
  data: {
    values: [applicationId],
  },
}: {
  data: APIMessageUserSelectInteractionData;
}) => {
  if (!applicationId) {
    return {
      type: InteractionResponseType.DeferredMessageUpdate,
    };
  }

  const record = await api.application.findById(applicationId);
  return {
    type: InteractionResponseType.Modal,
    data: record.modal,
  };
};
