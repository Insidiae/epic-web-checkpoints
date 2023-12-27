import { type MetaFunction } from '@remix-run/react'
import { type loader as notesLoader } from './notes.tsx'

export default function NotesIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select a note</p>
		</div>
	)
}

// 🦺 check the note below for making this type safe
export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/notes': typeof notesLoader }
> = ({ params, matches }) => {
	// 🐨 use the matches from the parameters to find the route for notes by that ID
	// 💰 matches.find(m => m.id === 'routes/users+/$username_+/notes')
	// 🐨 use the matches to find the notes route
	const notesMatch = matches.find(
		m => m.id === 'routes/users+/$username_+/notes',
	)

	// 🐨 determine the user's display name from the notesMatch's data
	const displayName = notesMatch?.data?.owner.name ?? params.username

	// 🐨 determine the user's count of notes from the notesMatch's data
	const noteCount = notesMatch?.data?.notes.length ?? 0
	const notesText = noteCount === 1 ? 'note' : 'notes'
	return [
		{ title: `${displayName}'s Notes | Epic Notes` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
		},
	]
}

// 🦺 If you want it to be typed, then add a type for the loaders to the
// MetaFunction generic. You can use null for the first argument (no loader).
// And for the second, you use an object mapping the ID to that route's loader's
// type. It's ID is `routes/users+/$username_+/notes` and you can import the
// notes loader from the parent route `./notes.tsx`
// 💰 { 'routes/users+/$username_+/notes': typeof notesLoader }
