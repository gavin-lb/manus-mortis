import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { getGuildRecord } from '../utils'

export default {
  data: new SlashCommandBuilder()
    .setName('handleticket')
    .setDescription('Handles current ticket')
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

    if (!ticketRecord || ticketRecord.status != 'open') {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Error: this command must be used in an open ticket',
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    if (interaction.member.user.id == ticketRecord.owner_id) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '',
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`edit_ticket`)
                .setLabel('Edit ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏'),
              new ButtonBuilder()
                .setCustomId(`close_ticket`)
                .setLabel('Close ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑')
            ).toJSON()]
        }
      }
    } 

    const guildRecord = await getGuildRecord(interaction.guild.id)
    
    if (interaction.member.roles.includes(guildRecord.role_ids.ticket_handler)) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '',
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`resolve_ticket`)
                .setLabel('Mark resolved')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✔'),
            ).toJSON()]
        }
      }
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `⚠️ Error: tickets can only be handled by the owner or a <@&${guildRecord.role_ids.ticket_handler}>`,
        flags: InteractionResponseFlags.EPHEMERAL
      }
    }
  }
}