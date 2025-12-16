const URL = 'https://discord.com/api/v10/' 

export const params = {
  endpoint: { type: 'string' },
  method: { type: 'string' },
  body: { type: 'string' },
}

/** @type { ActionRun } */
export const run = async ({ params, logger }) => {
  const { endpoint, method, body } = params

  const res = await fetch(
    URL + endpoint, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'Manus Mortis Bot',
      },
      method,
      body
    }
  )

  if (res.status == 429) {
    logger.warn({ res }, 'Rate limited')
    throw new Error('Rate limited')
  }
  
  try {
    const data = await res.json()
    if (!res.ok) {
      throw new Error(JSON.stringify(data))
    }
    return data
  } catch (err) {
    if (!err instanceof SyntaxError) {
      logger.error({ err }, 'discordRequest action error')
    }
    return {}
  } 
}
