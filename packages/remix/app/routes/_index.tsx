import { PrismaClient } from '@my-app/database';
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

const prisma = new PrismaClient();

// サーバーサイドで実行されるデータローダー
export const loader = async ({ }: LoaderFunctionArgs) => {
	// 本来は `fetch('http://api:3000/users')` のようにAPIを叩く
	// ここではデモとして、Remixサーバーが直接DBにアクセスする
	const users = await prisma.user.findMany();
	return Response.json({ users });
};

// ブラウザでレンダリングされるコンポーネント
export default function Index() {
	const { users } = useLoaderData<typeof loader>();
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }
		}>
			<h1>Welcome to Remix on Docker! </h1>
			< h2 > Users from Database: </h2>
			{
				users.length > 0 ? (
					<ul>
						{
							users.map((user) => (
								<li key={user.id} > {user.email} </li>
							))
						}
					</ul>
				) : (
					<p>No users found.Please add some to the database.</p>
				)
			}
		</div>
	);
}