import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { buildPollComponents } from '/gadget/app/utils'

export default async (interaction, record_id, option) => {
  const record = await api.create_poll.findOne(record_id)
    
  record.options.push(interaction.data.components[0].components[0].value)

  // when the new option would add more than 5 actionrows we need to create a new message
  if (record.options.length % 5 == 4) {
    record.tokens.push(interaction.token)
    api.create_poll.update(record_id, { options: record.options, tokens: record.tokens })
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: '\u200B',
      }
    } 
  } else {
    api.create_poll.update(record_id, { options: record.options })
    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
    }
  }
}