import * as cookie from "cookie";

const cookieName = "theme";
export type Theme = "light" | "dark";

const defaultTheme = "light";

export function getTheme(request: Request): Theme {
	const cookieHeader = request.headers.get("cookie");

	const parsed = cookieHeader
		? cookie.parse(cookieHeader)[cookieName]
		: defaultTheme;

	if (parsed === "light" || parsed === "dark") return parsed;
	return defaultTheme;
}

export function setTheme(theme: Theme) {
	return cookie.serialize(cookieName, theme, { path: "/" });
}
