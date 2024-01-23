import { redirect, type DataFunctionArgs } from '@remix-run/node'
import { authenticator } from '#app/utils/auth.server.ts'
import { handleMockAction } from '#app/utils/connections.server.ts'
import { ProviderNameSchema } from '#app/utils/connections.tsx'
// 💰 you'll need these:
import { getReferrerRoute } from '#app/utils/misc.tsx'
import { getRedirectCookieHeader } from '#app/utils/redirect-cookie.server.ts'

export async function loader() {
	return redirect('/login')
}

export async function action({ request, params }: DataFunctionArgs) {
	const providerName = ProviderNameSchema.parse(params.provider)

	// 🐨 wrap these two lines in a try/catch
	try {
		await handleMockAction(providerName, request)
		return await authenticator.authenticate(providerName, request)
	} catch (error: unknown) {
		// 🐨 in the error case, if the error is a Response, then do the following:
		if (error instanceof Response) {
			// 🐨 get the request.formData
			const formData = await request.formData()
			// 🐨 get the redirectTo value, fallback to getReferrerRoute(request) unless redirectTo is null
			const rawRedirectTo = formData.get('redirectTo')
			const redirectTo =
				typeof rawRedirectTo === 'string'
					? rawRedirectTo
					: getReferrerRoute(request)
			// 🐨 get the redirectCookieHeader from getRedirectCookieHeader(redirectTo)
			const redirectToCookie = getRedirectCookieHeader(redirectTo)
			// 🐨 if there's a redirectCookieHeader, then append it as 'set-cookie' to the error.headers
			if (redirectToCookie) {
				error.headers.append('set-cookie', redirectToCookie)
			}
		}
		// 🐨 in any case, re-throw the error
		throw error
	}
}
