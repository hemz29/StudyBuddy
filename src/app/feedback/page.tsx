import { FeedbackSurvey } from "./FeedbackSurvey";

export const metadata = { title: "Quick feedback · Kali Kannada" };

// Opened from a WhatsApp link; no sign-in. `?n=Priya` greets the parent by name and tells the owner who answered.
export default async function Feedback({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return (
    <main className="app-bg grid min-h-screen place-items-center px-4 py-8">
      <FeedbackSurvey name={n?.slice(0, 60)} />
    </main>
  );
}
