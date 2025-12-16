import { SlashCommandBuilder, InteractionContextType } from 'discord.js'
import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import { logger } from 'gadget-server'

export default {
  data: new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('Creates a discord timestamp')
    .addStringOption(option =>
  		option.setName('format')
        .setRequired(true)
  			.setDescription('The format of the timestamp')
  			.addChoices(
  				{ name: 'Short time (04:20)', value: 't' },
          { name: 'Long time (04:20:00)', value: 'T' },
          { name: 'Short date (20/04/2025)', value: 'd' },
          { name: 'Long date (20 April 2025)', value: 'D' },
          { name: 'Long date with short time (20 April 2025 at 04:20)', value: 'f' },
          { name: 'Long date with day of the week and short time (Saturday, 20 April 2025 at 04:20)', value: 'F' },
          { name: 'Relative (in 2 days)', value: 'R' }
        )
    )
    .addStringOption(option =>
  		option.setName('timezone')
        .setRequired(true)
  			.setDescription('The timezone of the source time')
  			.addChoices(
  				{ name: 'PST - Pacific Standard Time (UTC-8)', value: '-8' },
  				{ name: 'PDT - Pacific Daylight Time (UTC-7)', value: '-7' },
          { name: 'CST - Central Standard Time (UTC-6)', value: '-6' },
          { name: 'CDT - Central Daylight Time (UTC-5)', value: '-5' },
          { name: 'EST - Eastern Standard Time (UTC-5)', value: '-5' },
          { name: 'EDT - Eastern Daylight Time (UTC-4)', value: '-4' },
          { name: 'GMT - Greenwich Mean Time (UTC+0)', value: '+0'},
          { name: 'BST - British Summer Time (UTC+1)', value: '+1' },
          { name: 'CET - Central European Time (UTC+1)', value: '+1' },
          { name: 'CEST - Central European Summer Time (UTC+2)', value: '+2' },
    		)
    )
    .addStringOption(option =>
  		option.setName('hour')
        .setRequired(true)
  			.setDescription('The hour of the source time')
  			.addChoices(
          ...Array.from({ length: 24 }, (_, i) => ({
            name: `${String(i).padStart(2, '0')}:00 (${(i % 12 || 12)}${i < 12 ? 'am' : 'pm'})`,
            value: String(i).padStart(2, '0'),
          }))
    		)
    )
    .addIntegerOption(option =>
  		option.setName('minute')
        .setRequired(false)
  			.setDescription('The minute of the source time (defaults to 0)')
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addIntegerOption(option =>
  		option.setName('seconds')
        .setRequired(false)
  			.setDescription('The seconds of the source time (defaults to 0)')
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addIntegerOption(option =>
  		option.setName('day')
        .setRequired(false)
  			.setDescription('The day of the source date (defaults to current day)')
        .setMinValue(1)
        .setMaxValue(31)
    )
    .addStringOption(option =>
  		option.setName('month')
        .setRequired(false)
  			.setDescription('The month of the source date (defaults to current month)')
  			.addChoices(
          ...Array.from({ length: 12 }, (_, i) => {
            const date = new Date(2000, i); 
            return {
              name: date.toLocaleString('en-GB', { month: 'long' }), 
              value: date.toLocaleString('en-GB', { month: 'short' }) 
            }
          })
    		)
    )
    .addIntegerOption(option =>
  		option.setName('year')
        .setRequired(false)
  			.setDescription('The year of the source date (defaults to current year)')
        .setMinValue(1970)
        .setMaxValue(2037)
    )
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(InteractionContextType.Guild),

  execute: (interaction) => {
    const options = Object.fromEntries(interaction.data.options.map(option => [option.name, option.value]))
    const currentDate = new Date(Date.now() + options.timezone * 3600000)
    const [currentDay, currentMonth, currentYear] = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).split(' ')
    const day = options.day ?? currentDay
    const month = options.month ?? currentMonth
    const year = options.year ?? currentYear
    const minute = String(options.minute ?? 0).padStart(2, '0')
    const seconds = String(options.seconds ?? 0).padStart(2, '0')
    const dateString = `${day} ${month} ${year} ${options.hour}:${minute}:${seconds} UTC${options.timezone}`
    const date = Date.parse(dateString)
    const timestamp = `<t:${Math.floor(date / 1000)}:${options.format}>`

    if (isNaN(date)) {
      logger.error({ dateString }, 'Date error')
      throw new Error('timestamp error')
    }
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `📆**Timestamp:**   \`${timestamp}\`\n🔍**Preview:**   ${timestamp}`, 
        flags: InteractionResponseFlags.EPHEMERAL 
      }
    }
  }
}