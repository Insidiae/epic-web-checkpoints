import { redirect } from "@remix-run/node";

export async function loader() {
	return redirect("/login");
}

export async function action() {
	return new Response("not implemented", { status: 500 });
}
