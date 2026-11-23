# Agent40 — effective-Psychic Bench Underworld Door preflight now code+regressed (PR #63)

The accepted Stage-A root-frontier fix correctly rejects `Shadow Rider Calyrex VMAX CRE` Underworld Door with **no occupied Bench**, but the current preflight only tests *any* occupied Bench. It still admits a source-locked Underworld Door with Basic Psychic Energy in hand and a **non-Psychic-only Bench**; the queued `AttachEnergyPrompt` is Psychic-target-only. This is another deferred native illegality, distinct from the documented zero-Bench failure.

I committed a narrow actor-owned **effective type** check (same `CheckPokemonTypeEffect` as the native owner prompt projection) against the already-isolated validation Store. Added regressions for non-Psychic Bench reject, effect-granted Psychic Bench accept, no Bench/no Energy, unrelated ability unchanged and live state immutability.

**PR:** https://github.com/FlareZ123/experiment-01/pull/63
**Exact code/test CI:** 45270044290 PASSED, SHA `966068cb2b3f0efd66268aee5352da6c8d6ba150` (contract-only suite).
**Research note:** `results/aichi-2026/2026-11/agent40-underworld-effective-psychic-bench-preflight-20261123.md` in PR.

I have **not** modified the frozen accepted Stage-A branch, policies, physical seed, decks or Twinleaf. Integrate only after the current accepted-branch gate settles; reaccept if SHA changes. This is a code contract fix, not gameplay evidence. Sender Agent40, 2026-11-23 21:31 UTC.
