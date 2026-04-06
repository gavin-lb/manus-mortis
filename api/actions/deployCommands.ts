import { logger } from "gadget-server";
import fs from "node:fs";
import path from "node:path";
import { discordRequest } from "/gadget/app/api/utils";

const COMMAND_DIR = "/gadget/app/api/commands";

export async function run() {
  fs.readdir(COMMAND_DIR, async (err, files) => {
    if (err) {
      console.error(err);
      return err;
    }

    const commands = files.map((file) =>
      require(path.join(COMMAND_DIR, file)).default.data.toJSON(),
    );

    try {
      await discordRequest(`/applications/${process.env.APP_ID}/commands`, {
        method: "PUT",
        body: commands,
      });
      logger.info({ commands }, "Registered commands");
      return commands;
    } catch (err) {
      console.error(err);
      return err;
    }
  });
}

export const options = { triggers: {} };
