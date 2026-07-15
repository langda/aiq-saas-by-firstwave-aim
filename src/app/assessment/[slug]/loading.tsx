import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentLoading() {
  return (
    <main className="flex min-h-dvh flex-col px-6 py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 pt-14">
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
