import axios from "axios";
import { EmbedBuilder } from "discord.js";
import FormData from "form-data";
import { ActionOptions } from "gadget-server";
import { sendMessage } from "../../../utils";

export const params = {
  memberId: { type: "string" },
  avatar: { type: "string" },
  username: { type: "string" },
};

export const run: ActionRun = async ({ params, record, api }) => {
  const lastSent = await api.sentWelcomeMessage.maybeFindFirst({
    sort: { createdAt: "Descending" },
  });

  if (
    !!lastSent &&
    lastSent.discordId === params.memberId &&
    lastSent.welcomeMessageId === record.id
  ) {
    // duplicate welcome message
    return;
  } else {
    await api.sentWelcomeMessage.create({
      discordId: params.memberId,
      welcomeMessage: {
        _link: record.id,
      },
    });
  }

  const channel = record.channel as { id: string; name: string };

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Manus Mortis", iconURL: "https://i.postimg.cc/fW8byp5H/mm-logo-dark.png" })
    .setThumbnail(`https://cdn.discordapp.com/avatars/${params.memberId}/${params.avatar}.png`)
    .setTitle(record.title.replace(/\$\{USER\}/g, params.username!))
    .setDescription(record.message.replace(/\$\{USER\}/g, params.username!));

  if (record.image) {
    const form = new FormData();
    const fileResponse = await axios.get(record.image.url, { responseType: "stream" });
    embed.setImage(`attachment://${record.image.fileName}`);
    form.append("files[0]", fileResponse.data, record.image.fileName);
    form.append(
      "payload_json",
      JSON.stringify({
        content: `<@${params.memberId}>`,
        embeds: [embed.toJSON()],
      }),
    );

    axios.post(`https://discord.com/api/v10/channels/${channel.id}/messages`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },
    });
  } else {
    sendMessage(channel.id, { content: `<@${params.memberId}>`, embeds: [embed.toJSON()] });
  }
};

export const options: ActionOptions = {
  actionType: "custom",
};
