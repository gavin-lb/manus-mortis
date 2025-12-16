import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord, assignRole, toOrdinal } from '/gadget/app/utils'
import { api, logger } from 'gadget-server'

const data = new SlashCommandBuilder()
    .setName('assignroles')
    .setDescription('Assigns a particular role to up to 24 users at a time')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))

for (let i = 1; i < 25; i++) {
  data.addUserOption(option =>
      option.setName(`user${i}`)
        .setDescription(`The ${toOrdinal(i)} user to assign the role to`)
        .setRequired(false))
}
  
export default {
  data,
  execute: async (interaction) => {
    const { role_ids: { ticket_handler } } = await getGuildRecord(interaction.guild.id)
    
    if (!interaction.member.roles.includes(ticket_handler))
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! Roles can only be assigned by a <@&${ticket_handler}>`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }

    const [{ value: role }, ...userObjs] = interaction.data.options
    const users = userObjs.map(user => user.value)

    users.forEach(user => assignRole(interaction.guild.id, role, user))
    logger.info({ role, users, interaction }, 'assignroles')
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Assigned <@&${role}> to ${users.map(user => `<@${user}>`).join(', ')}`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}