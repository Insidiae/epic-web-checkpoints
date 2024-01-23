import { type LoaderFunctionArgs } from '@remix-run/node'
// 💰 you're gonna need this:
import { authenticator } from '#app/utils/auth.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	// 🐨 call authenticator.authenticate with 'github', the request, and
	// the option throwOnError: true
	const providerName = 'github'

	const profile = await authenticator.authenticate(providerName, request, {
		throwOnError: true,
	})

	// 🐨 feel free to log the result
	console.log({ profile })

	throw await redirectWithToast('/login', {
		title: 'Auth Success (jk)',
		description: `You have successfully authenticated with GitHub (not really though...).`,
		type: 'success',
	})
}
