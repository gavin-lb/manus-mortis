import { InteractionResponseType } from 'discord-interactions'
import {
  ModalBuilder, 
  ActionRowBuilder, 
  TextInputBuilder, 
  TextInputStyle 
} from 'discord.js'


export default async () => ({
  type: InteractionResponseType.MODAL,
  data: new ModalBuilder()
    .setCustomId('deny_modal')
    .setTitle('Application comments')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('deny_modal')
          .setLabel('Why you are denying the application?')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Enter your comments here')
      )
    )
})