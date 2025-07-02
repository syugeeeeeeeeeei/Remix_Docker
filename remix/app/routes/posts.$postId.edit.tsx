// remix/app/routes/posts.$postId.edit.tsx
import type { Post } from "@my-app/database"; // @my-app/database からの型をインポート
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react"; // useNavigation を追加
import { useState } from "react"; // useState を追加
import { AlertDialog } from "~/components/AlertDialog"; // 👈 AlertDialog をインポート
import { destroyUserSession, getJwt, requireUserSession } from "~/utils/auth.server"; // 👈 認証ユーティリティをインポート

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const user = await requireUserSession(request); // 認証されていない場合はログインページにリダイレクト
	const jwt = await getJwt(request);

	const postId = params.postId;
	if (!postId) throw new Response("Post ID not found", { status: 404 });

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) throw new Error("API_BASE_URL is not defined");

	const res = await fetch(`${apiUrl}/posts/${postId}`);
	if (res.status === 404) throw new Response("Post not found", { status: 404 });
	if (!res.ok) {
		// APIからエラーが返された場合、セッションを破棄してログインページへリダイレクト
		await destroyUserSession(request);
		throw redirect("/login");
	}

	const post = (await res.json()) as Post;

	// 投稿の所有者であるかチェック
	if (post.authorId !== user.id) {
		throw new Response("Unauthorized", { status: 403, statusText: "You are not the author of this post." });
	}

	return json({ post });
};

// フォームの送信に応じて更新または削除処理を行う
export const action = async ({ request, params }: ActionFunctionArgs) => {
	const user = await requireUserSession(request); // 認証されていない場合はリダイレクト
	const jwt = await getJwt(request);

	const postId = params.postId;
	if (!postId) throw new Response("Post ID not found", { status: 400 });

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) throw new Error("API_BASE_URL is not defined");

	// まず、投稿の所有者であるか確認
	const currentPostRes = await fetch(`${apiUrl}/posts/${postId}`);
	if (!currentPostRes.ok) {
		throw new Response("Post not found.", { status: 404 });
	}
	const currentPost = (await currentPostRes.json()) as Post;
	if (currentPost.authorId !== user.id) {
		throw new Response("Unauthorized", { status: 403, statusText: "You are not authorized to perform this action." });
	}

	if (request.method === "DELETE") {
		const res = await fetch(`${apiUrl}/posts/${postId}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${jwt}`, // JWTトークンを送信
			},
		});

		if (!res.ok) {
			const errorData = await res.json();
			return json(
				{ errors: { api: errorData.message || "Failed to delete post." } },
				{ status: res.status },
			);
		}
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
		const res = await fetch(`${apiUrl}/posts/${postId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${jwt}`, // JWTトークンを送信
			},
			body: JSON.stringify(postData),
		});

		if (!res.ok) {
			const errorData = await res.json();
			return json(
				{ errors: { api: errorData.message || "Failed to update post." } },
				{ status: res.status },
			);
		}
		return redirect(`/posts/${postId}`);
	}

	// PUTでもDELETEでもない場合はエラー
	return new Response("Method Not Allowed", { status: 405 });
};

export default function EditPost() {
	const { post } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const handleDeleteClick = () => {
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		setIsDeleteModalOpen(false);
		// フォームをプログラム的に送信
		const form = document.getElementById('delete-post-form') as HTMLFormElement; // IDを修正
		if (form) {
			form.submit();
		}
	};

	return (
		<div className="mx-auto max-w-2xl p-8 font-sans text-gray-800 dark:text-gray-100">
			<header className="mb-8">
				<h1 className="text-3xl font-bold">Edit Post</h1>
			</header>
			<main>
				{actionData?.errors?.api && (
					<p className="mb-4 text-sm text-red-600">{actionData.errors.api}</p>
				)}
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
							className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Updating..." : "Update Post"}
						</button>
					</div>
				</Form>

				<div className="mt-12 border-t border-red-500/50 pt-6">
					<h2 className="text-xl font-bold text-red-700 dark:text-red-400">
						Danger Zone
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Once you delete a post, there is no going back. Please be certain.
					</p>
					<Form id="delete-post-form" method="DELETE" className="mt-4"> {/* IDを修正 */}
						<button
							type="button" // フォームを直接送信せず、モーダルを開く
							onClick={handleDeleteClick}
							className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Deleting..." : "Delete this Post"}
						</button>
					</Form>
				</div>
			</main>

			{/* 削除確認モーダル */}
			<AlertDialog
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Post"
				message="Are you sure you want to delete this post? This action cannot be undone."
				confirmText="Yes, Delete This Post"
			/>
		</div>
	);
}
