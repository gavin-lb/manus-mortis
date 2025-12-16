import { KeepAliveGlobalActionContext } from "gadget-server";

/**
 * @param { KeepAliveGlobalActionContext } context
 */
export async function run({ logger, api }: KeepAliveGlobalActionContext) {
  const { body, headers, ok, redirected, status, statusText, type, url } = await fetch(
    `https://${process.env.GADGET_APP}${
      process.env.NODE_ENV == "development" ? "--development" : ""
    }.gadget.app/status`,
    { method: "GET" },
  );

  if (ok) logger.info("[%s] Keep alive - %s: %s", process.env.NODE_ENV, status, statusText);
  else logger.warn("[%s] Keep alive failed - %s: %s", process.env.NODE_ENV, status, statusText);

  return { body, headers, ok, redirected, status, statusText, type, url };
}

export async function onSuccess({ api, logger }: KeepAliveGlobalActionContext) {
  const delay = (Number(process.env.KEEP_ALIVE_DELAY) ?? 0) * 1000;

  if (delay > 0) {
    while (true) {
      try {
        await api.enqueue(api.keepAlive, {
          startAt: new Date(Date.now() + delay).toISOString(),
          retries: 100,
          id: `keep-alive-${Math.floor(Date.now() / delay)}`,
        });
        return;
      } catch (err) {
        logger.error({ err }, "Error while trying to enqueue keepAlive");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

export const options = { triggers: {} };
