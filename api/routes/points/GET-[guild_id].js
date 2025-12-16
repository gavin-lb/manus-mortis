import { RouteHandler } from "gadget-server"
import { discordRequest } from '/gadget/app/utils'

/**
 * Route handler for GET leaderboard/[guild_id]
 *
 * @type { RouteHandler } route handler - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
export default async ({ request, reply, api, logger, connections }) => {
  let users = await api.points.findMany({
    first: 250,
    filter: {
      guild_id: {
        equals: request.params.guild_id
      }
    }, 
    sort: {
      value: 'Descending'
    }
  })
  
  if (!users.length)
    return reply.code(404).send(`No guild found with id: ${request.params.guild_id}`)
  
  const lines = ['discord_id, training_count, react_count, seconds_in_voice, referral_count, message_count, other, points']
  do {
    lines.push(...users.map(user => `${user.user_id}, ${user.training_count}, ${user.react_count}, ${user.seconds_in_voice}, ${user.referral_count}, ${user.message_count}, ${user.other}, ${user.value}`))
  } while (users = users.hasNextPage && await users.nextPage())
  
  return lines.join('\n')    
}
