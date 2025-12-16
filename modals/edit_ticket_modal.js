import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction) => {
  const { id: ticket_id } = await api.ticket.findFirst({
    filter: { thread_id: { equals: interaction.channel.id } }
  })

  api.ticket.update(ticket_id, {
    title: interaction.data.components[0].components[0].value,
    body: interaction.data.components[1].components[0].value
  })

  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL, content: '✅ Ticket edited successfully', components: []
    }
  }
}