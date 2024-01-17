import 'dotenv/config'
import { installGlobals } from '@remix-run/node'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'

installGlobals()

if (
	process.env.NODE_ENV !== 'production' ||
	process.env.PLAYWRIGHT_TEST_BASE_URL
) {
	process.env.TESTING = 'true'
}

closeWithGrace(async ({ err }) => {
	if (err) {
		console.error(chalk.red(err))
		console.error(chalk.red(err.stack))
		process.exit(1)
	}
})

// 🐨 if process.env.MOCKS === 'true'
// then dynamically import the mocks from './tests/mocks/index.ts'
if (process.env.MOCKS === 'true') {
	await import('./tests/mocks/index.ts')
}

if (process.env.NODE_ENV === 'production') {
	await import('./server-build/index.js')
} else {
	await import('./server/index.ts')
}
