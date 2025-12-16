import { logger } from 'gadget-server'
import { Events, type ClientEvents } from 'discord.js'

export const name = Events.ClientReady

export function handle(...args: ClientEvents[typeof name]): void {
  const [client]: [typeof args[0] & { uuid?: string }] = args
  client.uuid = crypto.randomUUID()
  logger.info(`Ready! Logged in as ${client.user.username} with uuid: ${client.uuid}`)
}