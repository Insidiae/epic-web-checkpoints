import { type MetaFunction } from '@remix-run/react'
import { type loader as notesLoader } from './notes.tsx'

export default function NotesIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select a note</p>
		</div>
	)
}

export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/notes': typeof notesLoader }
> = ({ params, matches }) => {
	const notesMatch = matches.find(
		m => m.id === 'routes/users+/$username_+/notes',
	)
	const displayName = notesMatch?.data?.owner.name ?? params.username
	// 🐨 update this to get the notes off the owner
	// 🦺 ISN'T IT AWESOME THAT TYPESCRIPT KNEW YOU NEEDED TO UPDATE THIS!?!?
	// 🦉 yes... yes it is, Lily.
	// const noteCount = notesMatch?.data?.notes.length ?? 0
	const noteCount = notesMatch?.data?.owner.notes.length ?? 0
	const notesText = noteCount === 1 ? 'note' : 'notes'
	return [
		{ title: `${displayName}'s Notes | Epic Notes` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
		},
	]
}
