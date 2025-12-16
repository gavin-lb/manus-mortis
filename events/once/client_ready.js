import { api, logger } from 'gadget-server'
import { getGuildRecord } from '/gadget/app/utils'

export default async function (client) {
  client.uuid = crypto.randomUUID()
  logger.info(`Ready! Logged in as ${client.user.tag} with uuid: ${client.uuid}`)

  client?.guilds?.cache?.forEach?.(async guild => {
    const { afk_voice_channels } = await getGuildRecord(guild.id)
    const users_in_voice = await api.points.findMany({
      filter: {
        guild_id: {
          equals: guild.id
        },
        joined_voice_time: {
          notEquals: null
        }
      }
    })

    guild?.voiceStates?.cache?.forEach?.(state => {
      if (
        !afk_voice_channels.includes(state.channel.id) &&
        !users_in_voice.some(user => user.user_id == state.id)
      ) {
        logger.info('New voice user %s found in channel %s', state.id, state.channel.id)
        api.points.upsert({
          user_id: state.id,
          guild_id: guild.id,
          joined_voice_time: new Date().toISOString(),
          on: ['user_id', 'guild_id']
        })
      }
    })
    
    users_in_voice.forEach(user => {
      if (guild.voiceStates.cache.every(
        state => state.id != user.user_id && !afk_voice_channels.includes(state.channel.id)
      )) {
        logger.info('Voice user %s vanished in guild %s', user.user_id, guild.id)
        api.points.upsert({
          user_id: user.user_id,
          guild_id: guild.id,
          joined_voice_time: null,
          on: ['user_id', 'guild_id']
        })
      }
    })
  })
}