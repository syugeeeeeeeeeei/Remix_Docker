import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

// フォームが送信されたときにサーバーサイドで実行される関数
export const action = async ({ request }: ActionFunctionArgs) => {
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

	// TODO: 認証機能ができたら、authorIdを動的に設定する
	// Prisma Studioで作成したUserのIDを仮で指定してください
	const postData = { title, content, authorId: 1 };

	const res = await fetch(`${apiUrl}/posts`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(postData),
	});

	if (!res.ok) {
		return json({ errors: { api: "Failed to create post" } }, { status: 500 });
	}

	// 成功したら記事一覧ページにリダイレクト
	return redirect(`/posts`);
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