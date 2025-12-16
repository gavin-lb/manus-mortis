import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord } from '../utils'
import { api, logger } from 'gadget-server'

export default {
  data: new SlashCommandBuilder()
    .setName('awardpoints')
    .setDescription('Awards points to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to award points to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('points')
        .setDescription('The number of points to award (use negative to subtract points)')
        .setRequired(true))
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  execute: async (interaction) => {
    const { role_ids: { ticket_handler } } = await getGuildRecord(interaction.guild.id)
    
    if (!interaction.member.roles.includes(ticket_handler))
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Error: points can only be awarded by a <@&${ticket_handler}>`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }

    const [{ value: user_id }, { value: amount }] = interaction.data.options
    
    const points = await api.internal.points.upsert({
      user_id, 
      guild_id: interaction.guild.id, 
      _atomics: { 
        other: { increment: amount }, 
        value: { increment: amount }
      }, 
      on: ['user_id', 'guild_id']
    })

    logger.info('%s awarded %s %s points', interaction.member.user.id, user_id, amount)
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Awarded <@${user_id}> ${amount} points, they now have ${points.value} points`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}