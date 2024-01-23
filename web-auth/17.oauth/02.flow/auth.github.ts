import { redirect, type ActionFunctionArgs } from '@remix-run/node'
// 💰 you're gonna need this:
import { authenticator } from '#app/utils/auth.server.ts'

export async function loader() {
	return redirect('/login')
}

export async function action({ request }: ActionFunctionArgs) {
	// 🐨 call authenticator.authenticate with 'github', the request. Return the
	// result.
	const providerName = 'github'

	return await authenticator.authenticate(providerName, request)
}
