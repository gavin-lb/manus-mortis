import { SlashCommandBuilder, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: () => ({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Pong!', 
      flags: InteractionResponseFlags.EPHEMERAL 
    }
  })
}