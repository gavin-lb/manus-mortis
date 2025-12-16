import fs from 'node:fs'
import path from 'node:path'
import { type ClientEvents } from 'discord.js'

export type EventHandlers = {[ Event in keyof ClientEvents ]?: (...args: ClientEvents[Event]) => void}

const getHandlers = (method: 'on' | 'once'): EventHandlers => {
  const handlers = fs.readdirSync(
    path.join(__dirname, method), { withFileTypes: true }
  ).map(
    file => {
      const { name, handle } = require(path.join(file.parentPath, file.name))
      return [name, handle]
    }
  )
    
  return Object.fromEntries(handlers)
}

export const eventHandlers = {
  on: getHandlers('on'),
  once: getHandlers('once')
}
