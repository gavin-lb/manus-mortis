import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api, logger } from 'gadget-server'
import values from '/gadget/app/api/models/points/values.json'

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Claim Bounty')
  	.setType(ApplicationCommandType.Message),

  execute: async (interaction) => {
    const [ [_ , message] ] = Object.entries(interaction.data.resolved.messages)
    
    const bounty = await api.bounty.posted.maybeFindFirst({
      sort: {
        expiresAt: "Descending",
      },
      filter: {
        guild_id: {
          equals: interaction.guild.id
        },
        channel_id: {
          equals: interaction.channel.id
        },
        message_id: {
          equals: message.id
        }
      }
    })

    if (!bounty) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Oops! There\'s no bounty for this post', 
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }

    if (bounty.status != 'active') {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! This bounty is too old, it expired <t:${Math.floor(new Date(bounty.expiresAt).getTime() / 1000)}:R>`,
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }

    
    if (!message.reactions.map(ele => (ele.me)).some(Boolean)) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! You haven't reacted to this post! React to it and try again`,
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }

    const claimed = await api.bounty.claimed.maybeFindFirst({
      filter: {
        posted: {
           equals: bounty.id,
        },
        user_id: {
          equals: interaction.member.user.id,
        }
      }
    })
    
    if (claimed) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚠️ Oops! You've already claimed this bounty!`,
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }

    const [ points ]  = await Promise.all([
      api.internal.points.upsert({
        user_id: interaction.member.user.id,
        guild_id: bounty.bounty_guild_id, 
        _atomics: { 
          react_count: { increment: 1 }, 
          value: { increment: values.react }
        }, 
        on: ['user_id', 'guild_id']
      }),
      api.bounty.claimed.create({ posted: { _link: bounty.id }, user_id: interaction.member.user.id })
    ])

    logger.info('%s claimed bounty %s', interaction.member.user.id, bounty.id)
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `💰 Bounty claimed! You have claimed ${points.react_count} bounties and have ${points.value} points`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}