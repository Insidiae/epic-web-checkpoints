import { getErrorMessage } from './misc.tsx'

export async function sendEmail(options: {
	to: string
	subject: string
	html?: string
	text: string
}) {
	const from = 'hello@epicstack.dev'

	const email = {
		// 🐨 set the from to whatever address you'd like
		from,
		...options,
	}

	// 📜 https://resend.com/docs/api-reference/emails/send-email
	// 🐨 await a fetch call to the resend API: 'https://api.resend.com/emails'
	const response = await fetch('https://api.resend.com/emails', {
		// 🐨 the method should be POST
		method: 'POST',
		// 🐨 the body should be JSON.stringify(email)
		body: JSON.stringify(email),
		// 🐨 the headers should include:
		//   Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
		//   'content-type': 'application/json'
		headers: {
			Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
			'content-type': 'application/json',
		},
	})
	// 🐨 await the response.json() and store it in a variable called data
	const data = await response.json()

	// 🐨 if the response.ok is truthy, then return {status: 'success'}
	if (response.ok) {
		return { status: 'success' } as const
	} else {
		// 🐨 otherwise, return {status: 'error', error: getErrorMessage(data)}
		// 💰 getErrorMessage comes from misc.tsx
		return {
			status: 'error',
			error: getErrorMessage(data),
		} as const
	}
}
