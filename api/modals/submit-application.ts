import {
  ActionRowBuilder,
  APIGuildInteractionWrapper,
  APIModalSubmitGuildInteraction,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  InteractionResponseType,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";
import { api } from "gadget-server";
import { JSONValue } from "../../.gadget/client/types-esm/types";
import { MM_COLOUR, MM_EMOJI } from "../utils";

export default async (
  interaction: APIGuildInteractionWrapper<APIModalSubmitGuildInteraction>,
  applicationId: string,
  page: number,
  maxPages: number,
) => {
  const user = interaction.member.user;

  const partialApplications = await api.submittedApplications.findMany({
    filter: {
      ownerId: { equals: user.id },
      applicationId: { equals: applicationId },
      status: { equals: "partial" },
    },
  });

  let partialApplication;
  const data = interaction.data as unknown as JSONValue;
  if (page == 0) {
    if (partialApplications.length > 0) {
      partialApplications.forEach((partial) => api.submittedApplications.delete(partial.id));
    }
    partialApplication = await api.submittedApplications.create({
      ownerName: user.global_name ?? user.username,
      ownerId: user.id,
      application: { _link: applicationId },
      data,
    });
  } else if (partialApplications.length == 1) {
    const [{ id }] = partialApplications;
    partialApplication = await api.submittedApplications.update(id, { data });
  } else {
    throw new Error(
      `Unexpected number of partial applications found: ${partialApplications.length}`,
    );
  }

  const type =
    page == 0
      ? InteractionResponseType.ChannelMessageWithSource
      : InteractionResponseType.UpdateMessage;
  if (page == maxPages) {
    const submittedApplication = await api.submittedApplications.submit(partialApplication.id);
    return {
      type,
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
  } else {
    return {
      type,
      data: {
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          new ContainerBuilder()
            .setAccentColor(MM_COLOUR)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `## ${MM_EMOJI} Application progress: ${Number(page) + 1} / ${Number(maxPages) + 1}`,
              ),
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                "Please continue your application by pressing the button below:",
              ),
            )
            .addActionRowComponents(
              new ActionRowBuilder<ButtonBuilder>().setComponents(
                new ButtonBuilder()
                  .setCustomId(`open-application ${applicationId} ${Number(page) + 1}`)
                  .setEmoji({ name: "📩" })
                  .setLabel("Continue application")
                  .setStyle(ButtonStyle.Primary),
              ),
            ),
        ],
      },
    };
  }
};
