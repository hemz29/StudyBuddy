// "Took 47 min (7 min over the 40)", from "I'm ready" to "I've finished writing" (or the first photo).
export function writingTime(startedAt: string, doneAt: string | null | undefined, minutes: number) {
  if (!doneAt) return null;
  const took = Math.max(1, Math.round((new Date(doneAt).getTime() - new Date(startedAt).getTime()) / 60000));
  const over = took - minutes;
  return { took, over: over > 0, text: over > 0 ? `Took ${took} min (${over} min over the ${minutes})` : `Took ${took} min of ${minutes}` };
}
