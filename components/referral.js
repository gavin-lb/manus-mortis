import { api, logger } from 'gadget-server'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { discordRequest, finaliseApplication } from '/gadget/app/utils'
import values from '/gadget/app/api/models/points/values.json'

export default async (interaction, thread_id) => {
  const referral_id = interaction.data.values[0]

  if (referral_id == interaction.member.user.id) {
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ You cannot refer yourself! Nice try though :p`,
          flags: InteractionResponseFlags.EPHEMERAL
        }
      }
  }
  
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
    value: `<@${referral_id}>`,
  })

  logger.info('%s was referred by %s', interaction.member.user.id, referral_id)
  api.internal.points.upsert({
      user_id: referral_id, 
      guild_id: interaction.guild.id, 
      _atomics: { 
        referral_count: { increment: 1 }, 
        value: { increment: values.referral }
      }, 
      on: ['user_id', 'guild_id']
    })
  
  await discordRequest(`/channels/${interaction.channel.id}/messages/${interaction.message.id}`, { 
    method: 'PATCH', 
    body: {
      components: [],
      embeds: [{
        title,
        color,
        description: description + `\n\n${'⎯'.repeat(16)}\n**Answered:** <@${referral_id}>`
      }]
    }
  })
  
  await finaliseApplication(interaction, thread_id)
  
  return { type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE }
}