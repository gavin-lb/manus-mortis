import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import {
  ActionRowBuilder, 
  ButtonBuilder,
  ButtonStyle
} from 'discord.js'
import dedent from 'dedent'

export default async () => ({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    flags: InteractionResponseFlags.EPHEMERAL,
    embeds: [{
      title: 'Civilian Jobs:',
      description: dedent`
        - **🏛️ Mayor**: 
          - Leads and organizes a homestead
          - Manages building, farming, and local defense
          - Keeps things running smoothly and connects the homestead with the wider region
        - **🧙 Mentor**: 
          - Supports new and returning players by teaching game basics, answering questions, and helping them get settled
          - Friendly guides who make the early experience smoother and more welcoming
        - **⚖️ Magistrate**: 
          - Leads group tasks like lumber runs, mining expeditions, and other homestead projects
          - Helps coordinate settlers, keep things organized, and ensures tasks are completed efficiently
        - **🗡️ Quartermaster**: 
          - Manages supplies and storage for all [MM] homesteads
          - Keeps track of resources, organizes stockpiles, and ensures everyone has what they need for building, farming, and defense
      `,
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