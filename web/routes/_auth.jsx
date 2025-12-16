import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const loader = async ({ context }) => {
  const { session } = context;

  const userId = session?.get("user");
  const user = userId && (await context.api.user.findOne(userId));

  if (!user) {
    return redirect("/sign-in");
  }

  return json({
    user,
  });
};

export default function () {
  const { user } = useLoaderData();

  return (
    <div className="app">
      <div className="app-content">
        <div className="main">
          <Outlet context={{ ...useOutletContext(), user }} />
        </div>
      </div>
    </div>
  );
}
