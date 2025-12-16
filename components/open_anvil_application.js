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
      title: 'What kind of Anvil Empires role are you interested in?',
      description: `**Member**:
      You want to become a member of the Manus Mortis clan.

      **Diplomat:**
      You are a member of another clan and want to work with Manus Mortis.

      Please click the appropriate button below.`,
      color: 5793266
    }],
    components:
      [new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`open_application anvil_member`)
            .setLabel('Member')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🛡'),
          new ButtonBuilder()
            .setCustomId(`open_application anvil_diplomat`)
            .setLabel('Diplomat')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🌐')
        )]
  }
})