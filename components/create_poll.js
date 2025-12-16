import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js'
import { InteractionResponseType } from 'discord-interactions'
import { api } from 'gadget-server'
import { discordRequest } from '/gadget/app/utils'

export default async (interaction, record_id) => {
  const record = await api.create_poll.findOne(record_id)

  record.tokens.forEach(token => discordRequest(`/webhooks/${process.env.APP_ID}/${token}/messages/@original`, { method: 'DELETE' }))
  
  discordRequest(`/channels/${interaction.channel.id}/messages`, { method: 'POST', body: { 
    poll: {
      question: {
        text: record.title
      },
      answers: record.options.map((option, i) => ({
        answer_id: i,
        poll_media: {
          text: option
        }
      }))
    }
  }})
  
  return {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
  }
}
