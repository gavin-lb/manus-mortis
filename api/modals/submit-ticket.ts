import {
  APIGuildInteractionWrapper,
  APIModalSubmitGuildInteraction,
  APIModalSubmitTextInputComponent,
  ContainerBuilder,
  InteractionResponseType,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";
import { api } from "gadget-server";
import { getAvatarURL, MM_COLOUR, MM_EMOJI } from "../utils";

export default async (interaction: APIGuildInteractionWrapper<APIModalSubmitGuildInteraction>) => {
  const [
    {
      component: { value: title },
    },
    {
      component: { value: body },
    },
  ] = interaction.data.components as {
    component: APIModalSubmitTextInputComponent;
  }[];

  const user = interaction.member.user;

  const ticket = await api.tickets.create({
    title,
    body,
    ownerName: user.global_name ?? user.username,
    ownerAvatar: getAvatarURL(user),
    ownerId: user.id,
  });

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      components: [
        new ContainerBuilder()
          .setAccentColor(MM_COLOUR)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ${MM_EMOJI} Ticket: <#${ticket.threadId}>`),
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Your ticket has been created and will be handled as soon as possible.",
            ),
          ),
      ],
    },
  };
};
