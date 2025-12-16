import { applyParams, save, ActionOptions, UpdateApplicationThreadActionContext } from "gadget-server";
import { discordRequest, getGuildRecord } from '/gadget/app/utils'
import { EmbedBuilder } from 'discord.js'

/**
 * @param { UpdateApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  params.thread.status = 'accepted'

  const embed = new EmbedBuilder()
  	.setColor(0x5865F2)
  	.setTitle('Congratulations!')
  	.setDescription('Your application to Manus Mortis has been accepted!\n\u200B')
  	.setFooter({ text: `Handled by ${params.thread.handled_by}`, iconURL: 'https://i.imgur.com/LI0agMJ.png' })
    .setTimestamp()
  
  //Send message to user
  await discordRequest(`/channels/${record.thread_id}/messages`, {
    method: 'POST', body: {
      content: `<@${record.owner.id}>`, embeds: [embed]
    }
  })
  
  //Give user relevent role
  const [form, guild] = await Promise.all([
    api.application.form.findOne(record.form),
    api.guild.findOne(record.guild)
  ])

  const role_ids = guild.role_ids[form.name].hasOwnProperty(record.allegiance) ? guild.role_ids[form.name][record.allegiance] : guild.role_ids[form.name]
  role_ids.forEach(role_id => discordRequest(`/guilds/${guild.guild_id}/members/${record.owner.id}/roles/${role_id}`, { method: 'PUT' }))

  // Update thread title
  discordRequest(`/channels/${record.thread_id}`, {
    method: 'PATCH', body: {
      name: `✅Accepted: @${record.owner.global_name ?? record.owner.username} - ${(await api.application.form.findOne(record.form)).title}`,
      archived: true,
      locked: true
    }
  })

  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
