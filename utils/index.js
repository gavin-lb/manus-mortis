import fs from 'node:fs'

/**
 * Dynamically exports all utility functions from all files in this directory to allow for better code
 * organisation whilst still maintaining easier imports, eg. `import { discordRequest } from '/gadget/app/utils'`
 * rather than `import { discordRequest } from '/gadget/app/utils/discord'`, where the latter would require 
 * remembering which specific file every utility function is in.
 * 
 * Since the importing and exporting is handled dynamically, this index file doesn't require updating
 * everytime a new file for utility functions is created. 
**/

module.exports = Object.assign(
  {}, 
  ...fs.readdirSync(__dirname)
    .filter(file => file != __filename)
    .map(file => require(`./${file}`))
)
