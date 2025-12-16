import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  UserSelectMenuBuilder,
} from 'discord.js'
import { InteractionResponseType } from 'discord-interactions'
import { api } from 'gadget-server'
import { discordRequest, sendMessage } from './discord'
import { getGuildRecord } from './gadget'


export const handleApplicationButton = new ButtonBuilder()
  .setCustomId(`handle_application`)
  .setStyle(ButtonStyle.Secondary)
  .setEmoji('🔧')

export async function answerQuestion(question_id, interaction, answer = null, response, deny) {
  // Make database queries in parallel
  const [ thread, question ] = await Promise.all([
    api.application.thread.findFirst({
      filter: {
        thread_id: {
          equals: interaction.channel.id,
        },
      },
    }),
    api.application.question.findOne(question_id, { select: { formId: true, title: true, body: true, is_final: true, number: true, responses: true } })
  ])

  // if answer already exists, must be a duplicate question so delete it
  if (await api.application.answer.maybeFindFirst({ filter: { channel_id: { equals: interaction.channel.id }, questionId: { equals: question_id } } })) {
    await discordRequest(`/channels/${interaction.channel.id}/messages/${interaction.message.id}`, { method: 'DELETE' })
    return { type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE }
  }

  if (answer instanceof Array) {
    await discordRequest(`/channels/${interaction.channel.id}/messages/${interaction.message.id}`,
      {
        method: 'PATCH', body: {
          components: [],
          embeds: [{
            title: `Q${thread.number_answered}. ${question.title}`,
            color: 5793266,
            description: question.responses.map(
              (response, i) => {
                api.application.answer.create({
                  channel_id: interaction.channel.id,
                  respondent_id: interaction.member.user.id,
                  title: response.title,
                  thread: {
                    _link: thread.id,
                  },
                  question: {
                    _link: question_id,
                  },
                  value: answer[i],
                })

                return `**${response.title}**\n${response.body}\n\n${'⎯'.repeat(16)}\n**Answered:** ${answer[i]}\n`
              }
            ).join('\n\n')
          }]
        }
      }
    )
  } else if (answer) {
    api.application.answer.create({
      channel_id: interaction.channel.id,
      respondent_id: interaction.member.user.id,
      title: question.title,
      thread: {
        _link: thread.id,
      },
      question: {
        _link: question_id,
      },
      value: answer,
    })

    await discordRequest(`/channels/${interaction.channel.id}/messages/${interaction.message.id}`,
      {
        method: 'PATCH', body: {
          components: [],
          embeds: [{
            title: `Q${thread.number_answered}. ${question.title}`,
            color: 5793266,
            description: question.body + `\n\n${'⎯'.repeat(16)}\n**Answered:** ${answer}`
          }]
        }
      }
    )
  } else {
    await discordRequest(`/channels/${interaction.channel.id}/messages/${interaction.message.id}`,
      {
        method: 'PATCH', body: {
          components: []
        }
      }
    )
  }

  if (answer) {
    thread.number_answered += 1
    api.application.thread.update(thread.id, { number_answered: thread.number_answered })
  }

  if (deny) {
    api.application.thread.deny(thread.id, { comments: response })
  } else if (question.is_final) {
    await getReferral(interaction.channel.id, thread.number_answered, thread.id)
  } else {
    const next_question = await api.application.question.findFirst({ 
      filter: { formId: { equals: question.formId }, number: { equals: question.number + 1 }}
    })

    if (next_question.conditional && Object.entries(next_question.conditional).some(([condition, value]) => thread[condition] != value)) {
      // skipping question as thread doesn't meet the conditions
      return await answerQuestion(next_question.id, interaction)
    } else {
      // ask next question
      sendMessage(
        interaction.channel.id,
        response,
        `Q${thread.number_answered}. ${next_question.title}`,
        next_question.body,
        [{ type: 1, components: next_question.components.concat(handleApplicationButton) }],
        { parse: [] }
      )
    }
  }

  return { type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE }
}

export async function submitImage(interaction) {
  const messages = await discordRequest(`/channels/${interaction.channel.id}/messages`, { method: 'GET' })
  for (const { attachments: [file] } of messages) {
    if (file && file.content_type.startsWith('image'))
      return file.url
  }
}

export async function getReferral(channel_id, question_number, thread_id) {
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId(`referral ${thread_id}`)
    .setPlaceholder('Select referral user')
    .setMinValues(1)
    .setMaxValues(1)
  
  const cancel = new ButtonBuilder()
    .setCustomId(`no_referral ${thread_id}`)
    .setLabel('No referral')
    .setEmoji('❌')
    .setStyle(ButtonStyle.Primary)
  
  const row1 = new ActionRowBuilder()
    .addComponents(userSelect)
  const row2 = new ActionRowBuilder()
    .addComponents([cancel, handleApplicationButton])
  
  await sendMessage(
    channel_id, 
    'You\'re nearly there, this is the final question!', 
    `Q${question_number}. Were you referred to Manus Mortis by someone?`,
    'Did one of our members let you know about us?\n\n **If you were referred by someone**:\nPlease enter them in the menu below (you can type to refine the list). \n\n**If you weren\'t referred by anyone:**\nPlease press the "No referral" button.',
    [row1, row2]
  )
}

export async function finaliseApplication(interaction, thread_id) {
  await api.application.thread.update(thread_id, { status: 'pending' })
  
  const { role_ids: { ticket_handler } } = await getGuildRecord(interaction.guild.id)
  await sendMessage(
    interaction.channel.id,
    `Thank you for your answers. Your application will be reviewed by a <@&${ticket_handler}> as soon as possible.`,
    undefined,
    undefined,
    [{ type: 1, components: [handleApplicationButton] }]
  )
}