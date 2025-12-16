import axios from "axios";
import { ActionOptions, api } from "gadget-server";
import { getAvatarURL } from "/gadget/app/api/utils";

const URL = "https://discord.com/api/v10/oauth2/";

export const params = {
  code: { type: "string" },
};

export const run: ActionRun = async ({ params, record, session }) => {
  const resp = await axios.post(
    URL + "token",
    new URLSearchParams({
      grant_type: "authorization_code",
      scope: "identify",
      redirect_uri: process.env.REDIRECT_URI!,
      client_id: process.env.APP_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      code: params.code!,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  const { access_token: accessToken, refresh_token: refreshToken } = await resp.data;
  session?.set("accessToken", accessToken);
  session?.set("refreshToken", refreshToken);

  const userResp = await axios.get(URL + "@me", {
    headers: { Authorization: `Bearer ${session?.get("accessToken")}` },
  });
  const { expires: expiresAt, user } = await userResp.data;

  session?.set("discordId", user.id);
  session?.set("expiresAt", expiresAt);

  const userRecord = await api.user.findByDiscordId(user.id);

  session?.set("user", { _link: userRecord.id });
  api.user.update(userRecord.id, {
    username: user.username,
    globalName: user.global_name,
    avatar: getAvatarURL(user),
  });

  return record;
};

export const options: ActionOptions = {
  actionType: "custom",
};
