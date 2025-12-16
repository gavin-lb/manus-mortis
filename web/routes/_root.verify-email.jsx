import { json } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const loader = async ({ context, request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  try {
    await context.api.user.verifyEmail({ code });
    return json({ success: true });
  } catch (error) {
    return json({
      error: { message: error.message },
      success: false,
    });
  }
};

export default function () {
  const { gadgetConfig } = useOutletContext();
  const { success, error } = useLoaderData();

  if (error) {
    return <p className="format-message error">{error.message}</p>;
  }

  return success ? (
    <p className="format-message success">
      Email has been verified successfully.{" "}
      <Link to={gadgetConfig.authentication.signInPath}>Sign in now</Link>
    </p>
  ) : null;
}
