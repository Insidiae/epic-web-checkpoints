# 🔭 Full Stack Foundations

In each of the EpicWeb.dev workshops, every exercise has an `📝 Elaboration` section in the feedback forms where we can write down what we've learned. To help organize my notes in an easy-to-access repo, I'll be writing down my notes in the `readme.md` files in each of the workshop solution folders.

In this first workshop, we learn some of the basics of [the Remix framework](https://remix.run/), using it as a stepping stone to learn the foundations of writing full stack applications. We'll be setting up some of the important configurations like importing assets (such as favicons and stylesheets), SEO tags, and error handling, and we also learn how Remix handles routing and reading/writing data, all while sticking to the fundamentals of the web platform!

## [01. Styling](./01.styling/)

1. [Links to Public Files](./01.styling/01.public-links/)
2. [Asset Imports](./01.styling/02.asset-imports/)
3. [Global Styles](./01.styling/03.global-styles/)
4. [Compiling CSS](./01.styling/04.compiling-css/)
5. [Bundling CSS](./01.styling/05.bundling-css/)

In a typical web application, we use the `<link />` tag to reference public files as resources that the app will be using. You've probably used these tags to load a `styles.css` and/or a `favicon.ico` file, and Remix offers a similar implementation to load external resources in our application.

In Remix, we use a `links()` function that returns an array of objects describing each `<link />` element we want to render in our page. By adding Remix's `<Links />` component in the `app/root.tsx` file, it will then add these `<link />`s to the `<head />` of the output HTML.

This exercise walks us through the process of importing an app favicon and a custom stylesheet for a Remix application. We start by importing a `favicon.svg` file, then we import a `font.css` file (similar to how we'd usually import custom fonts from [Google Fonts](https://fonts.google.com/), but doing it this way gives us more control over the font files in our application, allowing us to do things like reduce the total size of the fonts by only sending the glyphs that your app actually uses!). We also set up [Tailwind CSS](https://tailwindcss.com/), which will be our main method of styling our application throughout the upcoming workshops (🧝‍♂️ Kellie will also setup some additional Tailwind configs that we'll be using in the later exercises)!

We also see how Remix makes some things easier in regards to (...). By importing from our `app/assets` folder, Remix ["fingerptintins"](https://remix.run/docs/en/main/file-conventions/asset-imports) the favicon so that we can easily cache it without worrying about fetching the updated versions of the file when we decide to change it later. Remix also has built-in support for [PostCSS](https://remix.run/docs/en/main/styling/postcss) and [Tailwind](https://remix.run/docs/en/main/styling/tailwind), which makes out Tailwind setup a lot faster. Remix also suports [CSS bundles](https://remix.run/docs/en/main/styling/bundling), which can help us later should we need to import multiple external CSS files (such as when using component libraries that need to add their own CSS into our application).

## [02. Routing](./02.routing/)

1. [Routes](./02.routing/01.routes/)
2. [Links](./02.routing/02.links/)
3. [Route Params](./02.routing/03.params/)
4. [Resource Routes](./02.routing/04.resources/)

One of the most important features of a web application is the ability to navigate from one page to another. We use something called the [Uniform Resource Locator (URL)](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL) which points to the current page the user is on.

![MDN: Anatomy of a URL](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL/mdn-url-all.png)

In a typical web application, we navigate between pages by clicking on `<a />` tags (also called "links") or submitting `<form>`s, each redirecting you into another page by changing segments of the URL. The URL has many different parts, but for this section about Routing we direct most of our focus towards the _pathname_ and the _parameters_.

> **Note**
>
> As addressed in the workshop lectures, there might be some confusion regarding the term _"parameters"_. The above diagram from MDN calls the bit after the `?` as "Parameters", but later on we'll also be discussing about "route parameters". To avoid confusion, we'll refer to the "route parameters" as _"params"_ and the bit after `?` as _"query params"_ or _"search params"_.

A lot of frameworks also use what is called a _"router"_ to help organize code associated with specific URL segments. This also allows us to specify routes dynamically by defining variable parts of the segment which the router can parse as route parameters. Remix is built on top of [React Router](https://reactrouter.com/en/main), which means it shares its conventions regarding routing. Remix also offers a file system convention for routing, which lets us add routes as easily as adding new folders/files in the `app/routes` directory. Throughout these workshops however, we'll be using a slightly different route convention via [`remix-flat-routes`](https://github.com/kiliman/remix-flat-routes), which allows for a better colocation for related files.

Remix also has special routes called _resource routes_, which are routes that only return data without any UI. For now we only implemented a simple resource route in this section, but later on we'll also be working on more complex resource routes to help us in later exercises!

## [03. Data Loading](./03.loading/)

1. [Loaders](./03.loading/01.loader/)
2. [Handle Missing Data](./03.loading/02.missing-data/)

One of the main features of Remix is the ability to load data in a particular route using a server-side function called `loader()`. Being based around the web's [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), the `loader()` function accepts a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object along with the route params and returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object. Remix also provides a utility function called `json()` to help us return a JSON object in our `Response`.

We then get the data returned by the `loader()` function into our UI by using Remix's [`useLoaderData()` hook](https://remix.run/docs/en/main/hooks/use-loader-data). Once we have the data from `useLoaderData()` we can display it in our UI as we typically would in a React application.

Not all `loader()`s successfully return data though. For example, viewing the profile of a user that does not exist should throw some error instead. We can gracefully handle such cases in our `loader()` by simply `throw`ing a `Response` with an error [`status` code](https://developer.mozilla.org/en-US/docs/Web/API/Response/status) (such as 404). Since this is something that we might be dealing with quite often, we can extract this assertion logic into a separate utility function to make our `loader()` code much less cluttered.

## [04. Data Mutations](./04.mutations/)

1. [Forms](./04.mutations/01.forms/)
2. [Actions](./04.mutations/02.actions/)
3. [FormData Types](./04.mutations/03.formdata-types/)
4. [Button Forms](./04.mutations/04.button-forms/)
5. [Intent](./04.mutations/05.intent/)

Another main feature of Remix is handling data mutations via a server-side function called `action()`. Staying close to the web platform, the `action()` function still accepts a `request` and a `params`, but it also receives a `<form />` submission which we can get via `request.formData()`.

This also means that we'll mainly be using `<form />`s when we need to trigger data mutations on the server. This leads to some weird-looking (at least at first) syntax like wrapping a single `<button />` element inside a `<form />`, but as we get into more complex data mutations, handling them via `<form />`s will lead into a nice declarative API that performs well even against some edge cases because the default `<form />` behavior in the browser handles most of these edge cases for you!

We also get type safety in our `action()` by using the utility function we created earlier to check if the inputs we received are of the correct type. Not only do we quickly get the error handling via our utility function, it also allows TypeScript to infer the correct type for our inputs making them easier to work with afterwards!

Using `<form />`s for data mutations also lets us discover a clever trick when we need to handle different cases in our form submissions: the `<button type="submit" />` can actually pass its own value in the form submission! This lets us put something like an `intent` field via the `<button />` and we can then use that field in our `action()` to handle different mutations based on what kind of `intent` was submitted (e.g. updating or deleting a note).

## [05. Scripting](./05.scripting/)

1. [Scripts](./05.scripting/01.scripts/)
2. [Scroll Restoration](./05.scripting/02.scroll-restoration/)
3. [Custom Scripts](./05.scripting/03.custom-scripts/)
4. [Prefetching](./05.scripting/04.prefetching/)
5. [Pending UI](./05.scripting/05.pending/)

You might be curious about some of the components included in the `app/root.tsx` in a default Remix setup. In this exercise we take a closer look about the `<Scripts />`, `<ScrollRestoration />`, and `<LiveReload />` components and what they do for us out-of-the-box!

The `<Scripts />` component is pretty straightforward: It simply enables the client-side JavaScript in the rendered page (Since we're mainly using links and forms, most of what we've built so far works even when JavaScript is disabled!). The `<LiveReload />` component is also straightforward - it simply lets us see the changes we make during development without needing to do a full page reload.

The `<ScrollRestoration />` component allows Remix to restore the scroll position as the user navigates back-and-forth between different pages, emulating the browser's default behaviour for navigations. We can also disable this behaviour on a per-link basis by simply adding a `preventScrollReset` prop to the relevant `<Link />` component.

We also learn about a few more quality-of-life features we can add to our application. 🧝‍♂️ Kellie has made a custom `entry.server.tsx` and `entry.client.tsx` as well as some utility functions that let us expose some environment variables to share between the server and the client. We then use these to add a custom "devtools" script that only gets loaded in development mode. We also learn how to prefetch pages when the user hovers over a link by passing a `prefetch` prop into a `<Link />` component. Finally, we also use Remix's `useNavigation()` and `useFormAction()` hooks to implement some pending states in our UI when the user submits a `<form />`.

## [06. Search Engine Optimization](./06.seo/)

1. [Static meta export](./06.seo/01.static/)
2. [Meta Overrides](./06.seo/02.nested/)
3. [Dynamic meta export](./06.seo/03.dynamic/)
4. [Parent Data](./06.seo/04.matches/)

In a typical web application, we use `<title />` and `<meta />` tags to provide useful information for Search Engine Optimization (SEO). In Remix, we can still use these `<title />` and `<meta />` tags, but we can also use a `meta()` function that returns an array of objects describing the `<title />` and `<meta />` tags we want to render in each route. By adding Remix's `<Meta />` component in the `app/root.tsx` file, it will then add these `<title />` and `<meta />` tags to the `<head />` of the output HTML.

Each route in a Remix application can export its own `meta()` function which describes its own `<title />` and `<meta />` tags. because multiple routes may be rendered at the same time thanks to the React Router's Nested Routes feature, Remix resolves conflicts by letting the more specific route's `meta()` function override the parent routes' `meta()` functions.

> **Note**
>
> Overriding `meta()` functions does NOT merge the descriptors from the parent routes' `meta()` functions. If you want to have `<meta />` tags that are present across every route (such as when specifying a `viewport` or `charSet`), simply use a regular `<meta />` tag in the `<head />` of the `app/root.tsx` file.

The `meta()` function also lets us provide dynamic data to the rendered `<title />` and `<meta />` tags by accepting a `data` object containing the output of the current route's `loader()` function. We can also access the output of the parent routes' `loader()`s using the `matches` object that's also passed into the `meta()` function, from which we can then access the loader data by `matches.find()`-ing the route where the `match.id` is the same as the pathname of the parent route you want to access.

## [07. Error Handling](./07.error-handling/)

1. [Handle Route Errors](./07.error-handling/01.route-errors/)
2. [Handle Thrown Responses](./07.error-handling/02.thrown-response/)
3. [Error Bubbling](./07.error-handling/03.error-bubbling/)
4. [Root ErrorBoundary](./07.error-handling/04.root-boundary/)
5. [Not Found](./07.error-handling/05.not-found/)

Error handling is another very important part of building web applications. Remix makes it much easier for us to implement error handling by letting us export an `ErrorBoundary` component for each route along with the `useRouteError()` hook to let us access the error to display.

Since we're `throw`ing a `Response` in our route `loader()`s in previous error handling exercises, we can use these thrown `Response`s to provide a more specific error message when an error does occur. `throw`ing `Response`s this way also lets us abstract a good chunk of our error handling code into utility functions, and we can even create a reusable `<GeneralErrorBoundary />` to provide a nice-looking and consistent error display with most of the common error handling logic nicely abstracted in a single component!

The Route Nesting feature also lets errors from child routes "bubble up" until they reach a route that implements an `ErrorBoundary`. We also implemented an `ErrorBoundary` in thr root route to ensure all route errors have somewhere to bubble up into and get the same consistent error display. This also means that if an error occurs in one of the child routes, the parent routes that did not error out will be unaffected and stay functional!

Using the concepts we learned from this section, we finally implement a "Not Found" route that gracefully handles errors that occur then the user tries to go to a route that does not exist.
