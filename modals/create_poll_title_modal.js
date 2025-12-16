import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { buildPollComponents } from '/gadget/app/utils'

export default async (interaction, record_id) => {
  api.create_poll.update(record_id, {
    title: interaction.data.components[0].components[0].value,
  })

  return {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
  }
}