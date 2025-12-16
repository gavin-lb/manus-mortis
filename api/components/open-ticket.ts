import { APIMessageComponentInteraction, InteractionResponseType } from "discord.js";
import { buildTicketModal } from "../utils";

export default async (interaction: APIMessageComponentInteraction) => {
  return {
    type: InteractionResponseType.Modal,
    data: buildTicketModal(),
  };
};
