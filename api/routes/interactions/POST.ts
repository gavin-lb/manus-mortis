import {
  type APIInteraction,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from "discord.js";
import { RouteHandler, logger } from "gadget-server";
import { toKebabCase } from "/gadget/app/api/utils";

/**
 * Route handler for POST interactions
 *
 * @type { RouteHandler } route handler - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler = async ({ request, reply, logger }) => {
  try {
    return reply.send(await handleInteraction(request.body as APIInteraction));
  } catch (err) {
    logger.error({ err });
    return reply.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        content: "⚠️ Oops! Something went wrong...",
      },
    });
  }
};

async function handleInteraction(interaction: APIInteraction) {
  switch (interaction.type) {
    case InteractionType.Ping:
      return { type: InteractionResponseType.Pong };

    case InteractionType.ApplicationCommand:
      const { default: command } = require(
        `/gadget/app/api/commands/${toKebabCase(interaction.data.name)}`,
      );
      return await command.execute(interaction);

    case InteractionType.MessageComponent:
      const { default: component } = require(
        `/gadget/app/api/components/${toKebabCase(interaction.data.custom_id)}`,
      );
      return await component(interaction);

    case InteractionType.ModalSubmit:
      const [name, ...args] = interaction.data.custom_id.split(" ");
      const { default: modal } = require(`/gadget/app/api/modals/${toKebabCase(name)}`);
      return await modal(interaction, ...args);

    default:
      logger.error({ interaction }, "Unhandled interaction");
      throw new Error("Unhandled interaction");
  }
}

export default route;
