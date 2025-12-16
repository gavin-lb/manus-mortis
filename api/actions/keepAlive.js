import { KeepAliveGlobalActionContext } from "gadget-server";

/**
 * @param { KeepAliveGlobalActionContext } context
 */
export async function run({ logger, api }) {
  const { body, headers, ok, redirected, status, statusText, type, url } = await fetch(
    `https://manus-mortis${process.env.NODE_ENV == 'development' ? '--development' : ''}.gadget.app/status`, 
    { method: 'GET' }
  )

  if (ok)
    logger.info('[%s] Keep alive - %s: %s', process.env.NODE_ENV, status, statusText)
  else
    logger.warn('[%s] Keep alive failed - %s: %s', process.env.NODE_ENV, status, statusText)

  return { body, headers, ok, redirected, status, statusText, type, url }
}

export async function onSuccess({ api, logger }) {
  if (process.env.KEEP_ALIVE_DELAY > 0) {
    while (true) {
      try {
        await api.enqueue(api.keepAlive, { 
          startAt: new Date(Date.now() + process.env.KEEP_ALIVE_DELAY * 1000).toISOString(), 
          retries: 100 
        })
        return
      } catch(err) {
        logger.error({ err }, 'Error while trying to enqueue keepAlive')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
}

export const options = { triggers: {} }