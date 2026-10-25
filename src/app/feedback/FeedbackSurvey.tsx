"use client";
import { useState } from "react";
import { LogoMark } from "@/components/shell/Logo";
import { INTENT, REPLACE } from "@/lib/feedback";

// One question per screen; tapping an answer moves straight on, so it takes about 30 seconds.
export function FeedbackSurvey({ name }: { name?: string }) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState("");
  const [replace, setReplace] = useState<string[]>([]);
  const [nps, setNps] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  async function submit() {
    setState("sending");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ intent, replace: replace.length ? replace : undefined, nps, comment: comment || undefined, name }),
    }).catch(() => null);
    if (res?.ok) setStep(4);
    else setState("error");
  }

  const choice = (label: string, on: boolean, pick: () => void) => (
    <button key={label} onClick={pick} className={`min-h-14 rounded-2xl border-2 px-4 text-left text-base transition ${on ? "border-black bg-black text-white" : "border-line bg-white hover:border-black"}`}>
      {label}
    </button>
  );

  return (
    <div className="card flex w-full max-w-md flex-col gap-5 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <LogoMark size={36} />
        {step < 4 && (
          <div className="flex flex-1 gap-1.5" aria-label={`Question ${step + 1} of 4`}>
            {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-black" : "bg-line"}`} />)}
          </div>
        )}
      </div>

      {step === 0 && (
        <>
          <p className="text-sm text-muted">{name ? `Hi ${name}! ` : ""}3 taps, 30 seconds. Thank you for helping.</p>
          <h1 className="text-2xl">Will you use Kali Kannada for your child&apos;s next Kannada test?</h1>
          <div className="flex flex-col gap-2">{INTENT.map((o) => choice(o, intent === o, () => { setIntent(o); setReplace([]); setStep(o === "Probably not" ? 2 : 1); }))}</div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-2xl">If yes, which part of your current Kannada preparation steps would this app replace?</h1>
          <p className="-mt-3 text-sm text-muted">Pick all that apply</p>
          <div className="flex flex-col gap-2">
            {REPLACE.map((o) => choice(`${replace.includes(o) ? "✓ " : ""}${o}`, replace.includes(o), () => setReplace((r) => (r.includes(o) ? r.filter((x) => x !== o) : [...r, o]))))}
          </div>
          <button onClick={() => setStep(2)} className="btn btn-primary">{replace.length ? "Next" : "Skip"}</button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl">How likely are you to recommend it to another parent?</h1>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
            {Array.from({ length: 11 }, (_, n) => (
              <button key={n} onClick={() => { setNps(n); setStep(3); }} className={`h-12 rounded-xl border-2 font-medium ${nps === n ? "border-black bg-black text-white" : "border-line bg-white hover:border-black"}`}>{n}</button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted"><span>0 · Not at all</span><span>10 · Definitely</span></div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-2xl">What would make you come back, or what put you off?</h1>
          <label htmlFor="comment" className="-mt-3 text-sm text-muted">Optional, anything helps</label>
          <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={2000} className="rounded-xl border border-line bg-white p-3 text-base" />
          {state === "error" && <p className="text-bad">That didn&apos;t send. Please try again.</p>}
          <button onClick={submit} disabled={state === "sending"} className="btn btn-primary">{state === "sending" ? "Sending…" : "Send"}</button>
        </>
      )}

      {step > 0 && step < 4 && <button onClick={() => setStep(step === 2 && intent === "Probably not" ? 0 : step - 1)} className="self-start text-sm text-muted underline">← Back</button>}

      {step === 4 && (
        <>
          <h1 className="text-2xl">Thank you{name ? `, ${name}` : ""}!</h1>
          <p className="text-muted">Your answers have been sent.</p>
        </>
      )}
    </div>
  );
}
