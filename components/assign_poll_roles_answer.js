import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { logger, api } from 'gadget-server'

export default async (interaction, record_id) => {
  logger.info({ interaction, record_id }, 'poll answer interaction' )
  api.assign_poll_role.update(record_id, {answer_id: interaction.data.values[0]})
  return { type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE }
}