import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { discordRequest } from '/gadget/app/utils'
import { logger, api } from 'gadget-server'

export default async (interaction, record_id) => {
  logger.info({ interaction }, 'poll role confirm')
  const record = await api.assign_poll_role.findOne(record_id)
  if (!record.role_id) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: `❌ Error: missing role to assign - please select a role and reconfirm`,
      }
    }
  }

  if (!record.answer_id) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: `❌ Error: missing answer - please select an answer and reconfirm`,
      }
    }
  }

  let resp = await discordRequest(`/channels/${record.channel_id}/polls/${record.message_id}/answers/${record.answer_id}?limit=100`, { method: 'GET' })
  
  if (!resp) {
    return {
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: `❌ Error: the bot does not have permission to view the users who answered this poll`,
        components: []
      }
    }  
  }
  
  const users = resp.users
  
  while (resp.users.length == 100) {
    resp = await discordRequest(`/channels/${record.channel_id}/polls/${record.message_id}/answers/${record.answer_id}?limit=100&after=${users.at(-1)}`, { method: 'GET' })
    users.push(...resp.users)
  }
  
  users.forEach(user => {
    discordRequest(`/guilds/${interaction.guild.id}/members/${user.id}/roles/${record.role_id}`, { method: 'PUT' })
    logger.info({ role: record.role_id, user_id: user.id }, 'added role to user')
  })
  
  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: `✅ Assigned roles`,
      components: []
    }
  }
}