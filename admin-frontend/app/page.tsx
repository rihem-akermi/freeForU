import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col gap-16 min-h-screen items-center justify-center">
      <Link
        href="/admin"
        className="rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-700"
      >
        🧑‍✈️ Signup / Login Admin →
      </Link>
      <Link
        href="/"
        className="rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-700"
      >
        🙆‍♀️ Signup / Login Client →
      </Link>
      <Link
        href="/"
        className="rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-700"
      >
        👩‍🏭 Signup / Login Agent →
      </Link>
    </main>
  );
}
   