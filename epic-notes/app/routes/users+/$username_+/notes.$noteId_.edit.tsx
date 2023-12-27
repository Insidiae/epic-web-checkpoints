import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";

export async function loader({ params }: LoaderFunctionArgs) {
	const note = db.note.findFirst({
		where: {
			id: {
				equals: params.noteId,
			},
		},
	});

	invariantResponse(note, "Note not found", { status: 404 });

	return json({
		note: { title: note.title, content: note.content },
	});
}

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>();

	return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
