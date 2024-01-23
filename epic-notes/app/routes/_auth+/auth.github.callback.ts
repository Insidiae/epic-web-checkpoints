import { redirectWithToast } from "#app/utils/toast.server.ts";

export async function loader() {
	throw await redirectWithToast("/login", {
		title: "Auth Success (jk)",
		description: `You have successfully authenticated with GitHub (not really though...).`,
		type: "success",
	});
}
