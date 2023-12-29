import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { SearchBar } from '#app/components/search-bar.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc, useDelayedIsPending } from '#app/utils/misc.tsx'

export async function loader({ request }: DataFunctionArgs) {
	const searchTerm = new URL(request.url).searchParams.get('search')
	if (searchTerm === '') {
		return redirect('/users')
	}

	// 🐨 query the user table with prisma.$queryRaw
	// Here are the requirements:
	// 1. create a variable called `like` that is a string of the searchTerm surrounded by `%` characters
	// 2. select the id, username, and name of the user (we'll bring in the image later)
	// 3. filter where the username is LIKE the `like` variable or the name is LIKE the `like` variable
	// 4. limit the results to 50
	const like = `%${searchTerm ?? ''}%`
	const users = await prisma.$queryRaw`
		SELECT id, username, name
		FROM User
		WHERE username LIKE ${like}
		OR name LIKE ${like}
		LIMIT 50
	`

	// 💣 remove this
	// const users = db.user.findMany({
	// 	where: {
	// 		username: {
	// 			contains: searchTerm ?? '',
	// 		},
	// 	},
	// })

	return json({
		status: 'idle',
		// 🐨 you can simply set this to the users you get back from the query
		// instead of doing the map thing because we can select exactly what we want.
		users,
	} as const)
}

export default function UsersRoute() {
	const data = useLoaderData<typeof loader>()
	const isPending = useDelayedIsPending({
		formMethod: 'GET',
		formAction: '/users',
	})

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center gap-6">
			<h1 className="text-h1">Epic Notes Users</h1>
			<div className="w-full max-w-[700px] ">
				<SearchBar status={data.status} autoFocus autoSubmit />
			</div>
			<main>
				{data.status === 'idle' ? (
					// 🦺 TypeScript won't like this. We'll fix it later.
					// @ts-expect-error 🦺 we'll fix this next
					data.users.length ? (
						<ul
							className={cn(
								'flex w-full flex-wrap items-center justify-center gap-4 delay-200',
								{ 'opacity-50': isPending },
							)}
						>
							{/* 🦺 TypeScript won't like this. We'll fix it later. */}
							{/* @ts-expect-error 🦺 we'll fix this next */}
							{data.users.map(user => (
								<li key={user.id}>
									<Link
										to={user.username}
										className="flex h-36 w-44 flex-col items-center justify-center rounded-lg bg-muted px-5 py-3"
									>
										<img
											alt={user.name ?? user.username}
											src={getUserImgSrc(user.image?.id)}
											className="h-16 w-16 rounded-full"
										/>
										{user.name ? (
											<span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-body-md">
												{user.name}
											</span>
										) : null}
										<span className="w-full overflow-hidden text-ellipsis text-center text-body-sm text-muted-foreground">
											{user.username}
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p>No users found</p>
					)
				) : null}
			</main>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
