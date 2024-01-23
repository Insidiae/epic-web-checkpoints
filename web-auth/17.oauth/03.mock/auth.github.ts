import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect, type DataFunctionArgs } from '@remix-run/node'
import { authenticator } from '#app/utils/auth.server.ts'
import { connectionSessionStorage } from '#app/utils/connections.server.ts'

export async function loader() {
	return redirect('/login')
}

export async function action({ request }: DataFunctionArgs) {
	const providerName = 'github'

	// 🐨 add an if statement here to check if the process.env.GITHUB_CLIENT_ID starts with "MOCK_"
	if (process.env.GITHUB_CLIENT_ID?.startsWith('MOCK_')) {
		// 🐨 if it does, we're going to simulate what remix-auth and github would do if we were to authenticate with it.
		// 1. create a "connectionSession" variable using the connectionSessionStorage.getSession function
		const connectionSession = await connectionSessionStorage.getSession(
			request.headers.get('cookie'),
		)
		// 2. create a "state" variable using the cuid library (💰 import { createId as cuid } from '@paralleldrive/cuid2')
		const state = cuid()
		// 3. set the "oauth2:state" key in the connectionSession to the state variable (this is what remix-auth uses to validate the state)
		connectionSession.set('oauth2:state', state)
		// 4. create a "code" variable with the value "MOCK_GITHUB_CODE_KODY" (our github API mocks will handle this or any other value)
		const code = 'MOCK_GITHUB_CODE_KODY'
		// 5. create a "searchParams" variable with a new URLSearchParams instance with the following params:
		//    - code: the code variable
		//    - state: the state variable
		const searchParams = new URLSearchParams({ code, state })
		// 6. throw a redirect with the following url: `/auth/github/callback?${searchParams}`
		throw redirect(`/auth/github/callback?${searchParams}`, {
			// 7. set the "set-cookie" header to the result of the connectionSessionStorage.commitSession function
			headers: {
				'set-cookie':
					await connectionSessionStorage.commitSession(connectionSession),
			},
		})
	}

	return await authenticator.authenticate(providerName, request)
}
