import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js'
import { InteractionResponseType } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction, record_id, option) => {
  const record = await api.create_poll.findOne(record_id)
  
  return {
    type: InteractionResponseType.MODAL,
    data: new ModalBuilder()
      .setCustomId(`create_poll_option_modal ${record_id} ${option}`)
      .setTitle('Edit Option')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('option')
            .setLabel("Option:")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(55)
            .setPlaceholder('The poll option')
            .setValue(record.options[option])
        )
    )
  }
}