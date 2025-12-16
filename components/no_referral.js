import { api } from 'gadget-server'
import { InteractionResponseType } from 'discord-interactions'
import { discordRequest, finaliseApplication } from '/gadget/app/utils'

export default async (interaction, thread_id) => {
    
  const { embeds: [{ title, color, description }] } =  await discordRequest(
    `/channels/${interaction.channel.id}/messages/${interaction.message.id}`,
    { method: 'GET' }
  )

  api.application.answer.create({
    channel_id: interaction.channel.id,
    respondent_id: interaction.member.user.id,
    title: 'Were you referred to Manus Mortis by someone?',
    thread: {
      _link: thread_id,
    },
    value: 'No referral',
  })
  
  await discordRequest(`/channels/${interaction.channel.id}/messages/${interaction.message.id}`, { 
    method: 'PATCH', 
    body: {
      components: [],
      embeds: [{
        title,
        color,
        description: description + `\n\n${'⎯'.repeat(16)}\n**Answered:** No referral`
      }]
    }
  })
  
  await finaliseApplication(interaction, thread_id)
  
  return { type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE }
}