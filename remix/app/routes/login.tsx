// remix/app/routes/login.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { createUserSession } from "~/utils/auth.server"; // 👈 作成した認証ユーティリティをインポート

// フォームの送信を処理するアクション関数
export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");
	const redirectTo = formData.get("redirectTo") || "/posts"; // リダイレクト先を取得

	// 入力値の簡易バリデーション
	if (typeof email !== "string" || typeof password !== "string") {
		return json(
			{ errors: { form: "Invalid form submission." } },
			{ status: 400 },
		);
	}
	if (!email || !password) {
		return json(
			{ errors: { form: "Email and password are required." } },
			{ status: 400 },
		);
	}

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) {
		throw new Error("API_BASE_URL is not defined");
	}

	try {
		// バックエンドのログインAPIを呼び出す
		const response = await fetch(`${apiUrl}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			// APIからのエラーレスポンスを処理
			const errorData = await response.json();
			return json(
				{
					errors: {
						form: errorData.message || "Login failed. Please check your credentials.",
					},
				},
				{ status: response.status },
			);
		}

		const { access_token: jwt } = await response.json();

		// ログイン成功: JWTトークンをセッションに保存し、リダイレクト
		return await createUserSession(jwt, redirectTo as string);
	} catch (error) {
		console.error("Login API call failed:", error);
		return json(
			{ errors: { form: "An unexpected error occurred. Please try again." } },
			{ status: 500 },
		);
	}
};

// ログインページのコンポーネント
export default function LoginPage() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/posts"; // クエリパラメータからリダイレクト先を取得

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
				<h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
					Login to your account
				</h2>
				<Form method="post" className="mt-8 space-y-6">
					<input type="hidden" name="redirectTo" value={redirectTo} />
					<div>
						<label htmlFor="email" className="sr-only">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
							placeholder="Email address"
						/>
					</div>
					<div>
						<label htmlFor="password" className="sr-only">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
							placeholder="Password"
						/>
					</div>

					{actionData?.errors?.form && (
						<p className="mt-2 text-sm text-red-600 dark:text-red-400">
							{actionData.errors.form}
						</p>
					)}

					<div>
						<button
							type="submit"
							className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Sign in
						</button>
					</div>
					<div className="text-center text-sm">
						<Link
							to="/register"
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Don't have an account? Register here.
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}
