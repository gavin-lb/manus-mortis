import { JSONValue } from "@gadget-client/manus-mortis";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { api } from "gadget-server";
import { memoize } from "lodash";
import { Emoji } from "/gadget/app/api/types";

export const MM_EMOJI = process.env.MM_EMOJI;
export const MM_COLOUR = 5319253;

const buildApplicationPostComponents = memoize(
  (
    records: {
      id: string;
      title: string;
      description: string | null;
      emoji: JSONValue | null;
    }[],
  ) => [
    new ContainerBuilder()
      .setAccentColor(MM_COLOUR)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${MM_EMOJI} Welcome to Manus Mortis! ${MM_EMOJI}`),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### To open an application:"),
        new TextDisplayBuilder().setContent(
          "Please select the relevant game from the drop down menu.",
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          records && records.length > 0
            ? new StringSelectMenuBuilder()
                .setCustomId("openApplication")
                .setPlaceholder("Open an application")
                .setRequired(false)
                .setMinValues(0)
                .addOptions(
                  ...records.map((record) => {
                    const option = new StringSelectMenuOptionBuilder()
                      .setLabel(record.title)
                      .setValue(record.id);
                    const emoji = record.emoji as Emoji | null;

                    if (record.description) {
                      option.setDescription(record.description);
                    }

                    if (emoji) {
                      option.setEmoji(emoji.name);
                    }

                    return option;
                  }),
                )
            : new StringSelectMenuBuilder()
                .setCustomId("openApplication")
                .setRequired(false)
                .setDisabled(true)
                .setPlaceholder("No applications available")
                .addOptions(new StringSelectMenuOptionBuilder().setLabel("N/A").setValue("none")),
        ),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### If you require assistance with something else:"),
        new TextDisplayBuilder().setContent("Please open a ticket."),
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Open ticket")
            .setCustomId("openTicket")
            .setEmoji({ name: "📬" }),
        ),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL("https://i.postimg.cc/1395TnTq/mm.png"),
        ),
      )
      .toJSON(),
  ],
);

export const getApplicationPost = async () => {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: buildApplicationPostComponents(
      (
        await api.application.findMany({
          select: { id: true, title: true, description: true, emoji: true },
          sort: { title: "Ascending" },
        })
      ).toJSON(),
    ),
  };
};

export const getBountyPost = memoize((postMessage: string) => ({
  flags: MessageFlags.IsComponentsV2,
  components: [
    new ContainerBuilder()
      .setAccentColor(MM_COLOUR)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(postMessage))
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`bountyHowTo`)
            .setLabel("How to claim a bounty")
            .setStyle(ButtonStyle.Success)
            .setEmoji("💰"),
          new ButtonBuilder()
            .setCustomId(`bountyPing`)
            .setLabel("Ping me for new bounties")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⚔"),
          new ButtonBuilder()
            .setCustomId(`bountyStopPing`)
            .setLabel("Stop pinging me")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🙅"),
        ),
      )
      .toJSON(),
  ],
}));
