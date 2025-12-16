import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions'
import { toSnakeCase } from '/gadget/app/utils'

export default async function route({ request, reply, logger }) {
  try {
    return reply.send(await handleInteraction(request.body))
  } catch (err) {
    logger.error({ err })
    return reply.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: '⚠️ Oops! Something went wrong...'
      }
    })
  }
}

async function handleInteraction(interaction) {
  let name, args
  if (interaction?.data?.custom_id) {
    [name, ...args] = interaction.data.custom_id.split(' ')
  }
  
  switch (interaction.type) {
    case InteractionType.PING:
      return { type: InteractionResponseType.PONG }

    case InteractionType.APPLICATION_COMMAND:
      const { default: command } = require(`/gadget/app/commands/${toSnakeCase(interaction.data.name)}`)
      return await command.execute(interaction)
      
    case InteractionType.MESSAGE_COMPONENT:
      const { default: component } = require(`/gadget/app/components/${name}`)
      return await component(interaction, ...args)

    case InteractionType.MODAL_SUBMIT:
      const { default: modal } = require(`/gadget/app/modals/${name}`)
      return await modal(interaction, ...args)

    default:
      logger.error({ interaction }, 'Unhandled interaction')
      throw new Error('Unhandled interaction')
  }
}