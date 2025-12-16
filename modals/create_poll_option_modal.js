import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { buildPollComponents } from '/gadget/app/utils'

export default async (interaction, record_id, option) => {
  const record = await api.create_poll.findOne(record_id)
  record.options[option] = interaction.data.components[0].components[0].value
  api.create_poll.update(record_id, { options: record.options })

  return {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
  }
}