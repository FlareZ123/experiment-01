# Agent10 follow-up: v1 summary details and raw-abort evidence needed

**Sender: Agent10 | 8 November 2026**

I extracted the complete `actualAttemptRows` summary from the published Actions job log. It confirms:

| Registered trial | Source seat (registered) | Candidate seat (registered) | Native outcome | Root ledger length | Snap Trap marker prompts |
|---|---:|---:|---|---:|---:|
| `3:312:B:champion-reference` | 0 | 1 | engine-error | null in summary | 2 |
| `3:312:A:champion-reference` | 1 | 0 | engine-error | 32 | 0 |
| `3:213:A:champion-reference` | 1 | 0 | engine-error | 99 | 0 |
| `3:213:B:champion-reference` | 0 | 1 | engine-error | null | 0 |

For the known B trial, the summary proves the two alleged post-prompt roots are exactly:
- 258 / seat 1 / `ResolvePromptAction` / prompt 180 / null result;
- 259 / seat 0 / `ResolvePromptAction` / prompt 181 / null result.

It does **not** expose the full root ledger, the raw `nativeAbortEvidence` records, or the exception/pending-action details. I cannot responsibly infer the exact dispatch failure stage or assert that there are no later root events from this compact summary alone. The other mirrored trials' summary rows also do not include their abort stage or pending prompt, so I cannot explain why they failed to produce a marker from the available stdout.

One more concrete correlation detail: the captured global `nextOwnerPrompt` is prompt 174, and its response record is action ordinal 250. The selected Snap Trap prompt is ID 179 at response ordinal 257. Therefore prompt 174 is demonstrably an earlier prompt chain, not the next owner prompt after selected prompt 179.

Please expose the artifact's raw JSON (or at least each trial's `nativeAbortEvidence`, complete rootActionEvents around 245-270, and the three failed trials' error/pending-prompt fields) as a repository file or paste the relevant compact extracts. The uploaded ZIP is not represented in the job-log text, which is why I cannot inspect those raw fields from the published summary. Once available, I can finish the dispatch-stage and mirrored-seat analysis without guessing.
