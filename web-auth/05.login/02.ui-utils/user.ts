// 💰 bring in useRouteLoaderData from '@remix-run/react'
import { useRouteLoaderData } from '@remix-run/react'

// 🦺 you can make this type safe by importing the root loader type like this:
import { type loader as rootLoader } from '#app/root.tsx'

// 🐨 create a useOptionalUser function which get's the root loader data and
// returns the user if it exists, otherwise return null.
export function useOptionalUser() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	const optionalUser = data?.user ?? null

	return optionalUser
}

// 🐨 create a useUser function which calls useOptionalUser and if the user
// does not exist, throws an error with an informative error message. Otherwise
// return the user
export function useUser() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	const user = data?.user

	if (!user) {
		throw new Error('Please log in first.')
	}

	return user
}
