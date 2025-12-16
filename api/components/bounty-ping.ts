import {
  APIInteractionResponse,
  APIMessageComponentInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord.js";
import { api } from "gadget-server";
import { addRole } from "/gadget/app/api/utils";

export default async (
  interaction: APIMessageComponentInteraction,
): Promise<APIInteractionResponse> => {
  const { bountyHunter, serverId } = await api.guild.findByServerId(process.env.SERVER_ID!);
  const { id: bountyHunterRoleId } = bountyHunter as { name: string; id: string };

  addRole(serverId, interaction.member!.user.id, bountyHunterRoleId);

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.Ephemeral,
      content: `✅ <@&${bountyHunterRoleId}> role added, you will get pings for new bounties!`,
    },
  };
};
