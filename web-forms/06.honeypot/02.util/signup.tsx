import {
	redirect,
	type DataFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { SpamError } from 'remix-utils/honeypot/server'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { honeypot } from '#app/utils/honeypot.server.ts'

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	// 🐨 swap this with honeypot.check(formData)
	// invariantResponse(!formData.get("name"), "Form not submitted properly");
	try {
		honeypot.check(formData)
	} catch (error) {
		// 💯 for extra credit, if there's a spam error, catch it and throw a 400 response
		if (error instanceof SpamError) {
			throw new Response('Form not submitted properly', { status: 400 })
		}
		throw error
	}

	// we'll implement signup later
	return redirect('/')
}

export default function SignupRoute() {
	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome aboard!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details.
					</p>
				</div>
				<Form
					method="POST"
					className="mx-auto flex min-w-[368px] max-w-sm flex-col gap-4"
				>
					{/* 🐨 swap this for the HoneypotInputs component */}
					{/* <div style={{ display: 'none' }} aria-hidden>
						<label htmlFor="name-input">Please leave this field blank</label>
						<input id="name-input" name="name" type="text" />
					</div> */}
					<HoneypotInputs />
					<div>
						<Label htmlFor="email-input">Email</Label>
						<Input autoFocus id="email-input" name="email" type="email" />
					</div>
					<Button className="w-full" type="submit">
						Create an account
					</Button>
				</Form>
			</div>
		</div>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Setup Epic Notes Account' }]
}
