import type { Post, User } from "@my-app/database";
import { Link, useOutletContext } from "@remix-run/react";

type PostWithAuthor = Post & { author: User | null };

export default function PostDetails() {
	// 親ルートから`context`経由でデータを受け取る
	const post = useOutletContext<PostWithAuthor>();

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
				<Link
					to="edit"
					className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					Edit Post
				</Link>
			</footer>
		</>
	);
}