# 🔐 Web Authentication

TODO: Add Intro

## [01. Cookies](./01.cookies/)

1. [Fetchers](./01.cookies/01.fetcher/)
2. [Theme Cookie](./01.cookies/02.theme/)
3. [Optimistic Theme](./01.cookies/03.optimistic-theme/)

Cookies have been an essential part of web browsing since the very beginning of the web. They store small pieces of data on a user's device that is sent to the server which it can then use to facilitate various functions such as maintaining session information, remembering user preferences, and tracking user behaviour.

> **What about GDPR?**
>
> The usage of cookies has evolved throughout the history of the web, and with it comes increasing concerns about data privacy. Regulations such as [GDPR](https://gdpr.eu/what-is-gdpr/) enforce a certain level of standard regarding data privacy and security, and limiting how much of the user's data can be used for tracking purposes. Nowadays, modern browsers provide users with the ability to block or remove cookies from certain websites.
>
> The whole topic of GDPR is fairly broad and beyond the scope of this workshop. Does this mean we should be displaying a GDPR banner on our project? Not for now. In this workshop we'll be focusing mostly on how cookies provide a secure solution for managing user sessions - If you avoid the use of cookies for tracking and advertising purposes, you should generally be fine without a consent banner.

Another common way to store user data in a web application is by using `localStorage`. While using `localStorage` is fine for basic purposes, it does come with a few downsides: Data stored in `localStorage` can be accessed by any script running on the page, and requests to the server do not include data stored in `localStorage`, making it significantly slower as it needs to wait for an additional request to the server before displaying user-specific information.

In this exercise, we demonstrate a basic implementation of cookies by building a theme switcher for the Epic Notes app. On the server side, we use the [`cookie`](https://www.npmjs.com/package/cookie) package to parse and serialize requests containing cookie headers, while on the client side we use Remix's [`useFetcher()`](https://remix.run/docs/en/main/hooks/use-fetcher) hook to make form requests that don't involve a navigation.

We also implement optimistic UI for our theme switcher so that the user can immediately see the change without needing to wait for the server response. We also abstract our implementation into a `useTheme()` hook where we use Remix's [`useFetchers()`](https://remix.run/docs/en/main/hooks/use-fetchers) hook to get the form data from our theme fetcher, which we then use to immediately apply the changes into the UI.

> [!NOTE]
>
> Remix v2.2.0+ makes our `useTheme()` implementation much easier by letting us provide a `key` on our `useFetcher()` call, so we can skip manually finding our theme fetcher from `useFetchers()` and instead use another `useFetcher()` call using the same `key` to get our theme value!

## [02. Session Storage](./02.session-storage/)

1. [Cookie Session Storage](./02.session-storage/01.session/)
2. [Session Set](./02.session-storage/02.set/)
3. [Session Unset](./02.session-storage/03.unset/)
4. [Session Flash Messages](./02.session-storage/04.flash/)

As mentioned earlier, cookies are a great solution for securely managing user sessions. By making use of HTTP-only cookies, we can ensure that important data regarding user authentication cannot be easily modified by client-side scripts. There are multiple attributes we can configure for our cookies, and fortunately Remix also provides some handy utilities to help us quickly set up cookies for our application.

In this exercise, we make use of Remix's [`createCookieSessionStorage()`](https://remix.run/docs/en/main/utils/sessions#createcookiesessionstorage) utility. As the name implies, we can create a session storage using cookies (not to be confused by `window.sessionStorage`) to track the user's session. For now, we use the session storage to implement a flashed toast message whenever the user deletes a note.

Using session storage to display a toast message is relatively straightforward - setting up the `createCookieSessionStorage()` for the toast message gives us `getSession()` and `commitSession()` functions which we can use in other parts of the application. When we want to display a toast message, we pass the cookie header into `getSession()`, `set()` the config object for our toast display, and add a `set-cookie` header with the value returned by `commitSession()` to our `Response`. Then we can call `getSession()` once more in the loader which needs to consume the session value, then `get()` the value we stored in the session object which we can then use in our UI.

We also want to make sure to clear the toast value once we finish displaying it so the user only sees the message once and it disappears after they refresh the page. We can simply `unset()` the toast value after we call the `get()` method, or we can call `flash()` instead of `set()` and it should automatically disappear after the user refreshes the page. Either way, we also need to make sure to call `commitSession()` once again after consuming the value in the loader so that we actually save the cleared toast session.

## [03. User Session](./03.user-sessions/)

1. [Session Storage](./03.user-sessions/01.session/)
2. [Set the userId](./03.user-sessions/02.login/)
3. [Load the User](./03.user-sessions/03.root/)

And now we finally start managing user sessions using the `sessionStorage` utility!

This exercise goes through the exact same steps as the previous exercise, but since we want the user's session data to persist even when the user refreshes the page we don't call `flash()` or `unset()` after consuming the data in the loader.

Using Remix's session storage utilities, we store the user's ID in a cookie (after making sure the user to be logged in actually exists, that is), then we can use the stored ID in a loader to query the user from our Prisma database, after which we can return the user data like usual. We also configured the cookie to be `secure`, so checking the `Application` tab in the DevTools shows us an encrypted value when we try to view the session data we just stored.

## [04. Password Management](./04.password/)

1. [Data Model for Passwords](./04.password/01.schema/)
2. [Seeding Password Hashes](./04.password/02.seed/)
3. [Sign Up](./04.password/03.signup/)

Before we can implement the Login feature, we need to add another field to our `User` model to allow users to input their passwords.

In this workshop, we won't be storing the passwords as plain text - instead we'll store the _hash_ of the passwords to make it a lot harder for malicious attackers from easily gaining access to user accounts. Hashing passwords protects us from [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), and we'll also add a "salt" to our hashed passwords to protect us from Rainbow Table attacks (where an attacker looks up our hash in a precomputed table of hashes and their inputs). Sounds complicated, but all we'll really be doing is use a library called [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) to generate a salted hashed password when we create user accounts.

To add another layer of security for our passwords, we won't directly store the hashes in the `User` table - Instead, we'll create a separate `Password` table containing our hash and give it a a one-to-one relationship with the `User`. This way, even if another developer accidentally selects the entire `User` table (e.g. by not providing a `select` field in a Prisma db call), the user passwords won't be included on the response.

> [!NOTE]
>
> The lecture notes explains one caveat when using this method for storing passwords:
>
> _"Unfortunately, it's not possible to enforce a required value on both sides of a one-to-one relationship. So we can't enforce that a password is required on the `User` model at the database level. However, it's worth the tradeoff to avoid the risk of leaking passwords. (see this [issue](https://github.com/epicweb-dev/web-auth/issues/7#issue-1912551875) for more information)."_

We also add the password field in our database seed script, creating a reusable utility function for hashing a given password string (or a randomized string as a default).

Finally, 🧝‍♂️ Kellie also implemented the session logic for the `signup` route using a similar flow as the `login` route, so all that's left to do is read the user's `password` input from the form data and store it as a salted hash using `bcryptjs`. We also make sure that the `bcryptjs` module won't be included in the client bundle by re-exporting it from a server-only module file.

## [05. Login](./05.login/)

1. [Login](./05.login/01.login/)
2. [UI Utils](./05.login/02.ui-utils/)

With the changes we've made to our Prisma schema, we can finally implement a Login functionality to our project!

In this exercise, we use `bcrypt` to compare the user's submitted password with the hash that's stored in the database. From there it's simply a matter of adding another error message when the password don't match, which is trivial with the validation setup we currently have.

> [!NOTE]
>
> We also briefly discuss _timing attacks_, where a malicious user can measure the response time for each request and compare these timings to determine whether a username is registered or not. Because the `bcrypt.compare()` function we're using is supposed to be slow, the response for a registered user will take much longer than a nonexistent user (because we immediately throw the error message in that case). For our app, this vulnerability doesn't matter much (all users are publicly visible anyway), but for other apps that require a much stricter security, you might want to look into randomizing response times to help against these kinds of attacks!

We also make some changes to our project's UI to reflect the currently logged in user, if any. Using Remix's [`useRouteLoaderData()`](https://remix.run/docs/en/main/hooks/use-route-loader-data), we can get the user data from the root loader, then use that data to compare the owner IDs in the notes and profile pages. With that, we can now make sure that users can modify/delete only their own notes, and they can't add notes for other users (at least on the client side, we'll get to validating ownership on the server side later!)
