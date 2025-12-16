import { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord, discordRequest, assignRole, removeRole, toOrdinal } from '/gadget/app/utils'
import { api, logger } from 'gadget-server'

const data = new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promotes to up to 25 users at a time to the next rank in the hierarchy, as set by `/setranks`')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('The 1st user to promote')
        .setRequired(true))

for (let i = 2; i <= 25; i++) {
  data.addUserOption(option =>
      option.setName(`user${i}`)
        .setDescription(`The ${toOrdinal(i)} user to promote`)
        .setRequired(false))
}
  
export default {
  data,
  execute: async (interaction) => {
    const { role_ids } = await getGuildRecord(interaction.guild.id)
    
    if (!interaction.member.roles.includes(role_ids.ticket_handler)) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! This command can only be used by a <@&${ticket_handler}>`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }      
    }

    if (!role_ids.ranks) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! No rank hierarchy could be found, first set one with \`/setranks\``,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
    }

    const users = interaction.data.options.map(user => user.value)
    logger.info({ users, interaction }, 'promote')
    
    // Promote users in parallel
    promoteUsers(interaction, role_ids.ranks, users)
    
    return {
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Loading...',
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}

async function promoteUsers(interaction, ranks, users) {
  const results = await Promise.all(users.map(async user_id => {
    const user = await discordRequest(`/guilds/${interaction.guild.id}/members/${user_id}`, { method: 'GET' })
    const intersection = ranks.flatMap((rank, index) => user.roles.includes(rank) ? [index] : [])
    
    if (intersection.length == 0) {
      return [false, `<@${user_id}> has no rank`]
    }
    if (intersection.length > 1) {
      return [false, `<@${user_id}> has too many ranks`]
    }
  
    const [rankIndex] = intersection

    if (rankIndex == 0) {
      return [false, `<@${user_id}> is already at the maximum rank`]
    }
    
    const nextRank = ranks[rankIndex - 1]
    
    assignRole(interaction.guild.id, nextRank, user_id)
    removeRole(interaction.guild.id, ranks[rankIndex], user_id)
  
    return [true, `<@${user_id}> promoted to <@&${nextRank}>`]
  }))

  const failures = results.filter(([isSuccess, message]) => !isSuccess)
  const header = failures.length > 0 ? `Completed with ${failures.length} failures:\n` : 'Completed successfully:\n'

  await discordRequest(
    `/webhooks/${process.env.APP_ID}/${interaction.token}/messages/@original`, { 
      method: 'PATCH', 
      body: { content: header + results.map(([isSuccess, message]) => `${isSuccess ? '✅' : '❌'} ${message}`).join('\n') } 
    }
  )
}