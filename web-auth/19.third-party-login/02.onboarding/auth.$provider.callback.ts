import { redirect, type DataFunctionArgs } from '@remix-run/node'
import {
	authenticator,
	getSessionExpirationDate,
	getUserId,
} from '#app/utils/auth.server.ts'
import { ProviderNameSchema, providerLabels } from '#app/utils/connections.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { verifySessionStorage } from '#app/utils/verification.server.ts'
import { handleNewSession } from './login.tsx'
// 💰 you're gonna want these:
import {
	onboardingEmailSessionKey,
	prefilledProfileKey,
	providerIdKey,
} from './onboarding_.$provider.tsx'

export async function loader({ request, params }: DataFunctionArgs) {
	const providerName = ProviderNameSchema.parse(params.provider)

	const label = providerLabels[providerName]

	const profile = await authenticator
		.authenticate(providerName, request, { throwOnError: true })
		.catch(async error => {
			console.error(error)
			throw await redirectWithToast('/login', {
				type: 'error',
				title: 'Auth Failed',
				description: `There was an error authenticating with ${label}.`,
			})
		})

	const existingConnection = await prisma.connection.findUnique({
		select: { userId: true },
		where: {
			providerName_providerId: { providerName, providerId: profile.id },
		},
	})

	const userId = await getUserId(request)

	if (existingConnection && userId) {
		throw await redirectWithToast('/settings/profile/connections', {
			title: 'Already Connected',
			description:
				existingConnection.userId === userId
					? `Your "${profile.username}" ${label} account is already connected.`
					: `The "${profile.username}" ${label} account is already connected to another account.`,
		})
	}

	if (existingConnection) {
		const session = await prisma.session.create({
			select: { id: true, expirationDate: true, userId: true },
			data: {
				expirationDate: getSessionExpirationDate(),
				userId: existingConnection.userId,
			},
		})
		return handleNewSession({ request, session, remember: true })
	}

	// 🐨 get the verifySession here from verifySessionStorage.getSession
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)
	// 🐨 set the onboardingEmailSessionKey to the profile.email
	verifySession.set(onboardingEmailSessionKey, profile.email)
	// 🐨 set the prefilledProfileKey to the profile (you'll need to create this in the onboarding_.$provider route)
	verifySession.set(prefilledProfileKey, {
		...profile,
		// 💯 as extra credit, make sure the username matches our rules:
		username: profile.username
			// 1. only alphanumeric characters
			// 💰 you can replace invalid characters with "_"
			?.replace(/[^a-zA-Z0-9_]/g, '_')
			// 2. lowercase
			.toLowerCase()
			// 3. 3-20 characters long
			.slice(0, 20)
			.padEnd(3, '_'),
	})
	// 🐨 set the providerIdKey to the profile.id
	verifySession.set(providerIdKey, profile.id)
	// return a redirect to `/onboarding/${providerName}` and commit the verify session storage
	// throw await redirectWithToast('/login', {
	// 	title: 'Auth Success (jk)',
	// 	description: `You have successfully authenticated with ${label} (not really though...).`,
	// 	type: 'success',
	// })
	return redirect(`/onboarding/${providerName}`, {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	})
}
