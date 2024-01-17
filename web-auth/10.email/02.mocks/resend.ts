import { faker } from '@faker-js/faker'
import { HttpResponse, http, type HttpHandler } from 'msw'
import { z } from 'zod'

const { json } = HttpResponse

const EmailSchema = z.object({
	to: z.string(),
	from: z.string(),
	subject: z.string(),
	text: z.string(),
	html: z.string().optional(),
})

// 🐨 create and export handlers here
// 🦺 the type is Array<HttpHandler>
export const handlers: Array<HttpHandler> = [
	// 🐨 handle http.post requests to `https://api.resend.com/emails`
	http.post(`https://api.resend.com/emails`, async ({ request }) => {
		// 🐨 get the body from await request.json()
		// 💯 as extra credit, make this typesafe by parsing it with zod
		const body = EmailSchema.parse(await request.json())

		// 🐨 log out the email body
		console.info('🔶 mocked email contents:', body)

		// 🐨 return json with the following properties: id, from, to, created_at
		return json({
			id: faker.string.uuid(),
			from: body.from,
			to: body.to,
			// 💰 you can use faker to generate the id and new Date().toISOString() for the created_at
			created_at: new Date().toISOString(),
		})
	}),
]
