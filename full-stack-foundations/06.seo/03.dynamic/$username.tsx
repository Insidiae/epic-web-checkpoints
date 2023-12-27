import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, type MetaFunction } from '@remix-run/react'
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

// 🐨 grab the user's information from the loader data
// 🦺 if you want the types, pass the typeof loader as the first argument of the
// MetaFunction generic type.
// 🐨 use the data to get the user's name
// 💯 handle the case where the user doesn't have a name (fallback to username)
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
