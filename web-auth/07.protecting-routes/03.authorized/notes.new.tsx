import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { requireUser } from '#app/utils/auth.server.ts'
import { invariantResponse } from '#app/utils/misc.tsx'
import { action, NoteEditor } from './__note-editor.tsx'

// 🐨 add a loader here that requires the user and checks that the user.username
// is equal to params.username. If not, then throw a 403 response
// 💰 you can use invariantResponse for this.
export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await requireUser(request)
	invariantResponse(user.username === params.username, 'Not authorized', {
		status: 403,
	})
	// 🐨 Return json({}) because Remix requires loaders return something.
	return json({})
}

export { action }
export default NoteEditor
