import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js'
import { InteractionResponseType } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction, record_id) => {
  const record = await api.create_poll.findOne(record_id)
  
  return {
    type: InteractionResponseType.MODAL,
    data: new ModalBuilder()
      .setCustomId(`create_poll_title_modal ${record_id}`)
      .setTitle('Edit Poll Title')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Poll title:")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(300)
            .setPlaceholder('The title of the poll')
            .setValue(record.title)
        )
    )
  }
}