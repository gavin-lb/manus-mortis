import { formatErrorMessages } from "@gadgetinc/api-client-core";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLocation,
  useOutletContext,
} from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const action = async ({ context, request }) => {
  const { session } = context;
  const { email, password } = Object.fromEntries(await request.formData());

  try {
    await context.api.user.signIn({ email, password });

    return redirect("/signed-in");
  } catch (error) {
    return json({ errors: formatErrorMessages(error) });
  }
};

export default function () {
  const { csrfToken } = useOutletContext();
  const { errors } = useActionData() ?? {};
  const { search } = useLocation();

  return (
    <form className="custom-form" method="post" action="/sign-in">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <h1 className="form-title">Sign in</h1>
      <div className="custom-form">
        <a className="google-oauth-button" href={`/auth/google/start${search}`}>
          <img
            src="https://assets.gadget.dev/assets/default-app-assets/google.svg"
            width={22}
            height={22}
          />{" "}
          Continue with Google
        </a>

        <input className="custom-input" name="email" placeholder="Email" />
        <input
          className="custom-input"
          name="password"
          placeholder="Password"
          type="password"
        />
        {errors?.root?.message && (
          <p className="format-message error">{errors.root.message}</p>
        )}
        <button type="submit">Sign in</button>
        <p>
          Forgot your password?{" "}
          <Link to="/forgot-password">Reset password</Link>
        </p>
      </div>
    </form>
  );
}
