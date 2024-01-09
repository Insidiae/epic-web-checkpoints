import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { validateCSRF } from "#app/utils/csrf.server.ts";
import { sessionStorage } from "#app/utils/session.server.ts";

export async function loader() {
	// 🦉 we'll keep this around in case the user ends up on this route. They
	// shouldn't see anything here anyway, so we'll just redirect them to the
	// home page.
	return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	await validateCSRF(formData, request.headers);

	const cookieSession = await sessionStorage.getSession(
		request.headers.get("cookie"),
	);
	return redirect("/", {
		headers: {
			"set-cookie": await sessionStorage.destroySession(cookieSession),
		},
	});
}
