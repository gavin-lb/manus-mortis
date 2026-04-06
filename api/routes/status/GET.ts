import { RouteHandler } from "gadget-server";

/**
 * Route handler for GET status
 *
 * @type { RouteHandler } route handler - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler = async ({ reply }) => {
  return reply.status(200).send();
};

export default route;
