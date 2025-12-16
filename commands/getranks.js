import { SlashCommandBuilder, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { getGuildRecord } from '/gadget/app/utils'

export default {
  data: new SlashCommandBuilder()
    .setName('getranks')
    .setDescription('Displays the rank hierarchy')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    const { role_ids } = await getGuildRecord(interaction.guild.id)
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🎖**Rank hierarchy:**\n${role_ids.ranks.map((rank, i) => ` **${i+1}.** <@&${rank}>`).join('\n')}\n-# (from highest to lowest)`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}