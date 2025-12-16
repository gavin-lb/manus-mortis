import { api, logger } from 'gadget-server'

export default async function(message) {
  logger.debug({ messageEvent: message }, 'Message event')
  
  if (message.author.bot)
    return

  const points = await api.internal.points.upsert({
    user_id: message.author.id, 
    guild_id: message.guild.id, 
    _atomics: { 
      message_count: { increment: 1 },
    }, 
    on: ['user_id', 'guild_id']
  })

  api.points.update(points.id)  // to update points value
}