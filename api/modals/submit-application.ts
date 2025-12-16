import { JSONValue } from "@gadget-client/manus-mortis-v2";
import {
  APIModalSubmitInteraction,
  ContainerBuilder,
  InteractionResponseType,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";
import { api } from "gadget-server";
import { MM_COLOUR, MM_EMOJI } from "../utils";

export default async (interaction: APIModalSubmitInteraction, applicationId: string) => {
  const { global_name: ownerName, id: ownerId } = interaction.member?.user!;

  const submittedApplication = await api.submittedApplications.create({
    ownerName,
    ownerId,
    application: { _link: applicationId },
    data: interaction.data as any as JSONValue,
  });

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      components: [
        new ContainerBuilder()
          .setAccentColor(MM_COLOUR)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${MM_EMOJI} Application: <#${submittedApplication.threadId}>`,
            ),
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Your application has been submitted and will be reviewed as soon as possible.",
            ),
          ),
      ],
    },
  };
};
