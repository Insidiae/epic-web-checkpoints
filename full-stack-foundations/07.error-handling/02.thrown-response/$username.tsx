import { json, type DataFunctionArgs } from '@remix-run/node'
import {
	Link,
	isRouteErrorResponse,
	useLoaderData,
	useParams,
	useRouteError,
	type MetaFunction,
} from '@remix-run/react'
import { db } from '#app/utils/db.server.ts'
import { invariantResponse } from '#app/utils/misc.tsx'

export async function loader({ params }: DataFunctionArgs) {
	const user = db.user.findFirst({
		where: {
			username: {
				equals: params.username,
			},
		},
	})

	invariantResponse(user, 'User not found', { status: 404 })

	return json({
		user: { name: user.name, username: user.username },
	})
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	return (
		<div className="container mb-48 mt-36">
			<h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
			<Link to="notes" className="underline" prefetch="intent">
				Notes
			</Link>
		</div>
	)
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username
	return [
		{ title: `${displayName} | Epic Notes` },
		{
			name: 'description',
			content: `Profile of ${displayName} on Epic Notes`,
		},
	]
}

export function ErrorBoundary() {
	const error = useRouteError()
	// 🐨 get the params so we can display the username that is causing the error
	// 💰 useParams comes from @remix-run/react
	const params = useParams()
	console.error(error)

	// 🐨 create the error message that will be displayed to the user
	// you can default it to the existing error message we have below.
	let errorMessage = <p>Oh no, something went wrong. Sorry about that.</p>

	// 🐨 if the error is a 404 Response error, then display a different message
	// that explains no user by the username given was found.
	// 💰 isRouteErrorResponse comes from @remix-run/react
	if (isRouteErrorResponse(error) && error.status === 404) {
		errorMessage = <p>No user with the username "{params.username}" exists</p>
	}

	return (
		<div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
			{/* 🐨 display the error message here */}
			{errorMessage}
		</div>
	)
}
