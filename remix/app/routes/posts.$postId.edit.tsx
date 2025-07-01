import type { Post } from "@my-app/database";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const postId = params.postId;
	const apiUrl = process.env.API_BASE_URL;
	const res = await fetch(`${apiUrl}/posts/${postId}`);
	if (!res.ok) {
		throw new Response("Post not found.", { status: 404 });
	}
	const post = (await res.json()) as Post;
	return json({ post });
};

// フォームの送信に応じて更新または削除処理を行う
export const action = async ({ request, params }: ActionFunctionArgs) => {
	const postId = params.postId;
	const apiUrl = process.env.API_BASE_URL;

	// --- 👇 HTTPメソッドによって処理を分岐 ---
	if (request.method === "DELETE") {
		await fetch(`${apiUrl}/posts/${postId}`, { method: "DELETE" });
		return redirect(`/posts`);
	}

	if (request.method === "PUT") {
		const formData = await request.formData();
		const title = formData.get("title");
		const content = formData.get("content");

		if (typeof title !== "string" || title.length === 0) {
			return json({ errors: { title: "Title is required" } }, { status: 400 });
		}

		const postData = { title, content };
		await fetch(`${apiUrl}/posts/${postId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
		});
		return redirect(`/posts/${postId}`);
	}
	// --- 👆 ここまで ---

	// PUTでもDELETEでもない場合はエラー
	return new Response("Method Not Allowed", { status: 405 });
};

export default function EditPost() {
	const { post } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	return (
		<div>
			<header className="mb-8">
				<h1 className="text-3xl font-bold">Edit Post</h1>
			</header>
			<main>
				{/* --- 👇 更新フォームのmethodを"PUT"に変更 --- */}
				<Form method="PUT" className="space-y-6">
					<div>
						<label htmlFor="title" className="block text-lg font-medium">
							Title
						</label>
						<input
							id="title"
							name="title"
							type="text"
							defaultValue={post.title}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
							aria-invalid={actionData?.errors?.title ? true : undefined}
							aria-describedby="title-error"
						/>
						{actionData?.errors?.title && (
							<p id="title-error" className="mt-2 text-sm text-red-600">
								{actionData.errors.title}
							</p>
						)}
					</div>
					<div>
						<label htmlFor="content" className="block text-lg font-medium">
							Content
						</label>
						<textarea
							id="content"
							name="content"
							rows={10}
							defaultValue={post.content ?? ""}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
						/>
					</div>
					<div className="flex items-center justify-end gap-4">
						<Link
							to={`/posts/${post.id}`}
							className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
						>
							Cancel
						</Link>
						<button
							type="submit"
							className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
						>
							Update Post
						</button>
					</div>
				</Form>
				{/* --- 👆 ここまで --- */}

				{/* --- 👇 削除ボタン用のフォームを追加 --- */}
				<div className="mt-12 border-t border-red-500/50 pt-6">
					<h2 className="text-xl font-bold text-red-700 dark:text-red-400">
						Danger Zone
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Once you delete a post, there is no going back. Please be certain.
					</p>
					<Form
						method="DELETE"
						onSubmit={(event) => {
							if (!confirm("Are you sure you want to delete this post?")) {
								event.preventDefault();
							}
						}}
						className="mt-4"
					>
						<button
							type="submit"
							className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
						>
							Delete this Post
						</button>
					</Form>
				</div>
				{/* --- 👆 ここまで --- */}
			</main>
		</div>
	);
}