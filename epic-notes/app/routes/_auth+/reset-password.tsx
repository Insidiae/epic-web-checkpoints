import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
	json,
	type DataFunctionArgs,
	type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { GeneralErrorBoundary } from "#app/components/error-boundary.tsx";
import { ErrorList, Field } from "#app/components/forms.tsx";
import { StatusButton } from "#app/components/ui/status-button.tsx";
import { useIsPending } from "#app/utils/misc.tsx";
import { PasswordSchema } from "#app/utils/user-validation.ts";
import { type VerifyFunctionArgs } from "./verify.tsx";

export async function handleVerification({
	request,
	submission,
}: VerifyFunctionArgs) {
	//TODO: We'll implement this soon!
}

const ResetPasswordSchema = z
	.object({
		password: PasswordSchema,
		confirmPassword: PasswordSchema,
	})
	.refine(({ confirmPassword, password }) => password === confirmPassword, {
		message: "The passwords did not match",
		path: ["confirmPassword"],
	});

export async function loader() {
	const resetPasswordUsername = "get this from the session";
	return json({ resetPasswordUsername });
}

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData();
	const submission = parse(formData, {
		schema: ResetPasswordSchema,
	});
	if (submission.intent !== "submit") {
		return json({ status: "idle", submission } as const);
	}
	if (!submission.value?.password) {
		return json({ status: "error", submission } as const, { status: 400 });
	}

	throw new Error("This has not yet been implemented");
}

export const meta: MetaFunction = () => {
	return [{ title: "Reset Password | Epic Notes" }];
};

export default function ResetPasswordPage() {
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();

	const [form, fields] = useForm({
		id: "reset-password",
		constraint: getFieldsetConstraint(ResetPasswordSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ResetPasswordSchema });
		},
		shouldRevalidate: "onBlur",
	});

	return (
		<div className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				<h1 className="text-h1">Password Reset</h1>
				<p className="mt-3 text-body-md text-muted-foreground">
					Hi, {data.resetPasswordUsername}. No worries. It happens all the time.
				</p>
			</div>
			<div className="mx-auto mt-16 min-w-[368px] max-w-sm">
				<Form method="POST" {...form.props}>
					<Field
						labelProps={{
							htmlFor: fields.password.id,
							children: "New Password",
						}}
						inputProps={{
							...conform.input(fields.password, { type: "password" }),
							autoComplete: "new-password",
							autoFocus: true,
						}}
						errors={fields.password.errors}
					/>
					<Field
						labelProps={{
							htmlFor: fields.confirmPassword.id,
							children: "Confirm Password",
						}}
						inputProps={{
							...conform.input(fields.confirmPassword, { type: "password" }),
							autoComplete: "new-password",
						}}
						errors={fields.confirmPassword.errors}
					/>

					<ErrorList errors={form.errors} id={form.errorId} />

					<StatusButton
						className="w-full"
						status={isPending ? "pending" : actionData?.status ?? "idle"}
						type="submit"
						disabled={isPending}
					>
						Reset password
					</StatusButton>
				</Form>
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
