import { api, logger } from 'gadget-server'

const API_URL = 'https://discord.com/api/v10/' 

/**
 * Makes a request to the Discord API.
 *
 * @param {String} endpoint - The API endpoint to which the request is sent.
 * @param {Object} options - An object containing options for the request.
 * @property {string} options.method - The method of the request, eg. 'GET', 'POST', etc.
 * @property {Object} [options.body] - Where applicable, the body of the request as a JSON encodable object (optional).
 * @return {Object} - An object corresponding to the JSON response to the request.
 */
export async function discordRequest(endpoint, options) {

  const res = await fetch(
    API_URL + endpoint, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'Manus Mortis Bot',
      },
      method: options.method,
      body: JSON.stringify(options.body)
    }
  )

  if (res.status == 429) {
    logger.warn({ res }, 'Rate limited')
    throw new Error('Rate limited')
  }
  
  try {
    const data = await res.json()
    if (!res.ok) {
      throw new Error(JSON.stringify(data))
    }
    return data
  } catch (err) {
    if (!err instanceof SyntaxError) {
      logger.error({ err }, 'discordRequest error')
    }
    return {}
  } 
}

export async function createPrivateThread(channel_id, name) {
  const thread = await discordRequest(`/channels/${channel_id}/threads`, {
    method: 'POST', body: {
      name,
      type: 12,
      invitable: false
    }
  })

  return thread.id
}

export async function sendMessage(channel_id, content, title, description, components, allowed_mentions) {
  return await discordRequest(`/channels/${channel_id}/messages`, {
    method: 'POST', body: {
      content, embeds: title && description ? [{ title, description, color: 5793266 }] : undefined, components, allowed_mentions
    }
  })
}

export async function createRole(guild_id, name) {
  const res = await discordRequest(`/guilds/${guild_id}/roles`, {
    method: 'POST', body: { name }
  })
  return res.id
}

export async function assignRole(guild_id, role_id, user_id) {
  discordRequest(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, { method: 'PUT' })
}

export async function removeRole(guild_id, role_id, user_id) {
  discordRequest(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, { method: 'DELETE' })
}