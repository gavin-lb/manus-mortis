import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createPrivateThread, sendMessage, discordRequest } from './discord'
import { getGuildRecord } from './gadget'
import { api } from 'gadget-server'

export async function openTicket(guild_id, owner, title, body) {
  const guildRecord = await getGuildRecord(guild_id)

  if (!guildRecord.ticket_channel) {
    throw new Error('No ticket channel set!')
  }

  const thread_title = `📧@${owner.global_name ?? owner.username} - ${title}`
  const thread_id = await createPrivateThread(guildRecord.ticket_channel, thread_title)
  const message = await sendMessage(thread_id, `<@&${guildRecord.role_ids.ticket_handler}> <@${owner.id}>`, title, body, [
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`handle_ticket`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔧'))
  ])

  api.ticket.create({
    guild: { _link: guildRecord.id },
    owner_id: owner.id,
    owner_name: owner.global_name,
    message_id: message.id,
    title,
    body,
    thread_id,
    thread_title
  })

  return thread_id
}

export async function closeTicket(ticketRecord) {
  const thread = await discordRequest(`/channels/${ticketRecord.thread_id}`, { method: 'GET' })
  await discordRequest(`/channels/${ticketRecord.thread_id}`, {
    method: 'PATCH', body: {
      name: '✅Resolved: ' + thread.name.slice(1),
      archived: true,
      locked: true
    }
  })
}