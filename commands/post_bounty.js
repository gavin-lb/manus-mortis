import { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { discordRequest, sendMessage } from '/gadget/app/utils'

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Post Bounty')
  	.setType(ApplicationCommandType.Message),

  execute: async (interaction) => {
    const guild = await api.guild.findFirst({
      filter: {
        bounty_channel: {
          notEquals: null
        }
      }
    })
    
    const guild_member = await discordRequest(`/guilds/${guild.guild_id}/members/${interaction.member.user.id}`, { method: 'GET' })
    
    if (!guild_member.roles.includes(guild.role_ids.ticket_handler)) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⚠️ Oops! You don\'t have permission to post bounties!', 
          flags: InteractionResponseFlags.EPHEMERAL 
        }
      }
    }

    const [ [_ , message] ] = Object.entries(interaction.data.resolved.messages)
    const formatted_message = message.content.replace(/<:.+?:.+?>/g, '').replace(/\n/g, '\n > ')
    const trimmed_formatted_message = formatted_message.length > 300 ? formatted_message.substring(0, 300) + ' ...' : formatted_message
    
    const embed = new EmbedBuilder()
    	.setColor(0x0099FF)
    	.setTitle('💰 New bounty posted! 💰')
      .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${message.id}`)
    	.setDescription(`**React to this message and claim your bounty:**\n\u200B\n https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${message.id} \n > ${trimmed_formatted_message}`)
    	.setThumbnail('https://i.imgur.com/LI0agMJ.png')
    	.setTimestamp()
    	.setFooter({ 
        text: message.author.global_name ?? message.author.username, 
        iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}` 
      })

    const bountyMessage = await discordRequest(`/channels/${guild.bounty_channel}/messages`, {
      method: 'POST', body: {
        content: `<@&${guild.role_ids.reactor}> Fresh meat, lads! Claim this bounty before it expires <t:${Math.floor(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).getTime() / 1000)}:R>!`, 
        embeds: [embed],
        components: [new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`bounty_how_to`)
            .setLabel('How to claim a bounty')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💰'),
          new ButtonBuilder()
            .setCustomId(`bounty_ping`)
            .setLabel('Ping me for new bounties')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚔'),
          new ButtonBuilder()
            .setCustomId(`bounty_stop_ping`)
            .setLabel('Stop pinging me')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🙅'),
        ).toJSON()],
        allowed_mentions: { roles: [guild.role_ids.reactor] }
      }
    })
    
    api.bounty.posted.create({
      guild_id: interaction.guild.id,
      channel_id: interaction.channel.id,
      message_id: message.id,
      bounty_guild_id: guild.guild_id,
      bounty_channel_id: guild.bounty_channel,
      bounty_message_id: bountyMessage.id
    })
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Bounty posted! https://discord.com/channels/${guild.id}/${guild.bounty_channel}/${bountyMessage.id}`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}