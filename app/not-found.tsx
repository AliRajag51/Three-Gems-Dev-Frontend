import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 grid place-items-center px-5 py-20">
      <div className="text-center">
        <p className="font-display text-7xl font-bold text-primary">404</p>
        <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
