// remix/app/routes/posts.$postId._index.tsx
import type { Post, User } from "@my-app/database"; // @my-app/database からの型をインポート
import type { LoaderFunctionArgs } from "@remix-run/node"; // LoaderFunctionArgs を追加
import { json } from "@remix-run/node"; // json を追加
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { getUserFromSession } from "~/utils/auth.server"; // 👈 getUserFromSession をインポート

type PostWithAuthor = Post & { author: User | null };

// loader関数を追加して、現在のユーザー情報を取得
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUserFromSession(request); // ユーザー情報を取得
	return json({ user });
};

export default function PostDetails() {
	const post = useOutletContext<PostWithAuthor>();
	const { user } = useLoaderData<typeof loader>(); // ユーザー情報を取得

	// ログイン中のユーザーが投稿の著者であるかチェック
	const isAuthor = user && post.authorId === user.id;

	return (
		<>
			<header className="mb-8 border-b pb-4 dark:border-gray-700">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
					{post.title}
				</h1>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					By {post.author?.email || "Unknown Author"} on{" "}
					{new Date(post.createdAt).toLocaleDateString()}
				</p>
			</header>

			<main className="prose prose-lg max-w-none dark:prose-invert">
				<p>{post.content || "No content for this post."}</p>
			</main>

			<footer className="mt-12 flex items-center justify-between border-t pt-6 dark:border-gray-700">
				<Link
					to="/posts"
					className="text-blue-600 hover:underline dark:text-blue-400"
				>
					&larr; Back to all posts
				</Link>
				{isAuthor && ( // 👈 投稿の所有者である場合のみ表示
					<Link
						to="edit"
						className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					>
						Edit Post
					</Link>
				)}
			</footer>
		</>
	);
}
