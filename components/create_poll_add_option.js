import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js'
import { InteractionResponseType } from 'discord-interactions'
import { api } from 'gadget-server'

export default async (interaction, record_id) => {
  const record = await api.create_poll.findOne(record_id)

  if (record.options.length == 10) {
    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    }
  }
  
  return {
    type: InteractionResponseType.MODAL,
    data: new ModalBuilder()
      .setCustomId(`create_poll_add_option_modal ${record_id}`)
      .setTitle('Add Option')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('option')
            .setLabel("Option:")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(55)
            .setPlaceholder('The poll option')
        )
    )
  }
}