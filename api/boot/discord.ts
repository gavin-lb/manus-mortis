import { Client, GatewayIntentBits } from "discord.js";
import { logger, Server } from "gadget-server";
import { eventHandlers, type EventHandlers } from "/gadget/app/api/events";

/**
 * Server boot plugin
 *
 * @param { Server } server - server instance to customize
 *
 * @see {@link https://www.fastify.dev/docs/latest/Reference/Server}
 */
export default async function (server: Server) {
  if (process.env.NODE_ENV == "development") {
    //return;
  }

  const discordClient: Client & { uuid?: string } = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  // Helper function needed to preserve strong typing
  const register = <Event extends keyof EventHandlers>(
    method: "on" | "once",
    event: Event,
    handler: EventHandlers[Event],
  ) => {
    logger.debug("Registering event %s with method %s", event, method);
    discordClient[method](event, handler!);
  };

  // Register events
  for (const method of ["on", "once"] as const) {
    for (const event of Object.keys(eventHandlers[method]) as (keyof EventHandlers)[]) {
      const handler = eventHandlers[method][event];
      register(method, event, handler);
    }
  }

  // Login to client
  await discordClient.login(process.env.DISCORD_TOKEN);

  // Check whether connected every 10 seconds and reconnect if disconnected
  setInterval(async () => {
    if (discordClient.ws.status === 5) {
      await discordClient.destroy();

      logger.info("Reconnecting Discord client with uuid: %s", discordClient.uuid);
      await discordClient.login(process.env.DISCORD_TOKEN);
    }
  }, 10000).unref();

  // Add discord client to request context
  server.addHook("onRequest", async (request) => {
    request.discord = discordClient;
  });

  // Disconnect when Server instance shuts down
  server.addHook("onClose", async () => {
    logger.info("Destroying client with uuid: %s", discordClient.uuid);
    await discordClient.destroy();
  });
}
