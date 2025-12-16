import { formatErrorMessages } from "@gadgetinc/api-client-core";
import { json } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { useState } from "react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const loader = async ({ context, request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  return json({ code });
};

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const action = async ({ context, request }) => {
  const { code, password } = Object.fromEntries(await request.formData());

  try {
    await context.api.user.resetPassword({ code, password });

    return json({ success: true });
  } catch (error) {
    return json({ errors: formatErrorMessages(error), success: false });
  }
};

export default function () {
  const { code } = useLoaderData();
  const { csrfToken } = useOutletContext();
  const { errors: actionErrors, success } = useActionData() ?? {};
  const [errors, setErrors] = useState({});

  return success ? (
    <p className="format-message success">
      Password changed successfully.{" "}
      <Link to="/signed-in">Back to profile</Link>
    </p>
  ) : (
    <form className="custom-form" method="post" action="/reset-password">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="code" value={code} />
      <h1 className="form-title">Reset password</h1>
      <input
        className="custom-input"
        placeholder="New password"
        type="password"
        name="password"
      />
      {actionErrors?.user?.password?.message && (
        <p className="format-message error">
          {actionErrors?.user?.password?.message}
        </p>
      )}
      <input
        className="custom-input"
        placeholder="Confirm password"
        type="password"
        name="confirmPassword"
      />
      {errors?.confirmPassword?.message && (
        <p className="format-message error">{errors.confirmPassword.message}</p>
      )}
      {actionErrors?.root?.message && (
        <p className="format-message error">{actionErrors.root.message}</p>
      )}
      <button
        type="submit"
        onClick={(e) => {
          const password = document.querySelector(
            'input[name="password"]'
          ).value;
          const confirmPassword = document.querySelector(
            'input[name="confirmPassword"]'
          ).value;
          if (password !== confirmPassword) {
            e.preventDefault();
            setErrors((prevErrors) => ({
              ...prevErrors,
              confirmPassword: { message: "Passwords do not match" },
            }));
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              confirmPassword: undefined,
            }));
          }
        }}
      >
        Reset password
      </button>
    </form>
  );
}
