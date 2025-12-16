import openticket from '/gadget/app/commands/openticket'

export default async (interaction) => {
  interaction.data.options = [
    interaction.data.components[0].components[0],
    interaction.data.components[1].components[0]
  ]
  return await openticket.execute(interaction)
}