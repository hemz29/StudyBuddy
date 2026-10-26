import { PageSkeleton } from "@/components/PageSkeleton";

export default function Loading() {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6"><PageSkeleton /></div>
    </main>
  );
}
