import { Server, logger } from "gadget-server";

/**
 * Route plugin for *
 *
 * @param { Server } server - server instance to customize, with customizations scoped to descendant paths.
 * @see https://www.fastify.dev/docs/latest/Reference/Server
 */
export default async function(server) {
   server.addHook('preHandler', async (request) => {
     logger.debug(
       { data: { 
         body: request.body,
         signature: request.headers['x-signature-ed25519'], 
         timestamp: request.headers['x-signature-timestamp'] 
        } }, 
      `Request - ${request.discord?.uuid ?? 'development'}`
    )
  })
}