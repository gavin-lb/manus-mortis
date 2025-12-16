import { TicketsRecord } from "@gadget-client/manus-mortis-v2";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  LabelBuilder,
  ModalBuilder,
  TextInputStyle,
} from "discord.js";
import { memoize } from "lodash";
import { MM_COLOUR } from "/gadget/app/api/utils";

export const buildTicketModal = memoize(
  (title?: string, body?: string) => {
    return new ModalBuilder()
      .setCustomId(title || body ? "editTicket" : "submitTicket")
      .setTitle(title || body ? "Edit Ticket" : "Open Ticket")
      .addLabelComponents(
        new LabelBuilder().setLabel("Ticket Title").setTextInputComponent((textInputBuilder) => {
          textInputBuilder
            .setCustomId("title")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(45)
            .setPlaceholder("A short description of your ticket");
          if (title) {
            textInputBuilder.setValue(title);
          }
          return textInputBuilder;
        }),
        new LabelBuilder()
          .setLabel("Ticket Body")
          .setDescription("Please state the reason for opening the ticket and how we can help.")
          .setTextInputComponent((textInputBuilder) => {
            textInputBuilder
              .setCustomId("body")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(4000)
              .setPlaceholder("The contents of your ticket");
            if (body) {
              textInputBuilder.setValue(body);
            }
            return textInputBuilder;
          }),
      )
      .toJSON();
  },
  (title, body) => JSON.stringify({ title, body }),
);

export function buildTicketMessage(record: TicketsRecord, footer: string) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `@${record.ownerName}`,
          iconURL: record.ownerAvatar,
        })
        .setColor(MM_COLOUR)
        .setTitle(`**${record.title}**`)
        .setDescription(record.body)
        .setTimestamp()
        .setFooter({ text: footer })
        .toJSON(),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder()
            .setCustomId("handleTicket")
            .setEmoji({ name: "🔧" })
            .setStyle(ButtonStyle.Secondary),
        )
        .toJSON(),
    ],
  };
}
