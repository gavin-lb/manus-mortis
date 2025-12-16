import { SlashCommandBuilder, EmbedBuilder, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import  { formatSeconds } from '/gadget/app/utils'
import values from '/gadget/app/api/models/points/values.json'


export default {
  data: new SlashCommandBuilder()
    .setName('points')
    .setDescription('Displays how many points you or another user has')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose points you want to know (if no user is specified then it will be you)')
        .setRequired(false))
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    const user_id = interaction.data.options?.[0]?.value

    const points = await api.points.upsert({
      user_id: user_id ?? interaction.member.user.id, 
      guild_id: interaction.guild.id, 
      on: ['user_id', 'guild_id']
    })

    const start = user_id ? `<@${user_id}> has` : 'You have'
    const sep = '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯'

    const embed = new EmbedBuilder()
    	.setColor(0x5865F2)
      .setAuthor({ name: 'Points Breakdown', iconURL: 'https://i.imgur.com/LI0agMJ.png' })
    	.setDescription(`${start} ${points.value} point${Math.abs(points.value) == 1 ? '' : 's'}\n\u200B`)
    	.addFields(
    		{ name: 'Source', value: [
          sep, 
          'Messages sent', 
          'Time in voice', 
          'Referrals', 
          'Reaction bounties', 
          'Training sessions',
          'Other', 
          sep
        ].join('\n'), inline: true },        
    		{ name: 'Value', value: [
          sep, 
          points.message_count, 
          formatSeconds(points.seconds_in_voice), 
          points.referral_count, 
          points.react_count, 
          points.training_count, 
          points.other, 
          sep, 
          '\u1CBC\u1CBC\u1CBC\u1CBC\u1CBC\u1CBC\u1CBC\u1CBC\u1CBC\u1CBC**Total:**'
        ].join('\n'), inline: true },
    		{ name: 'Points', value: [
          sep, 
          Math.floor(points.message_count / values.message), 
          Math.floor(points.seconds_in_voice / values.voice), 
          values.referral * points.referral_count, 
          values.react * points.react_count, 
          values.training * points.training_count, 
          points.other, 
          sep, 
          `**${points.value}**`
        ].join('\n'), inline: true },
    	)
    	.setTimestamp()
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [embed],
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}