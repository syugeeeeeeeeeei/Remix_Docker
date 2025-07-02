// remix/app/utils/auth.server.ts
import type { User } from "@my-app/database"; // Prisma からの User 型をインポート
import { createCookieSessionStorage, redirect } from "@remix-run/node"; // json を追加

// JWTトークンを保存するためのセッションストレージを設定
// 本番環境ではsecretを環境変数から取得する
const sessionSecret = process.env.SESSION_SECRET || "s3cr3t_k3y_f0r_d3v"; // TODO: 本番環境用に安全なシークレットを設定
export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [sessionSecret],
		secure: process.env.NODE_ENV === "production", // HTTPSでのみクッキーを送信
		maxAge: 60 * 60 * 24 * 7, // 1週間
	},
});

/**
 * ユーザーセッションを作成し、JWTトークンをクッキーに保存してリダイレクトする
 */
export async function createUserSession(jwt: string, redirectTo: string) {
	const session = await sessionStorage.getSession();
	session.set("jwt", jwt); // JWTトークンをセッションに保存
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(session),
		},
	});
}

/**
 * セッションからJWTトークンを取得する
 */
export async function getJwt(request: Request): Promise<string | null> {
	const session = await sessionStorage.getSession(request.headers.get("Cookie"));
	const jwt = session.get("jwt");
	return jwt || null;
}

/**
 * セッションからユーザー情報を取得する
 * (JWTトークンをデコードしてユーザーIDとEmailを返す)
 */
export async function getUserFromSession(
	request: Request,
): Promise<Pick<User, "id" | "email"> | null> {
	const jwt = await getJwt(request);
	if (!jwt) return null;

	try {
		// JWTトークンをデコードする（実際にはバックエンドでの検証後、フロントでIDとEmailを保持する）
		// 通常は、セキュリティのためトークンの全デコードは行わず、
		// バックエンドで検証済みのユーザー情報をセッションから取得する。
		// 今回は簡易化のため、IDとEmailのみを抽出する想定。
		const payload = JSON.parse(atob(jwt.split('.')[1])); // Base64デコード
		return { id: payload.sub, email: payload.email }; // subがuserId、emailがemail
	} catch (error) {
		console.error("Error decoding JWT:", error);
		return null;
	}
}

/**
 * 認証されていない場合に指定されたパスにリダイレクトする
 */
export async function requireUserSession(
	request: Request,
	redirectTo: string = new URL(request.url).pathname, // 現在のパスをリダイレクト先として保持
) {
	const user = await getUserFromSession(request);
	if (!user) {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return user;
}

/**
 * ユーザーセッションを破棄する
 */
export async function destroyUserSession(request: Request) {
	const session = await sessionStorage.getSession(request.headers.get("Cookie"));
	return redirect("/login", {
		headers: {
			"Set-Cookie": await sessionStorage.destroySession(session),
		},
	});
}
