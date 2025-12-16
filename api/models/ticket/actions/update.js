import { applyParams, save, ActionOptions, UpdateTicketActionContext } from "gadget-server";
import { discordRequest } from '/gadget/app/utils'

/**
 * @param { UpdateTicketActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  if (params.ticket.title != record.title) {
    // Update thread title
    discordRequest(`/channels/${record.thread_id}`, {
      method: 'PATCH', body: {
        name: `📧@${record.owner_name} - ${params.ticket.title}`,
      }
    })
    params.ticket.thread_title = `📧@${record.owner_name} - ${params.ticket.title}`
  }

  // Update embed
  discordRequest(`/channels/${record.thread_id}/messages/${record.message_id}`, {
    method: 'PATCH', body: {
      embeds: [{
        title: params.ticket.title, description: params.ticket.body, color: 5793266,
        footer: {
          text: 'Last edited: ',
        },
        timestamp: new Date().toISOString()
      }],

    }
  })

  applyParams(params, record)
  await save(record)
}

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
}
