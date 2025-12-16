import { api, logger } from 'gadget-server'
import { getGuildRecord } from '/gadget/app/utils'

export default async function(oldState, newState) {
  logger.debug({ oldState, newState }, 'Voice event')
  
  const [points, { afk_voice_channels }] = await Promise.all([
    api.internal.points.upsert({ 
      user_id: oldState.id, 
      guild_id: oldState.guild.id, 
      on: ['user_id', 'guild_id'] 
    }), 
    getGuildRecord(oldState.guild.id)
  ])

  const oldChannel = oldState.channelId
  const newChannel = newState.channelId
  const afk = afk_voice_channels.includes(newChannel)
  const inVoice = points.joined_voice_time !== null
  
  const join = (template) => {
    logger.info(template, points.user_id, newChannel)
    api.points.update(points.id, { 
      joined_voice_time: new Date().toISOString() 
    })
  }
  
  const leave = async (template) => {
    const seconds = Math.floor((Date.now() - points.joined_voice_time) / 1000)
    logger.info(template, points.user_id, seconds)
    await api.internal.points.update(points.id, { 
      joined_voice_time: null, 
      _atomics: {
        seconds_in_voice: {
          increment: seconds
        }
      }
    })
    api.points.update(points.id)  // to update points value
  }
  
  if (!oldChannel && newChannel) {
    if (!afk){
      join('User %s joined voice channel %s')
    }
  } else if (oldChannel && !newChannel) {
    if (inVoice) {
      leave('User %s disconnected, they spent %ss in voice')      
    }
  } else if (oldChannel != newChannel) {
    if (afk && inVoice) {
      leave('User %s went afk, they spent %ss in voice')
    } else if (!afk && !inVoice) {
      join('User %s switched from afk to channel %s')
    }
  }
}