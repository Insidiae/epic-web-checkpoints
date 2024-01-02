import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, type MetaFunction } from "@remix-run/react";
import { GeneralErrorBoundary } from "#app/components/error-boundary.tsx";
import { Spacer } from "#app/components/spacer.tsx";
import { Button } from "#app/components/ui/button.tsx";
import { prisma } from "#app/utils/db.server.ts";
import { getUserImgSrc, invariantResponse } from "#app/utils/misc.tsx";

export async function loader({ params }: LoaderFunctionArgs) {
	const user = await prisma.user.findFirst({
		select: {
			name: true,
			username: true,
			createdAt: true,
			image: { select: { id: true } },
		},
		where: {
			username: {
				equals: params.username,
			},
		},
	});

	invariantResponse(user, "User not found", { status: 404 });

	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() });
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
	const user = data.user;
	const userDisplayName = user.name ?? user.username;

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container flex flex-col items-center rounded-3xl bg-muted p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(data.user.image?.id)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2">{userDisplayName}</h1>
					</div>
					<p className="mt-2 text-center text-muted-foreground">
						Joined {data.userJoinedDisplay}
					</p>
					<div className="mt-10 flex gap-4">
						<Button asChild>
							<Link to="notes" prefetch="intent">
								{userDisplayName}'s notes
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	);
}
