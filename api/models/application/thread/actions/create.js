import { applyParams, save, ActionOptions, CreateApplicationThreadActionContext } from "gadget-server"
import { createPrivateThread, sendMessage, handleApplicationButton } from '/gadget/app/utils'
import { ActionRowBuilder } from 'discord.js'

/**
 * @param { CreateApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  const form = await api.application.form.findOne(params.thread.form._link)
  params.thread.thread_id = await createPrivateThread(params.thread.channel_id, `📧@${params.thread.owner.global_name ?? params.thread.owner.username} - ${form.title}`)

  const question = await api.application.question.findFirst({
    filter: { formId: { equals: form.id }, number: { equals: 1 } }
  })

  sendMessage(
    params.thread.thread_id,
    `Hello <@${params.thread.owner.id}>! Welcome to Manus Mortis. Our bot will guide you through a brief questionnaire. Kindly provide the requested answers.`,
    `Q${question.number}. ${question.title}`,
    question.body,
    [{ type: 1, components: question.components.concat(handleApplicationButton) }]
  )

  applyParams(params, record)
  await save(record)

  // schedule reminder
  api.enqueue(
    api.application.thread.reminder,
    { id: record.id },
    { startAt: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString() } // Remind in 1 hour
  )

  // schedule second reminder
  api.enqueue(
    api.application.thread.reminder,
    { id: record.id },
    { startAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString() } // Remind in 22 hours
  )

  // Schedule automatic denial
  api.enqueue(
    api.application.thread.timeout,
    { id: record.id },
    { startAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() } // Timeout in 24 hours
  )
}

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
}
