import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord } from '../utils'
import { api, logger } from 'gadget-server'
import values from '/gadget/app/api/models/points/values.json'

export default {
  data: new SlashCommandBuilder()
    .setName('awardtrainingsession')
    .setDescription('Awards the user credit for 1 training session')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to award the training session to')
        .setRequired(true))
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  execute: async (interaction) => {
    const { role_ids: { ticket_handler } } = await getGuildRecord(interaction.guild.id)
    
    if (!interaction.member.roles.includes(ticket_handler))
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Error: training sessions can only be awarded by a <@&${ticket_handler}>`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    
    const [{ value: user_id }] = interaction.data.options
    
    const points = await api.internal.points.upsert({
      user_id, 
      guild_id: interaction.guild.id, 
      _atomics: { 
        training_count: { increment: 1 }, 
        value: { increment: values.training }
      }, 
      on: ['user_id', 'guild_id']
    })

    logger.info('%s awarded %s a training session', interaction.member.user.id, user_id)
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Awarded <@${user_id}> a training session, they now have ${points.training_count} training sessions and ${points.value} points`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}