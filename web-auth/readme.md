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
