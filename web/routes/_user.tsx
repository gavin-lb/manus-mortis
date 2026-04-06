import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import type { RootOutletContext } from "../root";
import AppFrame from "@/components/app-frame";

export type AuthOutletContext = RootOutletContext & ReturnType<typeof useLoaderData<typeof loader>>;

export const loader = (async ({ context }) => {
  const { session, gadgetConfig } = context;
  const userId = session?.get("user");

  if (!userId) {
    return redirect(gadgetConfig.authentication!.signInPath);
  }

  const user = await context.api.user.findOne(userId, {
    select: {
      id: true,
      discordId: true,
      username: true,
      globalName: true,
      avatar: true,
      isManager: true,
    },
  });

  return { user };
}) satisfies LoaderFunction;

export default function () {
  const { user } = useLoaderData<typeof loader>();
  const context = useOutletContext<RootOutletContext>();

  return (
    <AppFrame user={user} theme={context.theme}>
      <Outlet context={{ ...context, user } as AuthOutletContext} />
    </AppFrame>
  );
}
