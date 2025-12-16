import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction) => {
  const { id } = await api.application.thread.findFirst({
    filter: { thread_id: { equals: interaction.channel.id } }
  })

  api.application.thread.deny(id, { 
    comments: interaction.data.components[0].components[0].value, 
    handled_by: interaction.member.user.global_name 
  })
  
  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL, content: '⛔ Application denied', embeds: [], components: []
    }
  }
}