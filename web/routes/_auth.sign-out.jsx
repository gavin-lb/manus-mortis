import { redirect } from "@remix-run/node";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const action = async ({ context }) => {
  const { session } = context;

  const userId = session?.get("user");

  if (userId) {
    await context.api.user.signOut(userId);
  }

  return redirect("/");
};

export default function () {
  return null;
}
