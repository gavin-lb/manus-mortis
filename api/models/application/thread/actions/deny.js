import { applyParams, save, ActionOptions, UpdateApplicationThreadActionContext } from "gadget-server";
import { discordRequest, sendMessage } from '/gadget/app/utils'
import { EmbedBuilder } from 'discord.js'

/**
 * @param { UpdateApplicationThreadActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  params.thread.status = 'denied'

  const embed = new EmbedBuilder()
  	.setColor(0x5865F2)
  	.setTitle('Comments:')
  	.setDescription(params.thread.comments + '\n\u200B')
  	.setFooter({ text: `Handled by ${params.thread.handled_by ?? 'Manus Mortis Bot'}`, iconURL: 'https://i.imgur.com/LI0agMJ.png' })
    .setTimestamp()
  
  //Send message to user
  await discordRequest(`/channels/${record.thread_id}/messages`, {
    method: 'POST', body: {
      content: `<@${record.owner.id}> Regrettably, your application to Manus Mortis has been denied at this time. Kindly refer to the following comments:`, 
      embeds: [embed]
    }
  })


  // Update thread title
  discordRequest(`/channels/${record.thread_id}`, {
    method: 'PATCH', body: {
      name: `⛔Denied: @${record.owner.global_name ?? record.owner.username} - ${(await api.application.form.findOne(record.form)).title}`,
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
};
