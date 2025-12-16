import { SlashCommandBuilder, EmbedBuilder, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { api } from 'gadget-server'
import { toTitleCase, formatSeconds } from '/gadget/app/utils'

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top 15 users with the most points (or another category, if specified)')
    .addStringOption(option =>
  		option.setName('category')
  			.setDescription('(Optional) Choose which stat to rank by (if none given `Points` will be used)')
  			.setRequired(false)
  			.addChoices(
  				{ name: 'Points', value: 'Points' },
  				{ name: 'Messages Sent', value: 'Messages Sent' },
  				{ name: 'Time in Voice', value: 'Time in Voice' },
  				{ name: 'Referrals', value: 'Referrals' },
  				{ name: 'Reaction Bounties', value: 'Reaction Bounties' },
  				{ name: 'Training Sessions', value: 'Training Sessions' },
  		))
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: async (interaction) => {
    const category = toTitleCase(interaction.data.options?.[0]?.value ?? 'Points')
    const length = 15
    const stat = ({
      'Points': 'value',
      'Messages Sent': 'message_count',
      'Time In Voice': 'seconds_in_voice',
      'Referrals': 'referral_count',
      'Reaction Bounties': 'react_count',
      'Training Sessions': 'training_count',
    })[category]
    
    const sort = {}
    const select = { user_id: true }
    sort[stat] = 'Descending'
    select[stat] = true
    
    const records = await api.points.findMany({
      first: length,
      sort,
      select,
      filter: {
        guild_id: {
          equals: interaction.guild.id
        }
      }
    })

    const embed = new EmbedBuilder()
    	.setColor(0x5865F2)
      .setAuthor({ name: `${category} Leaderboard`, iconURL: 'https://i.imgur.com/LI0agMJ.png' })
    	.setDescription(`Top ${length} users with the most ${category.toLowerCase()}\n\u200B`)
    	.addFields(
    		{ name: 'User', value: records.map((record, i) => `${i+1}\u200B. <@${record.user_id}>`).join('\n'), inline: true },  
    		{ name: category, value: records.map(record => stat == 'seconds_in_voice' ? formatSeconds(record[stat]) : record[stat]).join('\n'), inline: true },
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