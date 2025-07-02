// remix/app/routes/register.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { getUserFromSession } from "~/utils/auth.server"; // 👈 認証ユーティリティをインポート

// ログイン済みユーザーが登録ページにアクセスした場合、リダイレクトする
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUserFromSession(request);
	if (user) {
		return redirect("/posts"); // ログイン済みの場合は投稿一覧へ
	}
	return null;
};

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
		// バックエンドの新規登録APIを呼び出す
		const response = await fetch(`${apiUrl}/auth/register`, {
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
						form: errorData.message || "Registration failed. Please try again.",
					},
				},
				{ status: response.status },
			);
		}

		// 登録成功後、自動的にログインさせる（JWTを取得してセッションに保存）
		// NestJSのregisterエンドポイントはユーザー情報のみを返すため、
		// 登録後に別途ログインAPIを呼び出すか、register時にJWTも返すようにバックエンドを修正する必要がある。
		// 今回は簡易化のため、登録成功後にログインページへリダイレクトして手動ログインを促す。
		// もし登録と同時にログインさせたい場合は、register APIがJWTを返すようにバックエンドを修正してください。
		// または、登録成功後にlogin APIを呼び出すロジックをここに追加してください。
		// 例：
		// const loginResponse = await fetch(`${apiUrl}/auth/login`, { ... });
		// const { access_token: jwt } = await loginResponse.json();
		// return await createUserSession(jwt, redirectTo as string);

		// 現状は登録成功後、ログインページへリダイレクト
		return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo as string)}`);

	} catch (error) {
		console.error("Registration API call failed:", error);
		return json(
			{ errors: { form: "An unexpected error occurred. Please try again." } },
			{ status: 500 },
		);
	}
};

// 新規登録ページのコンポーネント
export default function RegisterPage() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/posts"; // クエリパラメータからリダイレクト先を取得

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
				<h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
					Create a new account
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
							autoComplete="new-password"
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
							className="group relative flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						>
							Register
						</button>
					</div>
					<div className="text-center text-sm">
						<Link
							to="/login"
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Already have an account? Login here.
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}
