import { answerQuestion } from '/gadget/app/utils'

export default async (interaction) => {
  const question_id = interaction.data.components[0].components[0].custom_id
  const answer = interaction.data.components.length > 1 ?
    interaction.data.components.map((question) => question.components[0].value) :
    interaction.data.components[0].components[0].value

  return await answerQuestion(
    question_id,
    interaction,
    answer
  )
}