import { ActionFunction, LoaderFunction, redirect, useNavigate } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();

  return Response.json({}, { headers: { "Set-Cookie": `theme=${data.get("theme")}` } });
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};

export default function () {
  const navigate = useNavigate();
  return navigate(-1);
}
