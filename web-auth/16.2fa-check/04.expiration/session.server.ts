import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'en_session',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})

// 🐨 save the sessionStorage.commitSession in a variable so you can call it later
const originalCommitSession = sessionStorage.commitSession

// 🐨 override the sessionStorage.commitSession using Object.defineProperty
Object.defineProperty(sessionStorage, 'commitSession', {
	value: async function commitSession(
		...args: Parameters<typeof originalCommitSession>
	) {
		const [session, options] = args
		// 🐨 if the options.expires is provided, use session.set('expires') to store it
		if (options?.expires) {
			session.set('expires', options.expires)
		}
		// 🐨 if the options.maxAge is provided, calculate the expires value and store it in 'expires'
		if (options?.maxAge) {
			session.set('expires', new Date(Date.now() + options.maxAge * 1000))
		}
		// 🐨 get the expires value from the session
		const expires = session.has('expires')
			? new Date(session.get('expires'))
			: undefined
		// 🐨 call the originalCommitSession function
		const setCookieHeader = await originalCommitSession(session, {
			...options,
			// 🐨 be sure to set the expires option to the value you got from the session
			expires,
		})
		// 🐨 return the setCookieHeader
		return setCookieHeader
	},
})
