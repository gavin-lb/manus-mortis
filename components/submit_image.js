import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { submitImage, answerQuestion } from '/gadget/app/utils'

export default async (interaction, question_id) => {
  const url = await submitImage(interaction)
  return url ? await answerQuestion(
    question_id,
    interaction,
    url,
  ) : {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: '❌No image could be found. Please follow the instructions above. If you require assistance you can request help by first clicking the grey 🔧 button above and then the `❓Request help` button'
    }
  }
}