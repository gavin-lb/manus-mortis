import { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, PermissionFlagsBits } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api, logger } from 'gadget-server'
import { buildPollComponents } from '/gadget/app/utils'

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Create Poll')
  	.setType(ApplicationCommandType.Message)
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendPolls),

  execute: async (interaction) => {    
    const [message_id, message] = Object.entries(interaction.data.resolved.messages)[0]
  
    const record = await api.create_poll.create({
      title: message.content.slice(0, 300),
      tokens: [interaction.token],
    })

    const components = buildPollComponents(record.title, record.options, record.id)
      
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: '-# Click on a field to edit it',
        components
      }
    }
  }
}