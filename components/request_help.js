import { InteractionResponseType } from 'discord-interactions'
import { getGuildRecord, sendMessage } from '/gadget/app/utils'
import { api } from 'gadget-server'

export default async (interaction) => {
  const { role_ids: { ticket_handler } } = await getGuildRecord(interaction.guild.id)

  const thread = await api.application.thread.findFirst({
    filter: { thread_id: { equals: interaction.channel.id } }
  })

  sendMessage(
    interaction.channel.id,
    `<@&${ticket_handler}> Please assist <@${interaction.member.user.id}> with their application`,
    undefined,
    undefined,
    undefined,
    { parse: ["roles"] }
  )

  api.application.thread.update(thread.id, { status: "pending" })

  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      content: `✅ Help requested, a <@&${ticket_handler}> will assist you as soon as possible`, embeds: [], components: []
    }
  }
}