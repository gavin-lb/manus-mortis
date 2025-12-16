import { formatErrorMessages } from "@gadgetinc/api-client-core";
import { json } from "@remix-run/node";
import { Link, useActionData, useOutletContext } from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const action = async ({ context, request }) => {
  const { session } = context;
  const { currentPassword, newPassword } = Object.fromEntries(
    await request.formData()
  );

  try {
    const userId = session.get("user");
    await context.api.user.changePassword(userId, {
      currentPassword,
      newPassword,
    });

    return json({ success: true });
  } catch (error) {
    return json({ errors: formatErrorMessages(error), success: false });
  }
};

export default function () {
  const { csrfToken } = useOutletContext();
  const { errors, success } = useActionData() ?? {};

  return success ? (
    <p className="format-message success">
      Password changed successfully.{" "}
      <Link to="/signed-in">Back to profile</Link>
    </p>
  ) : (
    <form className="custom-form" method="post" action="/change-password">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <h1 className="form-title">Change password</h1>
      <input
        className="custom-input"
        type="password"
        placeholder="Current password"
        name="currentPassword"
      />
      <input
        className="custom-input"
        type="password"
        placeholder="New password"
        name="newPassword"
      />
      {errors?.user?.password?.message && (
        <p className="format-message error">
          Password: {errors.user.password.message}
        </p>
      )}
      {errors?.root?.message && (
        <p className="format-message error">{errors.root.message}</p>
      )}
      <Link to="/signed-in">Back to profile</Link>
      <button type="submit">Change password</button>
    </form>
  );
}
