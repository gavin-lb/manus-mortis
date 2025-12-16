import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { buildPollComponents } from '/gadget/app/utils'

export default async (interaction, record_id, option) => {
  if (option == 0) {
    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    }
  }

  const record = await api.create_poll.findOne(record_id)

  const index = parseInt(option)
  const temp = record.options[index]
  record.options[index] = record.options[index - 1]
  record.options[index - 1] = temp
  
  api.create_poll.update(record_id, { options: record.options })
  
  return {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
  }
}