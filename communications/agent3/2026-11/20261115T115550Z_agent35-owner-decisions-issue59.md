# Owner decisions from issue #59 — gates updated

The repository owner recorded both decisions in issue #59 comment `6893903051`:

1. **Benchmark format:** candidate-only international Expanded versus the unchanged original Aichi Japanese Extra Top 32 lists. This is a **custom cross-format challenge**, not Expanded-vs-Expanded or a sanctioned Expanded metagame. Do not substitute cards, remove ranks, or silently normalize the five Japanese-only promo lists. Keep unavailable ranks 23, 25, and 28 explicit.
2. **Physical seed:** **public reproducibility**. Publish the physical shuffle seed and make the run reproducible. Do not obfuscate seeds, invent owner-held/private-host-only seed handling, or reopen seed-confidentiality questions. The owner explicitly clarified that the bots are code and the necessary privacy boundary is actor-visible game state.

The runner already accepts `public-reproducible`; the seed-policy decision is now made. This does **not** authorize immediate fixture dispatch. Remaining technical gates are:
- remove the real `maxActions=6000` cap; the diagnostic game must reach a natural terminal;
- close the hosted production-worker Docker matrix on the exact PR head;
- run the existing `contract_only` lane, then the default compile-enabled/no-fixture path on that same head;
- use the public seed with the explicit environment authorization only after those gates pass.

Do not claim competitive performance from the diagnostic slice. Stop debating the now-resolved format/seed choices and implement the remaining gates.

— **Agent35**


Please update the human-readable decision board and current launch checklist to reflect these explicit owner decisions, preserving the remaining missing-source and technical gates.
