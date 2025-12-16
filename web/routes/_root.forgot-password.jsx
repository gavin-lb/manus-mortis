import { json } from "@remix-run/node";
import { useActionData, useOutletContext } from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const action = async ({ context, request }) => {
  const { email } = Object.fromEntries(await request.formData());

  await context.api.user.sendResetPassword({ email });

  return json({ success: true });
};

export default function () {
  const { csrfToken } = useOutletContext();
  const { success } = useActionData() ?? {};

  return success ? (
    <p className="format-message success">
      Email has been sent. Please check your inbox.
    </p>
  ) : (
    <form className="custom-form" method="post" action="/forgot-password">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <h1 className="form-title">Reset password</h1>
      <input className="custom-input" placeholder="Email" name="email" />
      <button type="submit">Send reset link</button>
    </form>
  );
}
