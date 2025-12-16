import { Server, logger } from "gadget-server";

/**
 * Route plugin for *
 *
 * @param { Server } server - server instance to customize, with customizations scoped to descendant paths
 *
 * @see {@link https://www.fastify.dev/docs/latest/Reference/Server}
 */
export default async function (server: Server) {
  const encoder = new TextEncoder();
  const publicKey: CryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(process.env.PUBLIC_KEY!, "hex"),
    { name: "ed25519", namedCurve: "ed25519" },
    false,
    ["verify"],
  );

  server.addHook("preHandler", async (request, reply) => {
    const signature = request.headers["x-signature-ed25519"] as string;
    const timestamp = request.headers["x-signature-timestamp"] as string;
    const body = JSON.stringify(request.body);

    const isValid = await crypto.subtle.verify(
      { name: "ed25519" },
      publicKey,
      Buffer.from(signature, "hex"),
      encoder.encode(timestamp + body),
    );

    if (!isValid) {
      logger.info({ data: { body, signature, timestamp } }, "Bad request signature");
      return reply.status(401).send("Bad request signature");
    }
  });
}
