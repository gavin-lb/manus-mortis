import { sendMessage } from '/gadget/app/utils'

/** @type { ActionRun } */
export const run = async () => {
  if (process.env.NODE_ENV == 'production') {
    sendMessage('1294992559390855259', '<@&1090824854372098048> Hi there! Don’t forget to apply in <#1166820281441079296>!')
  }
}

export const options = {
  triggers: {
    scheduler: [
      { every: "day", at: "12:00 UTC" }
    ]
  }
}
