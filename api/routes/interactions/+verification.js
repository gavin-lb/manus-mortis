import { verifyKey } from 'discord-interactions';
import { logger } from 'gadget-server'

/**
 * Route plugin for *
 *
 * @param { Server } server - server instance to customize, with customizations scoped to descendant paths
 *
 * @see {@link https://www.fastify.dev/docs/latest/Reference/Server}
 */
export default async function (server) {
  server.addHook('preHandler', (request, reply, done) => {
    const body = JSON.stringify(request.body)
    const signature = request.headers['x-signature-ed25519']
    const timestamp = request.headers['x-signature-timestamp']
    
    const isValidRequest = verifyKey(body, signature, timestamp, process.env.PUBLIC_KEY)

    logger.debug({ isValidRequest, body, signature, timestamp }, "Interactions endpoint verification prehandler")
    
    if (!isValidRequest) {
      logger.error({ data: { body, signature, timestamp } }, 'Bad request signature!')
      return reply.status(401).send('Bad request signature')
    }

    done()
  })
}