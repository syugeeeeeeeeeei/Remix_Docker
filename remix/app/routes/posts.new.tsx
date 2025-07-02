// remix/app/routes/posts.new.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // LoaderFunctionArgs を追加
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { getJwt, requireUserSession } from "~/utils/auth.server"; // 👈 requireUserSession と getJwt をインポート

// loader関数を追加して、認証されていない場合はログインページにリダイレクト
export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUserSession(request); // 認証されていない場合はリダイレクト
	return null;
};

// フォームが送信されたときにサーバーサイドで実行される関数
export const action = async ({ request }: ActionFunctionArgs) => {
	// 認証済みユーザーのセッションを必須にする
	const user = await requireUserSession(request); // 認証されていない場合はここでリダイレクトされる
	const jwt = await getJwt(request); // JWTトークンを取得

	const formData = await request.formData();
	const title = formData.get("title");
	const content = formData.get("content");

	// 簡単なバリデーション
	if (typeof title !== "string" || title.length === 0) {
		return json({ errors: { title: "Title is required" } }, { status: 400 });
	}

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) {
		throw new Error("API_BASE_URL is not defined");
	}

	// 認証されたユーザーのIDをauthorIdとして設定
	const postData = { title, content, authorId: user.id }; // 👈 user.id を使用

	try {
		const res = await fetch(`${apiUrl}/posts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${jwt}`, // 👈 JWTトークンをAuthorizationヘッダーに含める
			},
			body: JSON.stringify(postData),
		});

		if (!res.ok) {
			const errorData = await res.json();
			return json(
				{ errors: { api: errorData.message || "Failed to create post" } },
				{ status: res.status },
			);
		}

		// 成功したら記事一覧ページにリダイレクト
		return redirect(`/posts`);
	} catch (error) {
		console.error("Failed to create post:", error);
		return json(
			{ errors: { api: "An unexpected error occurred while creating the post." } },
			{ status: 500 },
		);
	}
};

export default function NewPost() {
	const actionData = useActionData<typeof action>();

	return (
		<div className="mx-auto max-w-2xl p-8 font-sans text-gray-800 dark:text-gray-100">
			<header className="mb-8">
				<h1 className="text-3xl font-bold">Create a New Post</h1>
			</header>
			<main>
				<Form method="post">
					<div className="space-y-6">
						<div>
							<label htmlFor="title" className="block text-lg font-medium">
								Title
							</label>
							<input
								id="title"
								name="title"
								type="text"
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
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
							/>
						</div>
						{actionData?.errors?.api && (
							<p className="text-sm text-red-600">{actionData.errors.api}</p>
						)}
						<div className="flex items-center justify-end gap-4">
							<Link
								to="/posts"
								className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								Cancel
							</Link>
							<button
								type="submit"
								className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
							>
								Create Post
							</button>
						</div>
					</div>
				</Form>
			</main>
		</div>
	);
}
