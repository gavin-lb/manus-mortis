import { SlashCommandBuilder, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { openTicket } from '../utils'

export default {
  data: new SlashCommandBuilder()
    .setName('openticket')
    .setDescription('Opens a new ticket with command arguments')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('A succint description of your ticket')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('body')
        .setDescription('The contents of your ticket, please state the reason for opening the ticket and how we can help')
        .setRequired(true))
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    try {
      const thread_id = await openTicket(
        interaction.guild.id,
        interaction.member.user,
        interaction.data.options[0].value,
        interaction.data.options[1].value
      )
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Ticket created: <#${thread_id}>`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    } catch (err) {
      console.error(err)
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! No ticket channel has been set`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }
  }
}