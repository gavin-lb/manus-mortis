import { DeployCommandsGlobalActionContext } from 'gadget-server'
import { discordRequest } from '/gadget/app/utils'
import fs from 'node:fs'
import path from 'node:path'

const COMMAND_DIR = '/gadget/app/commands'

export async function run() {
  fs.readdir(COMMAND_DIR, async (err, files) => {
    if (err) {
      console.error(err)
      return err
    }

    const commands = files.map(
      file => require(path.join(COMMAND_DIR, file)).default.data.toJSON()
    )
    
    try {
      await discordRequest(
        `/applications/${process.env.APP_ID}/commands`,
        { method: 'PUT', body: commands }
      )
      console.log('Registered commands:', commands.map(ele => ele.name).join(', '))
      return commands
    } catch (err) {
      console.error(err)
      return err
    }
  })

  
}

export const options = { triggers: {} }