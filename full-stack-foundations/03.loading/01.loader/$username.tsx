import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
// 🐨 get the database from the utils directory using
import { db } from '#app/utils/db.server.ts'

// 🐨 add a `loader` export here which uses the params from the DataFunctionArgs
export function loader({ params }: DataFunctionArgs) {
	// 🐨 you'll get the username from params.username
	const username = params.username

	// 💰 Here's how you get the user from the database:
	const user = db.user.findFirst({
		where: {
			username: { equals: username },
		},
	})

	// 🐨 Return the necessary user data using Remix's json util
	return json({
		// @ts-expect-error 🦺 we'll fix this next
		user: { name: user.name, username: user.username },
	})

	// 🦺 TypeScript will complain about the user being possibly undefined, we'll
	// fix that in the next section
	// 💯 as extra credit, try to do it with new Response instead of using the json util just for fun
	// 🦉 Note, you should definitely use the json helper as it's easier and works better with TypeScript
	// but feel free to try it with new Response if you want to see how it works.
}

export default function ProfileRoute() {
	// 💣 we no longer need to get the params in the UI, delete this:
	// const params = useParams()
	// 🐨 get the data from the loader with useLoaderData
	const data = useLoaderData<typeof loader>()

	return (
		<div className="container mb-48 mt-36">
			{/*
				🐨 swap params.username with the user's name
				(💯 note, the user's name is not required, so as extra credit, add a
				fallback to the username)
			*/}
			<h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
			<Link to="notes" className="underline">
				Notes
			</Link>
		</div>
	)
}
