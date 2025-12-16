import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord, assignRole, toOrdinal } from '/gadget/app/utils'
import { api, logger } from 'gadget-server'

const data = new SlashCommandBuilder()
    .setName('setranks')
    .setDescription('Sets the rank hierarchy for promotions')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addRoleOption(option =>
      option.setName('rank1')
        .setDescription('The highest rank in the hierarchy')
        .setRequired(true))

for (let i = 2; i <= 25; i++) {
  data.addRoleOption(option =>
      option.setName(`rank${i}`)
        .setDescription(`The ${toOrdinal(i)} highest rank in the hierarchy`)
        .setRequired(false))
}
  
export default {
  data,
  execute: async (interaction) => {
    const { id, role_ids } = await getGuildRecord(interaction.guild.id)
    
    if (!interaction.member.roles.includes(role_ids.ticket_handler))
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! This command can only be used by a <@&${ticket_handler}>`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    
    const ranks = interaction.data.options.map(option => option.value)
    role_ids.ranks = ranks
    
    api.guild.update(id, { role_ids })
    logger.info({ ranks, interaction }, 'setranks')
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Set the rank hierarchy to: ${ranks.map(rank => `<@&${rank}>`).join(', ')}`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}