import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs } from "@remix-run/node"; // 👈 ActionFunctionArgs を追加
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { destroyUserSession, getUserFromSession } from "~/utils/auth.server";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// ルートのloader関数でユーザーセッション情報を取得
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromSession(request);
  return json({ user });
};

// ログアウトアクション
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await destroyUserSession(request);
  }
  return json({});
};


// 通常時のレイアウト
export default function App() {
  const { user } = useLoaderData<typeof loader>(); // ユーザー情報を取得

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
          <header className="bg-gray-800 p-4 text-white shadow-md dark:bg-gray-900">
            <nav className="container mx-auto flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-blue-300 hover:text-blue-200">
                Remix Blog
              </Link>
              <ul className="flex space-x-6">
                <li>
                  <Link to="/posts" className="text-gray-300 hover:text-white">
                    Posts
                  </Link>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link to="/profile" className="text-gray-300 hover:text-white">
                        Profile ({user.email})
                      </Link>
                    </li>
                    <li>
                      <Form action="/?index" method="post">
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Logout
                        </button>
                      </Form>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="text-gray-300 hover:text-white">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-gray-300 hover:text-white">
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </header>
          <main className="flex-grow">
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// エラー発生時にレンダリングされるコンポーネント
export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Error!";
  let message = "Something went wrong.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex h-screen flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-4">{message}</p>
          <Link to="/" className="mt-8 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            Go back to Home
          </Link>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
