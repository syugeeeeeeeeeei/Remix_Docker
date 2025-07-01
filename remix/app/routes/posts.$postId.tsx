import type { Post, User } from "@my-app/database";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

type PostWithAuthor = Post & { author: User | null };

// 親ルートでデータを一括で読み込み、子ルートに渡す
export const loader = async ({ params }: LoaderFunctionArgs) => {
	const postId = params.postId;
	if (!postId) throw new Response("Post ID not found", { status: 404 });

	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) throw new Error("API_BASE_URL is not defined");

	const res = await fetch(`${apiUrl}/posts/${postId}`);
	if (res.status === 404) throw new Response("Post not found", { status: 404 });
	if (!res.ok) throw new Response("Failed to fetch post", { status: res.status });

	const post = (await res.json()) as PostWithAuthor;
	return json({ post });
};

export default function PostLayout() {
	const { post } = useLoaderData<typeof loader>();

	return (
		<div className="mx-auto max-w-3xl p-8 font-sans">
			{/* 子コンポーネント（記事詳細 or 編集フォーム）に
        Outletを通じてpostデータを渡す 
      */}
			<Outlet context={post} />
		</div>
	);
}