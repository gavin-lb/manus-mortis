import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { discordRequest } from '/gadget/app/utils'

export default async (interaction, record_id, option) => {
  const record = await api.create_poll.findOne(record_id)

  if (record.options.length == 2) {
    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    }
  }

  record.options.splice(option, 1)
  
  if (record.options.length % 5 == 3) {
    discordRequest(`/webhooks/${process.env.APP_ID}/${record.tokens.pop()}/messages/@original`, { method: 'DELETE' })
  }
  
  api.create_poll.update(record_id, { options: record.options, tokens: record.tokens })
  
  return {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
  }
}