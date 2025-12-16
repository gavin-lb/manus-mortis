import {
  APIApplicationCommandInteraction,
  ApplicationIntegrationType,
  InteractionContextType,
  InteractionResponseType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!")
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  execute: (interaction: APIApplicationCommandInteraction) => ({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: "Pong!",
      flags: MessageFlags.Ephemeral,
    },
  }),
};
