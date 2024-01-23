import { useRouteLoaderData } from "@remix-run/react";

import { type loader as rootLoader } from "#app/root.tsx";

export function useOptionalUser() {
	const data = useRouteLoaderData<typeof rootLoader>("root");
	const optionalUser = data?.user ?? null;

	return optionalUser;
}

export function useUser() {
	const data = useRouteLoaderData<typeof rootLoader>("root");
	const user = data?.user;

	if (!user) {
		throw new Error("Please log in first.");
	}

	return user;
}
