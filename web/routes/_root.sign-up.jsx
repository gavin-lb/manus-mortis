import { formatErrorMessages } from "@gadgetinc/api-client-core";
import { json } from "@remix-run/node";
import { useActionData, useLocation, useOutletContext } from "@remix-run/react";

/**
 * @param { import("@remix-run/node").LoaderFunctionArgs }
 */
export const action = async ({ context, request }) => {
  const { email, password } = Object.fromEntries(await request.formData());

  try {
    await context.api.user.signUp({ email, password });

    return json({ success: true });
  } catch (error) {
    return json({ errors: formatErrorMessages(error) });
  }
};

export default function () {
  const { csrfToken } = useOutletContext();
  const { errors, success } = useActionData() ?? {};
  const { search } = useLocation();

  return (
    <form className="custom-form" method="post" action="/sign-up">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <h1 className="form-title">Create account</h1>
      <div className="custom-form">
        <a className="google-oauth-button" href={`/auth/google/start${search}`}>
          <img
            src="https://assets.gadget.dev/assets/default-app-assets/google.svg"
            width={22}
            height={22}
          />{" "}
          Continue with Google
        </a>
        <input className="custom-input" placeholder="Email" name="email" />
        {errors?.user?.email?.message && (
          <p className="format-message error">
            Email: {errors.user.email.message}
          </p>
        )}
        <input
          className="custom-input"
          placeholder="Password"
          type="password"
          name="password"
        />
        {errors?.user?.password?.message && (
          <p className="format-message error">
            Password: {errors.user.password.message}
          </p>
        )}
        {errors?.root?.message && (
          <p className="format-message error">{errors.root.message}</p>
        )}
        {success && (
          <p className="format-message success">Please check your inbox</p>
        )}
        <button type="submit">Sign up</button>
      </div>
    </form>
  );
}
