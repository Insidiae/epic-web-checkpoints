import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { z } from "zod";
import { GeneralErrorBoundary } from "#app/components/error-boundary.tsx";
import { ErrorList, Field } from "#app/components/forms.tsx";
import { StatusButton } from "#app/components/ui/status-button.tsx";
import { requireAnonymous } from "#app/utils/auth.server.ts";
import { validateCSRF } from "#app/utils/csrf.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { sendEmail } from "#app/utils/email.server.ts";
import { checkHoneypot } from "#app/utils/honeypot.server.ts";
import { useIsPending } from "#app/utils/misc.tsx";
import { EmailSchema } from "#app/utils/user-validation.ts";

const SignupSchema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request);
	return json({});
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request);
	const formData = await request.formData();
	await validateCSRF(formData, request.headers);
	checkHoneypot(formData);
	const submission = await parse(formData, {
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			});
			if (existingUser) {
				ctx.addIssue({
					path: ["email"],
					code: z.ZodIssueCode.custom,
					message: "A user already exists with this email",
				});
				return;
			}
		}),
		async: true,
	});

	if (submission.intent !== "submit") {
		return json({ status: "idle", submission } as const);
	}
	if (!submission.value?.email) {
		return json({ status: "error", submission } as const, { status: 400 });
	}
	const { email } = submission.value;

	const response = await sendEmail({
		to: email,
		subject: `Welcome to Epic Notes!`,
		text: `This is a test email`,
	});

	if (response.status === "success") {
		// we'll handle this soon...
		return redirect("/onboarding");
	} else {
		submission.error[""] = [response.error];
		return json({ status: "error", submission } as const, { status: 500 });
	}
}

export const meta: MetaFunction = () => {
	return [{ title: "Sign Up | Epic Notes" }];
};

export default function SignupRoute() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();

	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");

	const [form, fields] = useForm({
		id: "signup-form",
		constraint: getFieldsetConstraint(SignupSchema),
		defaultValue: { redirectTo },
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			const result = parse(formData, { schema: SignupSchema });
			return result;
		},
		shouldRevalidate: "onBlur",
	});

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
							children: "Email",
						}}
						inputProps={{ ...conform.input(fields.email), autoFocus: true }}
						errors={fields.email.errors}
					/>

					<input {...conform.input(fields.redirectTo, { type: "hidden" })} />
					<ErrorList errors={form.errors} id={form.errorId} />

					<StatusButton
						className="w-full"
						status={isPending ? "pending" : actionData?.status ?? "idle"}
						type="submit"
						disabled={isPending}
					>
						Submit
					</StatusButton>
				</Form>
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
