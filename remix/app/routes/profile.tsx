// remix/app/routes/profile.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react"; // useState をインポート
import { AlertDialog } from "~/components/AlertDialog"; // AlertDialog をインポート
import { destroyUserSession, getJwt, requireUserSession } from "~/utils/auth.server";

// loader関数でユーザープロフィールを取得
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireUserSession(request); // 認証されていない場合はリダイレクト
	const jwt = await getJwt(request);

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) {
		throw new Error("API_BASE_URL is not defined");
	}

	try {
		const res = await fetch(`${apiUrl}/users/me`, {
			headers: {
				"Authorization": `Bearer ${jwt}`,
			},
		});

		if (!res.ok) {
			// APIからエラーが返された場合、セッションを破棄してログインページへリダイレクト
			await destroyUserSession(request);
			throw redirect("/login");
		}

		const profile = await res.json();
		return json({ user, profile });
	} catch (error) {
		console.error("Failed to fetch user profile:", error);
		// エラー発生時もログインページへリダイレクト
		await destroyUserSession(request);
		throw redirect("/login");
	}
};

// フォームの送信を処理するアクション関数
export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await requireUserSession(request); // 認証されていない場合はリダイレクト
	const jwt = await getJwt(request);

	const formData = await request.formData();
	const intent = formData.get("intent"); // フォームの意図 (update or delete)

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) {
		throw new Error("API_BASE_URL is not defined");
	}

	try {
		if (intent === "update") {
			const email = formData.get("email");
			const password = formData.get("password");

			if (typeof email !== "string" || email.length === 0) {
				return json({ errors: { email: "Email is required" } }, { status: 400 });
			}

			const updateData: { email: string; password?: string } = { email };
			if (typeof password === "string" && password.length > 0) {
				updateData.password = password;
			}

			const res = await fetch(`${apiUrl}/users/me`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${jwt}`,
				},
				body: JSON.stringify(updateData),
			});

			if (!res.ok) {
				const errorData = await res.json();
				return json(
					{ errors: { form: errorData.message || "Failed to update profile." } },
					{ status: res.status },
				);
			}

			// 更新成功後、ユーザー情報を再取得するためにリロード
			return json({ success: "Profile updated successfully!" });

		} else if (intent === "delete") {
			const res = await fetch(`${apiUrl}/users/me`, {
				method: "DELETE",
				headers: {
					"Authorization": `Bearer ${jwt}`,
				},
			});

			if (!res.ok) {
				const errorData = await res.json();
				return json(
					{ errors: { form: errorData.message || "Failed to delete account." } },
					{ status: res.status },
				);
			}

			// 削除成功: セッションを破棄してログインページへリダイレクト
			return await destroyUserSession(request);
		}
	} catch (error) {
		console.error("Profile action failed:", error);
		return json(
			{ errors: { form: "An unexpected error occurred. Please try again." } },
			{ status: 500 },
		);
	}
	return json({});
};

export default function ProfilePage() {
	const { user, profile } = useLoaderData<typeof loader>();
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
		const form = document.getElementById('delete-account-form') as HTMLFormElement;
		if (form) {
			form.submit();
		}
	};

	return (
		<div className="mx-auto max-w-2xl p-8 font-sans text-gray-800 dark:text-gray-100">
			<header className="mb-8 border-b pb-4 dark:border-gray-700">
				<h1 className="text-3xl font-bold">Your Profile</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Manage your account settings.
				</p>
			</header>

			<main className="space-y-10">
				{actionData?.success && (
					<div className="rounded-md bg-green-100 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-300">
						{actionData.success}
					</div>
				)}
				{actionData?.errors?.form && (
					<div className="rounded-md bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
						{actionData.errors.form}
					</div>
				)}

				{/* プロフィール更新フォーム */}
				<section>
					<h2 className="mb-4 text-2xl font-semibold">Update Profile</h2>
					<Form method="patch" className="space-y-6">
						<input type="hidden" name="intent" value="update" />
						<div>
							<label htmlFor="email" className="block text-lg font-medium">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								defaultValue={profile.email}
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
								aria-invalid={actionData?.errors?.email ? true : undefined}
								aria-describedby="email-error"
							/>
							{actionData?.errors?.email && (
								<p id="email-error" className="mt-2 text-sm text-red-600">
									{actionData.errors.email}
								</p>
							)}
						</div>
						<div>
							<label htmlFor="password" className="block text-lg font-medium">
								New Password (leave blank to keep current)
							</label>
							<input
								id="password"
								name="password"
								type="password"
								placeholder="********"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
							/>
						</div>
						<div className="flex justify-end">
							<button
								type="submit"
								className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Updating..." : "Update Profile"}
							</button>
						</div>
					</Form>
				</section>

				{/* アカウント削除セクション */}
				<section className="mt-12 border-t border-red-500/50 pt-6">
					<h2 className="text-2xl font-semibold text-red-700 dark:text-red-400">
						Danger Zone
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Once you delete your account, there is no going back. Please be certain.
					</p>
					<Form id="delete-account-form" method="delete" className="mt-4">
						<input type="hidden" name="intent" value="delete" />
						<button
							type="button" // フォームを直接送信せず、モーダルを開く
							onClick={handleDeleteClick}
							className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Deleting..." : "Delete Account"}
						</button>
					</Form>
				</section>
			</main>

			{/* 削除確認モーダル */}
			<AlertDialog
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Account"
				message="Are you sure you want to delete your account? This action cannot be undone."
				confirmText="Yes, Delete My Account"
			/>
		</div>
	);
}
