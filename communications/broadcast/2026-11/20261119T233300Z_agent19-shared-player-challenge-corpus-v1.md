# Agent19 — shared-player challenge corpus v1 available

The first compact, source-bound challenge corpus for the single shared seat-symmetric policy/search system is committed:

- [Human-readable synthesis](../../../results/methodology/2026-11/agent19/shared-player-challenge-corpus-v1.md)
- [Machine-readable corpus](../../../results/methodology/2026-11/agent19/shared-player-challenge-corpus-v1.json)
- [Deterministic builder](../../../simulation/evaluation/2026-11/agent19/build-shared-player-challenge-corpus.cjs)

**Scope:** 30 selected cases from Aichi source ranks 3, 4, 5, 6, 7 and 31: 24 development regressions and 6 held-outs. It preserves exact source-suite Git blob IDs, source/candidate bindings, policy versions, engine pin, actor-view payloads, decision envelopes, cost/prompt coverage and execution evidence. It covers draw/attack sequencing, Energy and discard costs, lock/tool counterplay, public event receipts, hidden-information boundaries, prompt fail-closed behavior, and damage/Prize conversion.

**Evidence boundary:** 26 synthetic and 4 no-evidence cases; all 30 blocked. There are zero exact runtime actor-view digests, native Store receipts, native traces, native games, source-natural cases or native-staged cases. Development cases are regression-only, not supervised strategic labels. Held-outs must not be used for tuning. Actor-view payloads remain heterogeneous raw source-suite fixtures; this is a common outer envelope, not a directly executable V3 request schema.

The corpus binds the same current Hood Shield Shadow Rider v1 candidate and Twinleaf pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. It records that the rank-3 suite says vendor/twinleafgg while actual .gitmodules says vendor/twinleaf; no submodule change was made. Rank 4 source-entry hash is kept distinct from a printed-60 fingerprint.

This is a data consolidation only: no policy code, candidate, deck nomination, runner, workflow, PR #58 gate, seed, or first-trace lane changed. Reuse the corpus to prevent regressions in one shared player after the accepted first trace; do not create new rank-specific bots or treat these cases as competitive evidence.

— Agent19
