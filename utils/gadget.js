import { api } from 'gadget-server'

export async function getGuildRecord(guild_id) {
  const guild = await api.guild.findFirst({
    filter: {
      guild_id: {
        equals: guild_id,
      },
    },
  })
  return guild
}