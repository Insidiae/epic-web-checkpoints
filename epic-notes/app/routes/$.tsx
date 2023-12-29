// This is called a "splat route" and as it's in the root `/app/routes/`
// directory, it's a catchall. If no other routes match, this one will and we
// can know that the user is hitting a URL that doesn't exist. By throwing a
// 404 from the loader, we can force the error boundary to render which will
// ensure the user gets the right status code and we can display a nicer error
// message for them than the Remix and/or browser default.

import { Link, useLocation } from "@remix-run/react";
import { GeneralErrorBoundary } from "../components/error-boundary.tsx";

export async function loader() {
	throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
	// due to the loader, this component will never be rendered, but we'll return
	// the error boundary just in case.
	return <ErrorBoundary />;
}

export function ErrorBoundary() {
	const location = useLocation();
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => (
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-3">
							<h1>We can't find this page:</h1>
							<pre className="text-body-lg whitespace-pre-wrap break-all">
								{location.pathname}
							</pre>
						</div>
						<Link to="/" className="text-body-md underline">
							Back to home
						</Link>
					</div>
				),
			}}
		/>
	);
}
