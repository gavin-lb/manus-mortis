import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { getGuildRecord } from '../utils'

export default {
  data: new SlashCommandBuilder()
    .setName('handleapplication')
    .setDescription('Handles current application')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    const thread = await api.application.thread.maybeFindFirst({
      filter: {
        thread_id: {
          equals: interaction.channel.id,
        },
      }
    })

    if ( !(['open', 'pending']).includes(thread?.status) ) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Error: this command must be used in an open or pending application',
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    if (interaction.member.user.id == thread.owner.id) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '',
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`withdraw_application`)
                .setLabel('Withdraw application')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
            ).addComponents(
              new ButtonBuilder()
                .setCustomId(`request_help`)
                .setLabel('Request help')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('❓')
            )]
        }
      }
    }

    const { role_ids: { ticket_handler } } = await getGuildRecord(interaction.guild.id)
    if (interaction.member.roles.includes(ticket_handler)) {
      const answers = await api.application.answer.findMany({
        filter: {
          channel_id: {
            equals: interaction.channel.id,
          },
        }
      })

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: `Application summary:`,
            description: answers.map(answer => `**${answer.title}**\n${answer.value}`).join('\n\n'),
            color: 5793266
          }],
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`accept_application`)
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId(`deny_application`)
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⛔'),
            )]
        }
      }
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `⚠️ Error: applications can only be handled by the applicant or a <@&${ticket_handler}>`,
        flags: InteractionResponseFlags.EPHEMERAL
      }
    }
  }
}