import { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'

export default {
  data: new SlashCommandBuilder()
    .setName('editticket')
    .setDescription('Edit the current ticket')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    const ticketRecord = await api.ticket.maybeFindFirst({
      filter: {
        thread_id: {
          equals: interaction.channel.id,
        },
      },
    })

    if (!ticketRecord) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Error: this command must be used in an open ticket',
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    if (ticketRecord.owner_id != interaction.member.user.id) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Error: only the owner of a ticket may edit it',
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    return {
      type: InteractionResponseType.MODAL,
      data: new ModalBuilder()
        .setCustomId('edit_ticket_modal')
        .setTitle('Edit ticket')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('title')
              .setLabel("Ticket title:")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('A brief description of your ticket')
              .setValue(ticketRecord.title)),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('body')
              .setLabel("Ticket body:")
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('The contents of your ticket, please state the reason for opening the ticket and how we can help')
              .setValue(ticketRecord.body))
        )
    }
  }
}