# 📝 Professional Web Forms

This workshop picks up pretty much where the Full Stack Foundations workshop left off, but 🧝‍♂️ Kellie did set up some things to help make things smoother for the upcoming exercises. In addition to installing the packages we'll be using later, she also wrote up some useful utility functions in `db.server.ts` which we'll use as we improve the note editing feature in the upcoming exercises. Since we'll be working with images later in this workshop, she added an `image` object in our fake database, and added an `images` field to the `notes` object to accomodate the images we'll be including later. She also wrote an `updateNote()` utility function which replaces the `db.note.update()` method in the `/users/$username/notes/$noteId/edit` route's `action`, again to help with including the images later.

## [01. Form Validation](./01.form-validation/)

1. [Form Validation](./01.form-validation/01.form-validation/)
2. [Server Validation](./01.form-validation/02.server-validation/)
3. [Disable Default Validation](./01.form-validation/03.no-validate/)

If you've worked with HTML forms before, chances are you've written up a `required` input:

```html
<input type="text" id="name" required />
```

This uses the browser's native input validation features to prevent the user from submitting a form if any `required` inputs aren't filled in. Here's some other input attributes that help with input validation:

- `minlength` - the element must be at least this many characters
- `maxlength` - the element must be at most this many characters
- `min` - the element must be at least this value
- `max` - the element must be at most this value
- `pattern` - the element must match this regular expression

While these attributes let us add some basic input validation on the client side, there are more than a couple ways for a user to potentially submit invalid data to our server, so ideally we'll have to validate our form inputs on the server no matter what. In Remix, we can add some validation logic on the server side within the `action()`, and return errors as necessary when some inputs turn out to be invalid. We'll structure these errors so that each input can have its own array of errors, as well as another array for form-level errors. This structure of errors makes it easy for us to render a custom `<ErrorList />` component to show the various errors our form and/or its inputs may potentially have. Once that's done, we can also add a bit of progressive enhancement by checking if JavaScript is loaded on the user's browser and using the `novalidate` attribute to disable the browser's native input validation once JavaScript has loaded so we can `useActionData()` to display the errors after validating the form inputs via the `action()`.

## [02. Accessibility](./02.accessibility/)

1. [Field Labels](./02.accessibility/01.labels/)
2. [Validation aria attributes](./02.accessibility/02.aria/)
3. [Focus Management](./02.accessibility/03.focus/)

Up until now, 🦉 has been warning us in the comments that some of our form elements are not accessible. Let's fix that in this exercise!

While we wouldn't be going too deep dealing with the topic of accessibility in this workshop, it's still a massively valuable topic to learn and do well when it comes to crafting forms on the web. At the very least, we need to make sure that our form elements and error messages are both properly labeled and easily identifiable using accessibility tools such as screen readers. We can also enhance the association between inputs and error messages using ARIA attributes.

First, we fix the association between our labels and inputs by making sure that the label's `for` (or `htmlFor` in React) attribute matches the `id` of its associated input. Next, we properly associate the error messages by using `aria-invalid` and `aria-describedby` attributes, and making sure that those attributes only get applied to whatever inputs (or the form itself) actually had errors. Finally, we also improve the usability of our form by directing the focus - first by immediately focusing on the Title input on page load, and then focusing into the first invalid element after the user submits an invalid form.

## [03. Schema Validation](./03.schema-validation/)

1. [Zod schema validation](./03.schema-validation/01.zod/)
2. [Conform action utils](./03.schema-validation/02.conform-action/)
3. [Conform form utils](./03.schema-validation/03.conform-form/)

You might notice that we have been writing repetitive logic when we validate our inputs:

```ts
invariantResponse(typeof title === "string", "title must be a string");
invariantResponse(typeof content === "string", "content must be a string");

// ...

if (title === "") {
  errors.fieldErrors.title.push("Title is required");
}
if (title.length > titleMaxLength) {
  errors.fieldErrors.title.push("Title must be at most 100 characters");
}
if (content === "") {
  errors.fieldErrors.content.push("Content is required");
}
if (content.length > contentMaxLength) {
  errors.fieldErrors.content.push("Content must be at most 10000 characters");
}
```

You can imagine it being even more painfully repetitive especially as our forms get more complex inputs. Fortunately, there are various libraries that provide helpful utilities that help with validating specific structures of data, allowing us to write our validation logic in a more declarative way. We'll be using [Zod](https://zod.dev/) to turn our validation logic into something that looks like this:

```ts
const schema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
});

const result = schema.safeParse({
  title: formData.get("title"),
  content: formData.get("content"),
});

if (result.success) {
  // we're good, check result.data
} else {
  // we're not good, check result.error
}
```

What's neat about using `schema.safeParse()` this way is that we get a familiar-looking structure of errors when we use `result.error.flatten()`:

```ts
{
	formErrors: [],
	fieldErrors: {
		title: ['title must be a string'],
		content: ['Content must be at most 10000 characters']
	},
}
```

We can also improve our project's user experience by performing client-side validation once JavaScript has loaded. Essentially, we have a baseline functionality where we use the native Form APIs if the user submits the form before JavaScript loads (e.g. on a slow network speed) and our `action()` will handle the validation as we've done before, but once JavaScript fully loads we can skip making those fetch requests by validating the inputs on the client side. One main advantage of using a full-stack framework like Remix is that we can reuse the same validation logic and share it between the server and the client. To facilitate this, we'll use [Conform](https://conform.guide/) along with its Zod adapter and use the schema we created to perform validation on both client and server, and autonatically provide the necessary attributes on the inputs, labels, and errors similar to what we did in the previous exercise. With this, not only we can easily implement Progressive Enhancement for our form validation in both client and server, by using the same Zod schema we can also ensure that our UI and server are consistent with each other!

## [04. File Upload](./04.file-upload/)

1. [Multi-part form data](./04.file-upload/01.multi-part/)
2. [File Validation](./04.file-upload/02.file-validation/)

We can also use forms to upload files to your server. Here's a quick example:

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <label for="file-upload-input">Upload File</label>
  <input type="file" id="file-upload-input" name="file-upload" />
  <button type="submit">Upload File</button>
</form>
```

Here, we're using `<input type="file" />` to let the user select which file they want to upload, and we also set `enctype="multipart/form-data"` on the form so that the file data is properly encoded on the way to the server.

With file inputs, we can use the [`File` API](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications) to get some information about the selected files, such as their `name`, `size`, `type`, and so on, which we can use for validation later.

In Remix, we'll still use the `FormData` API we've been using before, but we'll use a different parser to account for the `enctype="multipart/form-data"` we're using now:

```ts
import {
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
export const action = async ({ request }: ActionArgs) => {
  const uploadHandler = createMemoryUploadHandler({
    maxPartSize: 1024 * 1024 * 5, // 5 MB
  });
  const formData = await parseMultipartFormData(request, uploadHandler);

  const file = formData.get("avatar");

  // file is a "File" (https://mdn.io/File) polyfilled for node
  // ... etc
};
```

> [!IMPORTANT]
>
> The `parseMultipartFormData` API is still in active development in Remix, hence why it has the `unstable_` prefix. This means the specifics of the API could undergo some changes in the future, but it should still closely follow the browser's `File` API spec.

In this exercise, 🧝‍♂️ Kellie has provided some helpful initial setup to let us handle file uploads. She has set up a new `/resources/images/$imageId` resource route for serving the uploaded images, and added an `<ImageChooser />` component for us to use in our form, so we can focus more on setting up the `parseMultipartFormData()` for our `action()` and easily add an image input with a nice UX within our form.

After setting up the form to be able to handle file uploads, we can now use Zod to provide better type safety and add validation to our file submissions. The `<ImageChooser />` component already adds `file`, `imageId`, and `altText` to our form submissions, so all we need to do is to make some adjustments to our `NoteEditorSchema` to reflect these new fields, and then we can get typesafe values back from Conform's `submission.value`!

## [05. Complex Structures](./05.complex-structures/)

1. [Nested Object](./05.complex-structures/01.nested/)
2. [Field Lists](./05.complex-structures/02.lists/)
3. [Add / Remove Items](./05.complex-structures/03.add-remove/)

As it turns out, we _can_ represent an array in a `FormData` object! This is because the `FormData` API works similar to the `Headers` or `URLSearchParam` API in that their entries can have multiple values using the same name. So for instance you can represent an array of todo inputs like:

```html
<form>
  <input type="text" name="todo" value="Buy milk" />
  <input type="text" name="todo" value="Buy eggs" />
  <input type="text" name="todo" value="Wash dishes" />
</form>
```

```ts
const formData = new FormData(form);
formData.getAll("todo"); // ["Buy milk", "Buy eggs", "Wash dishes"]
```

But that's usually not enough. Some complex forms may have nested data structures, like an array of objects:

```html
<form>
  <input type="text" name="todo" value="Buy milk" />
  <input type="checkbox" name="completed" checked />
  <input type="text" name="todo" value="Buy eggs" />
  <input type="checkbox" name="completed" />
  <input type="text" name="todo" value="Wash dishes" />
  <input type="checkbox" name="completed" checked />
</form>
```

```ts
const formData = new FormData(form);
formData.getAll("todo"); // ["Buy milk", "Buy eggs", "Wash dishes"]
formData.getAll("completed"); // ["on", "on"]
```

And here's where we see our first problem. Some values in the FormData API, such as checkboxes, have visible values if they're filled in, but get skipped altogether if they're not filled in. This means we can't simply rely on the order of values to see chich of the nested fields have values or not. We'll have to do some extra work to provide more specific names for these nested fields so that we can track them more accurately:

```html
<form>
  <input type="text" name="todo[0].content" value="Buy milk" />
  <input type="checkbox" name="todo[0].complete" checked />
  <input type="text" name="todo[1].content" value="Buy eggs" />
  <input type="checkbox" name="todo[1].complete" />
  <input type="text" name="todo[2].content" value="Wash dishes" />
  <input type="checkbox" name="todo[2].complete" checked />
</form>
```

```ts
const formData = new FormData(form);
formData.get("todo[0].content"); // "Buy milk"
formData.get("todo[0].complete"); // "on"
formData.get("todo[1].content"); // "Buy eggs"
formData.get("todo[1].complete"); // null
formData.get("todo[2].content"); // "Wash dishes"
formData.get("todo[2].complete"); // "on"
```

With some JS magic, we can transform this into an actual array of objects that looks similar to this:

```ts
const data = {
  todos: [
    { content: "Buy milk", complete: true },
    { content: "Buy eggs", complete: false },
    { content: "Wash dishes", complete: true },
  ],
};
```

Luckily, Conform has great support for [nested objects and arrays](https://conform.guide/complex-structures), so that's what we'll be using in this exercise to let the user provide _multiple_ images in their notes.

First, we can extract the `imageId`, `file`, and `altText` fields into a separate `ImageFieldsetSchema`. We also have to update some of the code in the `<ImageChooser />` component to start using Conform's `useFieldset()` hook to represent each image file. Once that's done, we can support adding multiple images by turning `NoteEditorSchema`'s `image` field into an `images` field representing `z.array(ImageFieldsetSchema)`. This means we can now use pass an entire `images` field from our `submission.value` into `updateNote()`. Finally, we can use Conform's `useFieldList()` hook to properly wire up our `images` field array with multiple `<ImageChooser />` input fields.

We'll also want the ability to add or remove images into the list, so we'll use Conform's [`list()`](https://conform.guide/intent-button#list-intent) utility to do just that. We also want this feature to have Progressive Enhancement, so we'll use the same trick from the previous exercises by making use of `name="intent"` attributes in submit buttons. Conform's `list()` utility already does this for us though, so all we need to do is handle the new `intent` value by simply returning the `submission` object in our `action`!

> [!TIP]
>
> For accessibility purposes, we can add a hidden `<button type="submit" />` at the top of our form so that the user can still submit the form by pressing `Enter` on an input field. This is because the default behaviour in that case is the form uses the first `<button type="submit" />` it sees as its [`submitter`](https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter), but since we're also using other `<button type="submit" />`s to add/remove images we have to make sure that the first `<button type="submit" />` element has the correct `intent` value when the user submits the form by pressing `Enter`!

## [06. Honeypot](./06.honeypot/)

1. [Basic Honeypot](./06.honeypot/01.basic/)
2. [Remix Utils](./06.honeypot/02.util/)
3. [Honeypot Provider](./06.honeypot/03.provider/)
4. [Encryption Seed](./06.honeypot/04.seed/)

Security is a very important topic that gets more essential as your app scales to a larger userbase. These next few exercises deal with simple yet practical ways to start securing your app's web forms starting today!

First, we will be dealing with spam prevention using honeypot input fields. A honeypot field is an input field that is designed to be invisible to most users but will get filled out by spam bots that simply scan every available form field and fill everything out. This way, we can easily filter out most malicious form submissions by checking whether the honeypot fields are filled in. Once we can identify potential spam submissions, we can safely ignore or flag these submissions and avoid needlessly spending server resources or contaminate our databases with unwanted data.

For our project, we'll be using the [`remix-utils`](https://github.com/sergiodxa/remix-utils#form-honeypot) package which provides various utilities to help us set up honeypot fields for our forms. Here's an example usage:

```ts
// app/utils/honeypot.server.ts
import { Honeypot } from "remix-utils/honeypot/server";

export const honeypot = new Honeypot({
  validFromFieldName: process.env.TESTING ? null : undefined,
  encryptionSeed: process.env.HONEYPOT_SECRET,
});
```

```tsx
// in your routes:
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { SpamError } from "remix-utils/honeypot/server";
import { honeypot } from "#app/utils/honeypot.server.ts";
// ... other imports

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response("Form not submitted properly", { status: 400 });
    }
    throw error;
  }

  // ... the rest of the action function logic
}

export default function Route() {
  return (
    <Form>
      <HoneypotInputs />
      {/* ... other input fields */}
    </Form>
  );
}
```

We'll also want to setup the `<HoneypotProvider />` in our root route:

```tsx
// app/root.tsx
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { honeypot } from "./utils/honeypot.server.ts";
// ...other imports

export async function loader() {
  const honeyProps = honeypot.getInputProps();
  return json({
    honeyProps,
    // ... other loader data
  });
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <HoneypotProvider {...data.honeyProps}>
      <App />
    </HoneypotProvider>
  );
}

function App() {
  // ... your usual <App /> component code
}
```

After setting up honeypot fields in this exercise, 🧝‍♂️ Kellie extracts the `try`/`catch` logic into a separate utility function so we can quickly check our honeypot fields in other public forms by simply calling `checkHoneypot(formData)` in their `action()`s.

## [07. Cross-Site Request Forgery](./07.csrf/)

1. [CSRF Setup](./07.csrf/01.setup/)
2. [CSRF Verification](./07.csrf/02.verification/)

Cross-Site Request Forgery (CSRF) is a type of cyber attack that tricks a user into accidentally using their authenticated credentials to perform actions they did not intend to do. For example, a user might get tricked into transferring their funds into another account by a simple form that isn't protected against CSRF:

```html
<form method="POST" action="https://example.com/my-great-bank/transfer-funds">
  <input type="hidden" name="amount" value="1000000" />
  <input type="hidden" name="to" value="123456789" />
  <button>Click here to win a free iPad!</button>
</form>
```

The workshop instructions discuss a few foundational principles to protect against CSRF:

> 1. **Use Anti-CSRF Tokens**: These are unique tokens generated by the server and sent to the client during session establishment. Every subsequent request that modifies any data should carry this token. If a request doesn't have the token, it will be denied. Since the attacker's site won't know this unique and randomly generated token, they won't be able to make it through.
> 2. **SameSite Cookies**: Modern browsers support the SameSite attribute for cookies. Setting it to Strict or Lax will ensure that the cookie isn't sent with cross-site requests, offering protection against CSRF.
> 3. **Check the Origin Header**: Servers can check the Origin and Referer headers of incoming requests. If the request's origin isn't what the server expects, it can reject the request.
> 4. **Always Logout**: Encourage users to log out of sessions when they're done, especially on public or shared computers. This reduces the window of opportunity for an attacker.

Again, we'll be using [`remix-utils`](https://github.com/sergiodxa/remix-utils#csrf) to set up the Anti-CSRF tokens in our project:

```ts
// app/utils/csrf.server.ts
import { createCookie } from "@remix-run/node";
import { CSRF } from "remix-utils/csrf/server";

const cookie = createCookie("csrf", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: process.env.SESSION_SECRET.split(","),
});

export const csrf = new CSRF({ cookie });
```

Once that's set up, we can use this CSRF cookie in our root loader:

```ts
// app/root.tsx
import { csrf } from "./utils/csrf.server.ts";
//... other imports

export async function loader({ request }: LoaderFunctionArgs) {
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request);
  // ...
  return json(
    {
      csrfToken,
      //... other loader data
    },
    {
      headers: csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : {},
    }
  );
}
```

We'll also need to add `remix-utils`' `<AuthenticityTokenProvider />` in our `<AppWithProviders />` component:

```tsx
// app/root.tsx
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
//... other imports

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <HoneypotProvider {...data.honeyProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  );
}
```

Once that's set up, we can add an `<AuthenticityTokenInput />` to our forms:

```tsx
// in your routes:
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { CSRFError } from "remix-utils/csrf/server";
import { csrf } from "#app/utils/csrf.server.ts";
// ... other imports

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    await csrf.validate(formData, request.headers);
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }
    throw error;
  }

  // ... the rest of the action function logic
}

export default function Route() {
  return (
    <Form>
      <AuthenticityTokenInput />
      {/* ... other input fields */}
    </Form>
  );
}
```

Again, after this exercise 🧝‍♂️ Kellie will extract out the `try`/`catch` logic into a separate utility function so we can simply `await validateCSRF(formData, request.headers)` in all of our form `action()`s later!

## [08. Rate Limiting](./08.rate-limiting/)

1. [Basic Rate Limiting](./08.rate-limiting/01.basic/)
2. [Tuned Rate Limiting](./08.rate-limiting/02.tuned/)

The last security tip we'll tackle in this workshop is **Rate Limiting**. Rate Limiting helps us make sure that our server isn't overwhelmed by too many incoming requests (either from too many users using our app at once, or from malicious attackers that intentionally make too many requests than a server can handle) by limiting how many requests a user can make in a certain period of time.

In our project, we'll use the [`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit) package to let us easily configure rate limiting according to our app's needs. Here's an example usage for fine-tuned rate limiting:

```ts
import rateLimit from "express-rate-limit";

// When we're testing, we don't want rate limiting to get in our way. So, we'll
// increase our rate limit thresholds.
const limitMultiple = process.env.TESTING ? 10_000 : 1;

const rateLimitDefault = {
  windowMs: 60 * 1000, // 1 minute
  limit: 1000 * limitMultiple, // Adjust the limit based on our environment
  standardHeaders: true, // Send standard headers with limit information
  legacyHeaders: false, // Don't bother sending legacy headers
};

// The most strict rate limit, great for routes like /signup
const strongestRateLimit = rateLimit({
  ...rateLimitDefault,
  limit: 10 * limitMultiple,
});

// A stricter rate limit for general POST requests
const strongRateLimit = rateLimit({
  ...rateLimitDefault,
  limit: 100 * limitMultiple,
});

// A general rate limit for our application
const generalRateLimit = rateLimit(rateLimitDefault);

app.use((req, res, next) => {
  const strongPaths = ["/signup"];
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (strongPaths.some((p) => req.path.includes(p))) {
      return strongestRateLimit(req, res, next);
    }
    return strongRateLimit(req, res, next);
  }

  return generalRateLimit(req, res, next);
});
```

In this example, we configure different rate limits both for different types of requests and for different routes:

- For `GET` requests, we'll want to stick to our general late limit configuration since these are typically the type of requests that genuine users can make a lot of compared to other types of requests.
- Other types of requests, such as `POST`, require more work to be done on our server for things like data validation, database writes, sending emails, etc. This is why we set a stronger rate limit configuration for these requests.
- Lastly, there are certain routes where it doesn't make sense for a genuine user to make certain requests too many times in a row. For routes like `/signup`, it could be useful to set our strictest rate limit configuration since not only does it not make sense for a typical user to sign up multiple times a minute, this route also involves more resource-intensive operations like hashing passwords, database writes, and sending welcome emails.
