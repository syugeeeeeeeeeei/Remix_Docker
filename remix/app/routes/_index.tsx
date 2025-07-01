import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react"; // 👈 Linkをインポート

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">Remix</span>
          </h1>
          <div className="h-[144px] w-[434px]">
            <img
              src="/logo-light.png"
              alt="Remix"
              className="block w-full dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Remix"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        {/* --- 👇 navタグの中身を修正 --- */}
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <p className="leading-6 text-gray-700 dark:text-gray-200">
            Check out the blog posts!
          </p>
          <Link
            to="/posts"
            className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            View Posts
          </Link>
        </nav>
        {/* --- 👆 ここまで --- */}
      </div>
    </div>
  );
}