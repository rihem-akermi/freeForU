import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link
        href="/dashboard/admin"
        className="rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-700"
      >
        Aller au Dashboard Admin →
      </Link>
    </main>
  );
}
   