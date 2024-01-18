import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { Icon } from "#app/components/ui/icon.tsx";
import { StatusButton } from "#app/components/ui/status-button.tsx";
import { getRedirectToUrl } from "#app/routes/_auth+/verify.tsx";
import { requireUserId } from "#app/utils/auth.server.ts";
import { validateCSRF } from "#app/utils/csrf.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { useDoubleCheck, useIsPending } from "#app/utils/misc.tsx";
import { redirectWithToast } from "#app/utils/toast.server.ts";
import { shouldRequestTwoFA } from "../_auth+/login.tsx";
import { twoFAVerificationType } from "./profile.two-factor.tsx";

export const handle = {
	breadcrumb: <Icon name="lock-open-1">Disable</Icon>,
};

export async function requireRecentVerification({
	request,
	userId,
}: {
	request: Request;
	userId: string;
}) {
	const shouldReverify = await shouldRequestTwoFA({ request, userId });

	if (shouldReverify) {
		const reqUrl = new URL(request.url);
		const redirectUrl = getRedirectToUrl({
			request,
			target: userId,
			type: twoFAVerificationType,
			redirectTo: reqUrl.pathname + reqUrl.search,
		});

		throw await redirectWithToast(redirectUrl.toString(), {
			title: "Please Reverify",
			description: "Please reverify your account before proceeding",
		});
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireRecentVerification({
		request,
		userId: await requireUserId(request),
	});
	return json({});
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	await requireRecentVerification({ request, userId });
	const formData = await request.formData();
	await validateCSRF(formData, request.headers);

	await prisma.verification.delete({
		where: { target_type: { target: userId, type: twoFAVerificationType } },
	});

	throw await redirectWithToast("/settings/profile/two-factor", {
		title: "2FA Disabled",
		description: "Two factor authentication has been disabled.",
	});
}

export default function TwoFactorDisableRoute() {
	const isPending = useIsPending();
	const dc = useDoubleCheck();

	return (
		<div className="mx-auto max-w-sm">
			<Form method="POST">
				<AuthenticityTokenInput />
				<p>
					Disabling two factor authentication is not recommended. However, if
					you would like to do so, click here:
				</p>
				<StatusButton
					variant="destructive"
					status={isPending ? "pending" : "idle"}
					disabled={isPending}
					{...dc.getButtonProps({
						className: "mx-auto",
						name: "intent",
						value: "disable",
						type: "submit",
					})}
				>
					{dc.doubleCheck ? "Are you sure?" : "Disable 2FA"}
				</StatusButton>
			</Form>
		</div>
	);
}
