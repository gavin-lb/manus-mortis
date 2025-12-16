import { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord } from '../utils'

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Opens a new ticket with gui')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    const guildRecord = await getGuildRecord(interaction.guild.id)

    if (!guildRecord.ticket_channel) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! No ticket channel has been set`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    return {
      type: InteractionResponseType.MODAL,
      data: new ModalBuilder()
        .setCustomId('open_ticket_modal')
        .setTitle('Open a ticket')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('title')
              .setLabel("Ticket title:")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('A brief description of your ticket')),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('body')
              .setLabel("Ticket body:")
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('The contents of your ticket, please state the reason for opening the ticket and how we can help'))
        )
    }
  }
}