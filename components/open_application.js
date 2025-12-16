import { InteractionResponseType } from 'discord-interactions'
import { api } from 'gadget-server'
import { discordRequest } from '/gadget/app/utils'

export default async (interaction, form_name) => {
  const [formRecord, guildRecord] = await Promise.all([
    api.application.form.findFirst({
      filter: { name: { equals: form_name} }
    }),
    api.guild.findFirst({
      filter: { guild_id: { equals: interaction.guild.id } }
    })
  ])

  const threadRecord = await api.application.thread.create({
    channel_id: interaction.channel.id,
    guild: {
      _link: guildRecord.id,
    },
    form: {
      _link: formRecord.id,
    },
    owner: interaction.member.user,
  })

  discordRequest(`webhooks/${process.env.APP_ID}/${interaction.token}/messages/${interaction.message.id}`,
    { method: 'PATCH', body: { content: `✅ Application created: <#${threadRecord.thread_id}>`, components: [], embeds: [] } }
  )

  return {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
  }
}