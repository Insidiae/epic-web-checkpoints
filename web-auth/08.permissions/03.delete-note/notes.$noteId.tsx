import { useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, type DataFunctionArgs } from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	type MetaFunction,
} from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { getUserId, requireUser } from '#app/utils/auth.server.ts'
import { validateCSRF } from '#app/utils/csrf.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	getNoteImgSrc,
	invariantResponse,
	useIsPending,
} from '#app/utils/misc.tsx'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { useOptionalUser } from '#app/utils/user.ts'
import { type loader as notesLoader } from './notes.tsx'

export async function loader({ request, params }: DataFunctionArgs) {
	// 🐨 get the user id from the request (remember, unauthenticated users should
	// be able to see these notes too, so use getUserId instead of requireUserId).
	const userId = await getUserId(request)

	const note = await prisma.note.findUnique({
		where: { id: params.noteId },
		select: {
			id: true,
			title: true,
			content: true,
			ownerId: true,
			updatedAt: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
		},
	})

	invariantResponse(note, 'Not found', { status: 404 })

	const date = new Date(note.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	// 💰 this query is a little tricky if you're unfamiliar with Prisma so make
	// sure to check the example in the instructions.
	// 🐨 get the permission here. If the userId does not exist, don't bother,
	// as the permission should just be null. If it does though, get the
	// permission where "some" of the permission's roles have "some" users with the userId
	// 📜 https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#some
	// 💰 you have the note.ownerId, so you can use that to decide whether you
	// should be looking for "access: 'own'" or "access: 'any'".
	const permission = userId
		? await prisma.permission.findFirst({
				select: { id: true },
				where: {
					roles: { some: { users: { some: { id: userId } } } },
					entity: 'note',
					action: 'delete',
					access: note.ownerId === userId ? 'own' : 'any',
				},
			})
		: null

	return json({
		note,
		timeAgo,
		// 🐨 set canDelete to whether there is a matching permission
		canDelete: Boolean(permission),
	})
}

const DeleteFormSchema = z.object({
	intent: z.literal('delete-note'),
	noteId: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	const user = await requireUser(request)
	const formData = await request.formData()
	await validateCSRF(formData, request.headers)
	const submission = parse(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	const { noteId } = submission.value

	const note = await prisma.note.findFirst({
		// 🐨 now we need the ownerId as well so we can determine whether the current user is the owner
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
		// 💣 since admins can delete notes, we can't filter by userId anymore, remove that
		// where: { id: noteId, ownerId: user.id },
		where: { id: noteId },
	})
	invariantResponse(note, 'Not found', { status: 404 })

	// 🐨 do an identical permission query to the one above.
	const permission = await prisma.permission.findFirst({
		select: { id: true },
		where: {
			roles: { some: { users: { some: { id: user.id } } } },
			entity: 'note',
			action: 'delete',
			access: note.ownerId === user.id ? 'own' : 'any',
		},
	})

	// 🐨 if there is no permission, then throw a response with a 403 status code
	// which you can handle in the error boundary below
	if (!permission) {
		throw json(
			{
				error: 'Unauthorized',
				message: `Unauthorized: requires permission delete:note`,
			},
			{ status: 403 },
		)
	}

	await prisma.note.delete({ where: { id: note.id } })

	throw await redirectWithToast(`/users/${note.owner.username}/notes`, {
		type: 'success',
		title: 'Success',
		description: 'Your note has been deleted.',
	})
}

export default function NoteRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.note.ownerId
	// 🐨 get this value from the loader data
	const canDelete = data.canDelete
	const displayBar = canDelete || isOwner

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">{data.note.title}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<ul className="flex flex-wrap gap-5 py-5">
					{data.note.images.map(image => (
						<li key={image.id}>
							<a href={getNoteImgSrc(image.id)}>
								<img
									src={getNoteImgSrc(image.id)}
									alt={image.altText ?? ''}
									className="h-32 w-32 rounded-lg object-cover"
								/>
							</a>
						</li>
					))}
				</ul>
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.note.content}
				</p>
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDelete ? <DeleteNote id={data.note.id} /> : null}
						<Button
							asChild
							className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-md:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteNote({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-note',
		lastSubmission: actionData?.submission,
		constraint: getFieldsetConstraint(DeleteFormSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: DeleteFormSchema })
		},
	})

	return (
		<Form method="post" {...form.props}>
			<AuthenticityTokenInput />
			<input type="hidden" name="noteId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-note"
				variant="destructive"
				status={isPending ? 'pending' : actionData?.status ?? 'idle'}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/notes': typeof notesLoader }
> = ({ data, params, matches }) => {
	const notesMatch = matches.find(
		m => m.id === 'routes/users+/$username_+/notes',
	)
	const displayName = notesMatch?.data?.owner.name ?? params.username
	const noteTitle = data?.note.title ?? 'Note'
	const noteContentsSummary =
		data && data.note.content.length > 100
			? data?.note.content.slice(0, 97) + '...'
			: 'No content'
	return [
		{ title: `${noteTitle} | ${displayName}'s Notes | Epic Notes` },
		{
			name: 'description',
			content: noteContentsSummary,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				// 🐨 add a 403 handler here and just say they're not allowed.
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
