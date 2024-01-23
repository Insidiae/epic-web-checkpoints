import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { generateTOTP } from '@epic-web/totp'
import {
	json,
	redirect,
	type DataFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList, Field } from '#app/components/forms.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireAnonymous } from '#app/utils/auth.server.ts'
import { validateCSRF } from '#app/utils/csrf.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { sendEmail } from '#app/utils/email.server.ts'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { getDomainUrl, useIsPending } from '#app/utils/misc.tsx'
import { EmailSchema } from '#app/utils/user-validation.ts'

const SignupSchema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
})

export async function loader({ request }: DataFunctionArgs) {
	await requireAnonymous(request)
	return json({})
}

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	await validateCSRF(formData, request.headers)
	checkHoneypot(formData)
	const submission = await parse(formData, {
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			})
			if (existingUser) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
				})
				return
			}
		}),

		async: true,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value?.email) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}
	const { email } = submission.value

	// 🐨 generate the one-time password which we'll email to the user using generateTOTP from '@epic-web/totp'
	// 💰 use the "SHA256" algorithm and a period of 10 minutes (10 * 60)
	// 💰 this will give you an object that has all the verification config which you'll save in the db and
	// the otp you can email to the user.
	const { otp, ...verificationConfig } = generateTOTP({
		algorithm: 'SHA256',
		period: 10 * 60, // valid for 10 minutes
	})

	// 🐨 create a "redirectToUrl" to send the user to, it should go to the "/verify" route
	// 💰 We need to send the full URL, so you can use getDomainUrl(request) to get the domain
	//   new URL(`${getDomainUrl(request)}/verify`)
	const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`)
	// 🐨 set the searchParam "type" to "onboarding"
	const type = 'onboarding'
	redirectToUrl.searchParams.set('type', type)
	// 🐨 set the searchParam "target" to the email address the user provided
	redirectToUrl.searchParams.set('target', email)
	// 🐨 make a copy of the redirectToUrl and call it the "verifyUrl" (💰 new URL(redirectToUrl))
	const verifyUrl = new URL(redirectToUrl)
	// 🐨 set the searchParam "code" to the otp you got from generateTOTP
	verifyUrl.searchParams.set('code', otp)

	// 🐨 use upsert to insert/update a verification with the verification config
	const verificationData = {
		// 🐨 set the type to "onboarding" and target to the user's email
		type,
		target: email,
		...verificationConfig,
		// 🐨 set the expiresAt to a date 10 minutes in the future
		expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
	}
	await prisma.verification.upsert({
		where: { target_type: { target: email, type } },
		create: verificationData,
		update: verificationData,
	})

	const response = await sendEmail({
		to: email,
		subject: `Welcome to Epic Notes!`,
		// 🐨 update this to include the otp and the verifyUrl
		// text: `This is a test email`,
		text: `Here's your code: ${otp}. Or open this: ${verifyUrl.toString()}`,
	})

	if (response.status === 'success') {
		// 🦉 we're going to move all this to the verify route, because we don't want
		// to set this until *after* the user has verified their email.
		// 💣 delete all this stuff
		// const verifySession = await verifySessionStorage.getSession(
		// 	request.headers.get('cookie'),
		// )
		// verifySession.set(onboardingEmailSessionKey, email)
		// return redirect('/onboarding', {
		// 	headers: {
		// 		'set-cookie': await verifySessionStorage.commitSession(verifySession),
		// 	},
		// })
		// 🐨 redirect the user to the redirectToUrl.
		return redirect(redirectToUrl.toString())
	} else {
		submission.error[''] = [response.error]
		return json({ status: 'error', submission } as const, { status: 500 })
	}
}

export const meta: MetaFunction = () => {
	return [{ title: 'Sign Up | Epic Notes' }]
}

export default function SignupRoute() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getFieldsetConstraint(SignupSchema),
		defaultValue: { redirectTo },
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			const result = parse(formData, { schema: SignupSchema })
			return result
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				<h1 className="text-h1">Let's start your journey!</h1>
				<p className="mt-3 text-body-md text-muted-foreground">
					Please enter your email.
				</p>
			</div>
			<div className="mx-auto mt-16 min-w-[368px] max-w-sm">
				<Form method="POST" {...form.props}>
					<AuthenticityTokenInput />
					<HoneypotInputs />
					<Field
						labelProps={{
							htmlFor: fields.email.id,
							children: 'Email',
						}}
						inputProps={{ ...conform.input(fields.email), autoFocus: true }}
						errors={fields.email.errors}
					/>

					<input {...conform.input(fields.redirectTo, { type: 'hidden' })} />
					<ErrorList errors={form.errors} id={form.errorId} />
					<StatusButton
						className="w-full"
						status={isPending ? 'pending' : actionData?.status ?? 'idle'}
						type="submit"
						disabled={isPending}
					>
						Submit
					</StatusButton>
				</Form>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
