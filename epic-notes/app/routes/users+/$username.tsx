import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
	Link,
	useLoaderData,
	useRouteError,
	type MetaFunction,
} from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";

export function loader({ params }: LoaderFunctionArgs) {
	const user = db.user.findFirst({
		where: {
			username: { equals: params.username },
		},
	});

	invariantResponse(user, "User not found", { status: 404 });

	return json({
		user: { name: user.name, username: user.username },
	});
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username;

	return [
		{ title: `${displayName} | Epic Notes` },
		{
			name: "description",
			content: `Profile of ${displayName} on Epic Notes`,
		},
	];
};

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="container mb-48 mt-36">
			<h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
			<Link to="notes" className="underline" prefetch="intent">
				Notes
			</Link>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	console.error(error);

	return (
		<div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
			<p>Oh no, something went wrong. Sorry about that.</p>
		</div>
	);
}
