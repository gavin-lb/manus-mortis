import { api, logger } from 'gadget-server'

/**
 * Makes a request to the Discord API by queuing it as a Gadget action.
 *
 * @param {String} endpoint - The API endpoint to which the request is sent.
 * @param {Object} options - An object containing options for the request.
 * @property {string} options.method - The method of the request, eg. 'GET', 'POST', etc.
 * @property {Object} [options.body] - Where applicable, the body of the request as a JSON encodable object (optional).
 * @return {Object} - An object corresponding to the JSON response to the request.
 */
export async function discordRequest(endpoint, options) {
  const task = await api.enqueue(
    api.discordRequest,
    { endpoint, method: options.method, body: JSON.stringify(options.body) }, 
    { retries: { retryCount: 16 } }
  )

  // A somewhat hacky fix to a gadget bug. Sometimes calling .result will 
  // randomly throw an error the first time, so we need to call it again. 
  try {
    return await task.result()
  } catch {
    return await task.result()
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