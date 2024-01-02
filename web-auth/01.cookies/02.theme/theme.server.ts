// 🐨 you're going to need the cookie module here:
import * as cookie from 'cookie'

const cookieName = 'theme'
export type Theme = 'light' | 'dark'

// 🦉 The default for us will be 'light', so if we can't determine the theme,
// then you'll want to return 'light'
const defaultTheme = 'light'

export function getTheme(request: Request): Theme {
	// 🐨 get the cookie header from the request
	const cookieHeader = request.headers.get('cookie')
	const parsed = cookieHeader
		? // 🐨 parse the cookie header
			// 🐨 get the value for the cookie called 'theme'
			cookie.parse(cookieHeader)[cookieName]
		: // 🐨 if the cookie header is `null`, return the default
			defaultTheme
	// 🐨 if the value is a valid cookie value, return it, otherwise return the default
	if (parsed === 'light' || parsed === 'dark') return parsed
	return defaultTheme
}

export function setTheme(theme: Theme) {
	// 🐨 serialize the theme as a cookie called 'theme'
	// 💰 make sure to set the path to '/' so it applies to the entire site.
	return cookie.serialize(cookieName, theme, { path: '/' })
}
