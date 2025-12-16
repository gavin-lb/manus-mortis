import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import {
  ActionRowBuilder, 
  ButtonBuilder,
  ButtonStyle
} from 'discord.js'


export default async () => ({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    flags: InteractionResponseFlags.EPHEMERAL,
    embeds: [{
      title: 'What kind of Warborne role are you interested in?',
      description: `**Member**:
      You want to become a member of the Manus Mortis clan.

      Please click the appropriate button below.`,
      color: 5793266
    }],
    components:
      [new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`open_application warborne`)
            .setLabel('Member')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🚀'),
        )]
  }
})