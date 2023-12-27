import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { db } from '#app/utils/db.server.ts'
import { invariantResponse } from '#app/utils/misc.tsx'

export async function loader({ params }: DataFunctionArgs) {
	const note = db.note.findFirst({
		where: {
			id: {
				equals: params.noteId,
			},
		},
	})

	invariantResponse(note, 'Note not found', { status: 404 })

	return json({
		note: { title: note.title, content: note.content },
	})
}

// 🐨 export an action function that uses the params from the DataFunctionArgs
export async function action({ params }: DataFunctionArgs) {
	//  🐨 delete the note from the database (💰 db.note.delete({ where: { id: { equals: params.noteId } } }))
	db.note.delete({ where: { id: { equals: params.noteId } } })

	//  🐨 return a redirect to the user's notes page
	return redirect(`/users/${params.username}/notes`)
}

export default function NoteRoute() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">{data.note.title}</h2>
			<div className="overflow-y-auto pb-24">
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.note.content}
				</p>
			</div>
			<div className={floatingToolbarClassName}>
				{/* 🐨 wrap this Button in a Form with the proper method */}
				<Form method="POST">
					<Button
						// 🐨 add a type="submit" prop to this Button
						type="submit"
						variant="destructive"
					>
						Delete
					</Button>
				</Form>
				<Button asChild>
					<Link to="edit">Edit</Link>
				</Button>
			</div>
		</div>
	)
}
