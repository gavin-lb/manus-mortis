import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction) => {
  const { id } = await api.ticket.findFirst({
    filter: { thread_id: { equals: interaction.channel.id } }
  })
  await api.ticket.close(id)

  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: '✅ Ticket closed', components: []
    }
  }
}