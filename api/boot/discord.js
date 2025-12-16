import { logger } from 'gadget-server'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { eventHandlers } from '/gadget/app/events'

/**
 * Server boot plugin
 *
 * @param { Server } server - server instance to customize
 *
 * @see {@link https://www.fastify.dev/docs/latest/Reference/Server}
 */
export default async function (server) {
  if (process.env.NODE_ENV == 'development'){
    return
  }
  
  const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildVoiceStates
  ] })
  
  // Register events
  for (const [method, events] of Object.entries(eventHandlers)) {
    for (const [event, callback] of Object.entries(events)) {
      client[method](Events[event], callback)
    }
  }

  // Login to client
  await client.login(process.env.DISCORD_TOKEN)

  // Check whether connected every 10 seconds and reconnect if disconnected
  setInterval(async () => {
    if (client.ws.status === 5) {
      await client.destroy()

      logger.info("Reconnecting Discord client with uuid: %s", client.uuid)
      await client.login(process.env.DISCORD_TOKEN)
    }
  }, 10000).unref()

  // Add discord client to request context
  server.addHook('onRequest', async (request) => {
    request.discord = client
  })
 
  // Disconnect when Server instance shuts down
  server.addHook('onClose', async () => {
    logger.info('Destroying client with uuid: %s', client.uuid)
    await client.destroy()
  })
}