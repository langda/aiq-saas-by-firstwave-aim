import Link from "next/link";

import { strings } from "@/lib/strings";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-lg font-semibold tracking-tight"
        >
          {strings.brand.name}
        </Link>
        {children}
      </div>
    </main>
  );
}
