import Link from "next/link";
import { googleEnabled } from "@/lib/server/google";
import { googleSignIn, sendLink } from "@/lib/server/signIn";
import { GoogleLogo } from "@/components/GoogleLogo";
import { LineIcon } from "@/components/LineIcon";
import { SendButton } from "./SendButton";
import { HashError } from "./HashError";

// Supabase's messages, in words a parent can act on.
function friendly(message: string, email: string) {
  const wait = message.match(/after (\d+) seconds?/);
  if (wait) return { text: `We've just sent a link to ${email}. Please check your inbox and spam folder. You can ask for another one in a minute.`, wait: Number(wait[1]) };
  if (/rate limit/i.test(message)) return { text: "Too many sign-in emails were sent in the last hour. Please try again a little later.", wait: 0 };
  if (/invalid.*email|email.*invalid/i.test(message)) return { text: "That email address doesn't look right. Please check it and try again.", wait: 0 };
  return { text: message, wait: 0 };
}

// The one place to sign in: Google or an email link. "Start free" sits beside it on the home page.
export async function SignInCard({ sent, error, email = "" }: { sent?: string; error?: string; email?: string }) {
  const problem = error ? friendly(error, email || "your email") : null;
  const google = await googleEnabled();
  return (
    <div id="signin" className="card scroll-mt-6 p-6 text-ink">
      {sent ? (
        <div className="flex flex-col gap-2">
          <LineIcon name="mail" size={40} />
          <h2 className="text-2xl">Check your email</h2>
          <p className="text-muted">
            We sent a sign-in link to {email ? <b className="text-ink">{email}</b> : "your email"}. Open it on this device to continue. It can take a minute to arrive; check spam too.
          </p>
          <Link href="/#signin" className="mt-2 text-sm font-bold">Use a different email</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl">Sign in or create an account</h2>
          <HashError />
          {google && (
            <>
              <form action={googleSignIn}>
                <button className="btn w-full border border-[#747775] bg-white text-ink shadow-sm hover:bg-gray-50"><GoogleLogo /> Continue with Google</button>
              </form>
              <div className="flex items-center gap-3 text-sm text-muted"><span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" /></div>
            </>
          )}
          <form action={sendLink} className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-bold">Parent email</label>
            <input id="email" name="email" type="email" required defaultValue={email} autoComplete="email" className="h-12 rounded-xl border border-line bg-white px-4 text-lg" placeholder="you@example.com" />
            {problem && <p className={problem.wait ? "rounded-xl bg-accent-soft p-3 text-ink" : "text-bad"}>{problem.text}</p>}
            <SendButton waitSeconds={problem?.wait ?? 0} />
            <p className="text-xs text-muted">No password needed. We only use your email to sign you in.</p>
          </form>
        </div>
      )}
    </div>
  );
}
