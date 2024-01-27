# 💾 Data Modeling Deep Dive

This workshop picks up where the Professional Web Forms workshop left off. In the meantime, 🧝‍♂️ Kellie did some initial setup for the project for a smoother experience in the upcoming exercises:

- Added new packages to be used in later exercises
- Set up new utilities and UI components to be used as we add more features to our project
- Added an `image` field to the `user` object, which represents the user's profile image to be displayed in the `/users/$username` routes (and other routes which reference the user)

## [01. Database Schema](./01.schema/)

1. [prisma init](./01.schema/01.init/)

For our project, we're going to use [SQLite](https://sqlite.org/index.html) as our database. Kent lists some good reasons to use SQLite as your database [in this article](https://www.epicweb.dev/why-you-should-probably-be-using-sqlite), but most of the work we'll be doing to interact with our database will be done via the [Prisma](https://www.prisma.io/) ORM.

First, we'll generate our SQLite database using the following command:

```sh
npx prisma init --url file:./data.db
```

This creates a `data.db` file in our project's `prisma` directory, as well as a `schema.prisma` fill where we'll define our database schema.

With Prisma, we can define what we want our database to look like by using a schema to define different models representing the different database tables as well as the relationships between their data:

```prisma
// This is an example Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id       String  @id @default(cuid())
  email    String  @unique
  username String  @unique
  name     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

	image UserImage?
  notes Note[]
}

model UserImage {
  id          String  @id @default(cuid())
  altText     String?
  contentType String
  blob        Bytes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  userId String @unique
}

model Note {
  id      String @id @default(cuid())
  title   String
  content String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner   User   @relation(fields: [ownerId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  ownerId String

  images NoteImage[]
}

model NoteImage {
  id          String  @id @default(cuid())
  altText     String?
  contentType String
  blob        Bytes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  note   Note   @relation(fields: [noteId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  noteId String
}
```

To start things off in this exercise, we only made a basic schema that only contains the `User` model. Once our schema is set up, we can push it to our database using the following command:

```sh
npx prisma db push
```

At any time after setting up our schema, we'll be able to view the data in our database by using Prisma Studio:

```sh
npx prisma studio
```

## [02. Data Relationships](./02.relationships/`)

1. [One-to-Many Relationships](./02.relationships/01.one-to-many/)
2. [One-to-One Relationships](./02.relationships/02.one-to-one/)

Notice the other models in the example Prisma schema above? Some of them use the `@relation` attribute to define their relationships with other models in the schema. In this exercise, we'll take a look at different types of data relationships:

- **One-to-Many**: A `User` can have multiple `Note`s, but each note can only have one `User` as their `owner`. Here's how it looks like in the schema:

  ```prisma
  model User {
  	id       String  @id @default(cuid())
  	email    String  @unique
  	username String  @unique
  	name     String?

  	createdAt DateTime @default(now())
  	updatedAt DateTime @updatedAt

  	// A User can have many Notes...
  	notes Note[]
  }

  model Note {
  	id          String  @id @default(cuid())
  	altText     String?
  	contentType String
  	blob        Bytes

  	createdAt DateTime @default(now())
  	updatedAt DateTime @updatedAt

  	// ...but each Note can only have one User as its owner.
  	owner   User   @relation(fields: [ownerId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  	ownerId String
  }
  ```

- **One-to-One**: A `User` can have only one `UserImage` as their profile image, and each individual `UserImage` can only belong to one `User`. Here's what it looks like in the schema:

  ```prisma
  model User {
  	id       String  @id @default(cuid())
  	email    String  @unique
  	username String  @unique
  	name     String?

  	createdAt DateTime @default(now())
  	updatedAt DateTime @updatedAt

  	notes Note[]
  	// A User can have only one UserImage...
  	image UserImage?
  }

  model UserImage {
  	id          String  @id @default(cuid())
  	altText     String?
  	contentType String
  	blob        Bytes

  	createdAt DateTime @default(now())
  	updatedAt DateTime @updatedAt

  	// ...and each uploaded UserImage is associated with only one User.
  	user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  	userId String @unique
  }
  ```

  > [!TIP]
  >
  > While you can use some file hosting services to serve uploaded files, In this workshop we explore how to store images directly into our SQLite database. As it turns out, [SQLite can serve small files up to 35% faster than the file system](https://www.sqlite.org/fasterthanfs.html), and right now our users are limited to uploading small (<3MB) image files anyway, which SQLite can certainly handle.

- **Many-to-Many**: Right now our project doesn't have a feature using this kind of relationship, but we'll revisit this in the Web Authentication workshop later! As a preview, here's a diagram of a Many-to-Many relationship between users, roles, and permissions:
  ![Diagram of a Many-to-Many Relationship of Users, Roles, and Permissions](../assets/images/rbac.png)

## [03. Data Migrations](./03.migrations/)

1. [Migrations](./03.migrations/01.migrations/)

This entire exercise consists of running one simple command:

```sh
npx prisma migrate dev
```

This command essentially commits the changes we've made in our schema so far. By running this command, we tell Prisma to generate the SQL needed to facilitate a data migration after making changes to the schema. We can then take this SQL file and commit it to our Git repository to easily share with other team members and deploy our app.

We'll keep using this command to make more migrations as we make more changes in our schema in later exercises!

## [04. Seeding Data](./04.seed/)

1. [Init Seed Script](./04.seed/01.init/)
2. [Nested Writes](./04.seed/02.nested/)

Seeding data fulfills two main purposes - In development, we use it to populate the database with some initial data that we can use to test our app, and in production we can use it to initialize our database with data we know we'll need.

We can configure our `package.json` to tell Prisma how to run our seed script:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Once that's configured, we can run the seed script by using the following command:

```sh
npx prisma db seed

# or:
npx prisma migrate reset
```

The seed script itself is fairly simple for now, we just use some of the methods the Prisma client provides for us to create a user and some notes. We also take advantage of Prisma's [Nested Writes](https://www.prisma.io/docs/orm/prisma-client/queries/transactions#nested-writes) to generate the user, the notes, and the images, all in a single query!

## [05. Generating Seed Data](./05.generated/)

1. [Generated Data](./05.generated/01.generated/)
2. [Dynamic Data](./05.generated/02.dynamic/)
3. [Unique Constraints](./05.generated/03.unique/)

Continuing from the previous exercise, we improve the seed script by adding more randomly generated users each with their own notes. We use the [Faker.js](https://fakerjs.dev/) to generate tandom data to populate the user and notes information, and we also enforce some constraints to the randomly generated data to ensure that certain fields (such as usernames and emails) are unique for each user.

## [06. Querying Data](./06.querying/)

1. [Setup App Client](./06.querying/01.client/)
2. [Select](./06.querying/02.select/)
3. [Nested Select](./06.querying/03.nested-select/)

Starting from this exercise, we're going to move away from the temporary fake database we've been using throughout the previous exercises and start using our actual SQLite database with Prisma.

First, we setup Prisma on our client, configure it to log queries, and use the `singleton` helper function to make sure we use only one instance while HMR is running:

```ts
// app/utils/db.server.ts
const prisma = singleton("prisma", () => {
  // NOTE: if you change anything in this function you'll need to restart
  // the dev server to see your changes.

  // we'll set the logThreshold to 0 so you see all the queries, but in a
  // production app you'd probably want to fine-tune this value to something
  // you're more comfortable with.
  const logThreshold = 0;

  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "info", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });
  client.$on("query", async (e) => {
    if (e.duration < logThreshold) return;
    const color =
      e.duration < logThreshold * 1.1
        ? "green"
        : e.duration < logThreshold * 1.2
        ? "blue"
        : e.duration < logThreshold * 1.3
        ? "yellow"
        : e.duration < logThreshold * 1.4
        ? "redBright"
        : "red";
    const dur = chalk[color](`${e.duration}ms`);
    console.info(`prisma:query - ${dur} - ${e.query}`);
  });
  client.$connect();
  return client;
});
```

Now that prisma is set up, we can start replacing our old fake db queries with prisma queries that interface with our real SQLite database, starting with the `find` queries in this exercise. We can now also take advantage of the Prisma client to add a `select` option in our query to make sure we only get the data we need, and use nested `select` queries to get the data for both the user and their notes in a single query.

## [07. Updating Data](./07.updating/)

1. [Delete](./07.updating/01.delete/)
2. [Update](./07.updating/02.update/)
3. [Transactions](./07.updating/03.transactions/)
4. [Nested Update](./07.updating/04.nested/)

In this exercise, we continue replacing the rest of the old fake db queries and use Prisma queries instead.

The `delete` query is pretty much the same and is trivial to replace, but we're going to use more clever queries to properly handle updating note images in our real SQLite database. Now that we have a `NoteImage` model defined in our schema, we can keep track of the changes in the note: images this way:

1. Update the note
2. Delete the images that are no longer in the note
3. Update the images that are still in the note
4. Add the new images to the note

For step 3, we also want to update the `id` of the updated `NoteImage` if the user changes the image file associated with that `NoteImage`. This is because we are querying each `NoteImage` by their `id`, and all of our images are cached with `Cache-Control` headers, so if an image is updated while its `id` is unchanged, we could end up with a stale image in the browser cache.

Additionally, we want to make sure that all of the steps described above are successful before we actually update the note. If even one of the steps fails, we could end up with a halfway updated note that displays incorrect data. We can make sure all of the update processes happen in one go using [Prisma teansactions](https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#transaction-api), but we can also write a single nested query to handle those steps for us:

```ts
await prisma.note.update({
  select: { id: true },
  where: { id: params.noteId },
  data: {
    title,
    content,
    images: {
      deleteMany: { id: { notIn: imageUpdates.map((i) => i.id) } },
      updateMany: imageUpdates.map((updates) => ({
        where: { id: updates.id },
        data: { ...updates, id: updates.blob ? cuid() : updates.id },
      })),
      create: newImages,
    },
  },
});
```

## [08. SQL](./08.sql/)

1. [Raw SQL](./08.sql/01.sql/)
2. [Validation](./08.sql/02.validation/)
3. [Joins](./08.sql/03.join/)
4. [Order By](./08.sql/04.order/)

Sometimes we might have a query that cannot be represented well in an ORM like Prisma. In such cases, we can often use a method provided by our ORM of choice to directly execute raw SQL queries to our database. In this exercise, we use the `prisma.$queryRaw` method to query our database using raw SQL commands:

```ts
const like = `%${searchTerm ?? ""}%`;
const users = await prisma.$queryRaw`
	SELECT id, username, name
	FROM User
	WHERE username LIKE ${like}
	OR name LIKE ${like}
	LIMIT 50
`;
```

However, by using raw SQL commands like this we lose the type safetiness Prisma used to provide us. Fortunately, we can create our own Zod schema to model what shape of data we expect to be returned and use it to parse the result of our raw SQL query both to provide runtime validation and also to get the usual type-safe results we used to get. This way, we are able to catch mistakes from our raw SQL queries by simply checking if we are getting the correct results based on our schema.

> [!TIP]
>
> 🦉 Olivia gave us this tip from the workshop instructions:
>
> Parsing data at runtime can be a potential issue if there are many records to parse and validate. However that's unlikely to be an issue here with a limit of 50 records. That said, we could definitely strip this in production with something like this:
>
> ```ts
> const result =
>   ENV.MODE === "production"
>     ? ({
>         success: true,
>         data: rawUsers as z.infer<typeof UserSearchResultsSchema>,
>       } as const)
>     : UserSearchResultsSchema.safeParse(rawUsers);
> ```

We also add more improvements to our raw SQL query throughout the exercise, such as using SQL `JOIN`s to include the `UserImage` to the result, and using a nested `ORDER BY` query to sort the user search results based on their most recently updated note.

> [!IMPORTANT]
>
> 🦉 Olivia gives an additional note at the end of this exercise:
>
> _"I want to call out that until we added the order by we didn't need to use `prisma.$queryRaw`. Prisma is pretty powerful by itself and most of the time you don't need to reach for raw SQL statements. But when you do, you'll be glad that you could."_

## [09. Query Optimization](./09.optimize/)

1.  [Foreign Keys](./09.optimize/01.foreign-keys/)
2.  [Multi-Column Index](./09.optimize/02.multi-column-index/)

In this last exercise, we add some optimization to our database queries by using Database Indexes.

The solutions themselves were pretty short - we simply add some `@@index()` fields to the `Note` and `NoteImage` models to add the relevant database indexes. We do however spend a lot of time digging into _why_ we are adding these `@@index()` fields in the first place by walking through some example queries using the `EXPLAIN QUERY PLAN` command in `sqlite3`.

We use the `EXPLAIN QUERY PLAN` command to look at our `prisma.$queryRaw` query from before and look into how we can optimize this query using a multi-column index. We walk though each part of the query step-by-step to identify which part causes the full scan of the users and notes and see which columns we can use for an index so that the query won't have to spend as much time doing this full scan. We find out that not only does our query have to use a temporary data structure to store each note's `updatedAt` column, it does the whole process over and over for _every single user_ because we're finding each user's most recently updated note using a subquery. Now that we've identified what causes the slow query, we can add a multi-column `@@index([ownerId, updatedAt])` on the `Note` model so that the subquery of finding each user's most recently updated note can use that index to run faster, which should make the whole user search query run much faster as a result.
