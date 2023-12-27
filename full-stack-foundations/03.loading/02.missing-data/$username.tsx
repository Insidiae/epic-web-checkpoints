import { json, type DataFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";

export async function loader({ params }: DataFunctionArgs) {
  const user = db.user.findFirst({
    where: {
      username: {
        equals: params.username,
      },
    },
  });

  // 🐨 add an if statement here to check whether the user exists and throw an
  // appropriate 404 response if not.
  // 💯 as an extra credit, you can try using the invariantResponse utility from
  // "#app/utils/misc.ts" to do this in a single line of code (just make sure to
  // supply the proper status code)
  // 🦺 then you can remove the @ts-expect-error below 🎉
  invariantResponse(user, "User not found", { status: 404 });

  return json({
    user: { name: user.name, username: user.username },
  });
}

export default function ProfileRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="container mb-48 mt-36">
      <h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
      <Link to="notes" className="underline">
        Notes
      </Link>
    </div>
  );
}
