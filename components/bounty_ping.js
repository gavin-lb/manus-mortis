import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { getGuildRecord, discordRequest } from '/gadget/app/utils'

export default async (interaction) => {
  const { role_ids: { reactor } } = await getGuildRecord(interaction.guild.id)
  
  await discordRequest(
    `/guilds/${interaction.guild.id}/members/${interaction.member.user.id}/roles/${reactor}`,
    { method: 'PUT' }
  )
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: `✅ <@&${reactor}> role added, you will get pings for new bounties!`,
    }
  }
}