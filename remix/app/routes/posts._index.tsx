import type { Post, User } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useRouteError } from "@remix-run/react"; // 👈 useRouteError をインポート

type PostWithAuthor = Post & { author: User | null };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const apiUrl = process.env.API_BASE_URL;
  if (!apiUrl) {
    throw new Error("API_BASE_URL is not defined");
  }
  const res = await fetch(`${apiUrl}/posts`);
  if (!res.ok) {
    throw new Response("Failed to fetch posts", { status: res.status });
  }
  const posts = (await res.json()) as PostWithAuthor[];
  return json({ posts });
};

export default function PostsIndex() {
  const { posts } = useLoaderData<typeof loader>();
  // (コンポーネントの中身は変更なし)
  return (
    <div className="mx-auto max-w-4xl p-8 font-sans text-gray-800 dark:text-gray-100">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link
          to="/posts/new"
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          New Post
        </Link>
      </header>
      <main>
        {posts.length === 0 ? (
          <p>No posts found. Create one!</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md dark:border-gray-700"
              >
                <Link to={`/posts/${post.id}`} className="hover:underline">
                  <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-500">
                    {post.title}
                  </h2>
                </Link>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {post.content
                    ? post.content.substring(0, 150) + "..."
                    : "No content"}
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  By {post.author?.email || "Unknown author"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

// --- 👇 ここから追加 ---
export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error); // エラーをコンソールに出力してデバッグしやすくする

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-red-50 text-center dark:bg-red-950/20">
      <h1 className="text-4xl font-bold text-red-600 dark:text-red-400">
        Oops! Something went wrong.
      </h1>
      <p className="mt-4 text-lg text-red-800 dark:text-red-200">
        We couldn't load the blog posts. Please try again later.
      </p>
      <Link to="/" className="mt-8 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
        Go back to Home
      </Link>
    </div>
  );
}
// --- 👆 ここまで ---