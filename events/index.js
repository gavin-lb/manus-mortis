import fs from 'node:fs'
import path from 'node:path'
import { toTitleCase } from '/gadget/app/utils'

const methods = ['on', 'once']
export const eventHandlers = Object.fromEntries(methods.map(method => [
  method,
  Object.fromEntries(
    fs.readdirSync(
      path.join(__dirname, method), { withFileTypes: true }
    )
      .map(
        file => [
          toTitleCase(path.parse(file.name).name),
          require(path.join(file.parentPath, file.name)).default
        ]
      )
  )
]))
