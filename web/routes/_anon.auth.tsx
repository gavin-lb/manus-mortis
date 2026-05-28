import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

const URL = encodeURI(
  `https://discord.com/oauth2/authorize?client_id=${process.env.APP_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=identify`,
);

export const loader = async ({ context: { session } }: LoaderFunctionArgs) => {
  if (session) {
    const oauthState = crypto.randomUUID();
    session.set("oauthState", oauthState);
    return redirect(URL + encodeURI(`&state=${oauthState}`));
  } else {
    return redirect("/sign-in");
  }
};
