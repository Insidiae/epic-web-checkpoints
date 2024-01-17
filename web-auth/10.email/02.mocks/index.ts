import closeWithGrace from 'close-with-grace'
import { passthrough, http } from 'msw'
// 🐨 you're gonna want these
import { setupServer } from 'msw/node'
import { handlers as resendHandlers } from './resend.ts'

const miscHandlers = [
	process.env.REMIX_DEV_ORIGIN
		? http.post(`${process.env.REMIX_DEV_ORIGIN}ping`, passthrough)
		: null,
].filter(Boolean)

// 🐨 call setupServer with the handlers here
// 💰 make sure to include both the miscHandlers and the resendHandlers
export const server = setupServer(...miscHandlers, ...resendHandlers)

// 🐨 call server.listen with an onUnhandledRequest of 'warn'
server.listen({ onUnhandledRequest: 'warn' })

console.info('🔶 Mock server installed')

closeWithGrace(() => {
	// 🐨 call server.close here
	server.close()
})
