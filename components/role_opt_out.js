import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { discordRequest } from '/gadget/app/utils'

export default async (interaction, role_id) => {
  console.log(JSON.stringify(interaction))
  discordRequest(`/guilds/${interaction.guild.id}/members/${interaction.member.user.id}/roles/${role_id}`, { method: 'DELETE' })
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: `✅ Your <@&${role_id}> role has been removed`
    }
  }
}