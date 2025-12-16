import {
  APIModalSubmitInteraction,
  APIModalSubmitTextInputComponent,
  InteractionResponseType,
} from "discord.js";
import { api } from "gadget-server";
import { deleteParentMessage } from "../utils";

export default async (interaction: APIModalSubmitInteraction) => {
  const [
    {
      component: { value: title },
    },
    {
      component: { value: body },
    },
  ] = interaction.data.components as { component: APIModalSubmitTextInputComponent }[];

  const ticketRecord = await api.tickets.findByThreadId(interaction.channel!.id);
  api.tickets.update(ticketRecord.id, { title, body });

  deleteParentMessage(interaction.token);
  return {
    type: InteractionResponseType.DeferredMessageUpdate,
  };
};
