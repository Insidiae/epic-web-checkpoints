import os from "node:os";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
	json,
	type LoaderFunctionArgs,
	type LinksFunction,
} from "@remix-run/node";
import {
	Link,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useMatches,
	type MetaFunction,
} from "@remix-run/react";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import faviconAssetUrl from "./assets/favicon.svg";
import { GeneralErrorBoundary } from "./components/error-boundary.tsx";
import { SearchBar } from "./components/search-bar.tsx";
import fontStylesheetUrl from "./styles/font.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { csrf } from "./utils/csrf.server.ts";
import { getEnv } from "./utils/env.server.ts";
import { honeypot } from "./utils/honeypot.server.ts";

export const links: LinksFunction = () => {
	return [
		{ rel: "icon", type: "image/svg+xml", href: faviconAssetUrl },
		{ rel: "stylesheet", href: fontStylesheetUrl },
		{ rel: "stylesheet", href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: "stylesheet", href: cssBundleHref } : null,
	].filter(Boolean);
};

export async function loader({ request }: LoaderFunctionArgs) {
	const honeyProps = honeypot.getInputProps();
	const [csrfToken, csrfCookieHeader] = await csrf.commitToken();

	return json(
		{ username: os.userInfo().username, ENV: getEnv(), honeyProps, csrfToken },
		{
			headers: csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : {},
		},
	);
}

export const meta: MetaFunction = () => {
	return [
		{ title: "Epic Notes" },
		{ name: "description", content: `Your own captain's log` },
	];
};

function Document({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="h-full overflow-x-hidden">
			<head>
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Links />
			</head>
			<body className="flex h-full flex-col justify-between bg-background text-foreground">
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

function App() {
	const data = useLoaderData<typeof loader>();
	const matches = useMatches();
	const isOnSearchPage = matches.find(m => m.id === "routes/users+/index");

	return (
		<Document>
			<header className="container mx-auto py-6">
				<nav className="flex items-center justify-between gap-6">
					<Link to="/">
						<div className="font-light">epic</div>
						<div className="font-bold">notes</div>
					</Link>
					{isOnSearchPage ? null : (
						<div className="ml-auto max-w-sm flex-1">
							<SearchBar status="idle" />
						</div>
					)}
					<Link className="underline" to="/users/kody/notes">
						Kody's Notes
					</Link>
				</nav>
			</header>

			<div className="flex-1">
				<Outlet />
			</div>

			<div className="container mx-auto flex justify-between">
				<Link to="/">
					<div className="font-light">epic</div>
					<div className="font-bold">notes</div>
				</Link>
				<p>Built with ♥️ by {data.username}</p>
			</div>
			<div className="h-5" />
			<script
				dangerouslySetInnerHTML={{
					__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
				}}
			/>
		</Document>
	);
}

export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>();

	return (
		<HoneypotProvider {...data.honeyProps}>
			<AuthenticityTokenProvider token={data.csrfToken}>
				<App />
			</AuthenticityTokenProvider>
		</HoneypotProvider>
	);
}

export function ErrorBoundary() {
	return (
		<Document>
			<div className="flex-1">
				<GeneralErrorBoundary />
			</div>
		</Document>
	);
}
