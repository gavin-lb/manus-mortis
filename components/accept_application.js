import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction) => {
  const { id } = await api.application.thread.findFirst({ 
    filter: { thread_id: { equals: interaction.channel.id } } 
  })
  
  api.application.thread.accept(id, { handled_by: interaction.member.user.global_name })
  
  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL, content: '✅ Application accepted', embeds: [], components: []
    }
  }
}