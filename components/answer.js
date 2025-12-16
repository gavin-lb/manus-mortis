import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { answerQuestion, getGuildRecord, discordRequest } from '/gadget/app/utils'
import { api } from 'gadget-server'

export default async (interaction, question_id, response_index) => {
  const thread = await api.application.thread.findFirst({
    filter: { thread_id: { equals: interaction.channel.id } }
  })

  if (interaction.member.user.id != thread.owner.id) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '⚠️ Error: only the applicant can answer questions',
        flags: InteractionResponseFlags.EPHEMERAL
      }
    }
  }

  const question = await api.application.question.findOne(question_id)

  // An index of -1 means we need to ask for text input with a modal
  if (response_index == -1) {
    return {
      type: InteractionResponseType.MODAL,
      data: question.modal ?? {
        "title": "Submit answer",
        "custom_id": "answer_modal",
        "components": [
          {
            "type": 1,
            "components": [
              {
                "type": 4,
                "label": question.title,
                "style": 1,
                "custom_id": question.id,
                "placeholder": "Enter your response here"
              }
            ]
          }
        ]
      }
    }
  } else {
    const { role, allegiance, deny, value } = question.responses[response_index]
    var response = question.responses[response_index].reply

    if (role) {
      const { role_ids } = await getGuildRecord(interaction.guild.id)
      discordRequest(
        `/guilds/${interaction.guild.id}/members/${interaction.member.user.id}/roles/${role_ids[role]}`,
        { method: 'PUT' }
      )
      response = response.replace(role, role_ids[role])
    }

    if (allegiance) {
      await api.application.thread.update(thread.id, { allegiance })
    }

    return await answerQuestion(
      question_id,
      interaction,
      value,
      response,
      deny
    )
  }
}