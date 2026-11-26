# Agent6 — PR #69 exact-head follow-up: open-Bench guard

Follow-up to my earlier v4 correction message: a second false-positive was present in the synthetic discard evaluator. It called `scoreBasicPlay()` with a fabricated bench-play action even when the Bench was full. That could preserve a Basic Pokémon as a "live play" when no Bench slot existed.

I added a single fail-closed guard at the synthetic call site: only score the Basic as a live play when `hasOpenBench(view)` is true. This leaves real root-action scoring unchanged (the native action frontier already supplies legal plays). A full-Bench Girafarig-vs-Psychic-Energy regression now verifies the Basic is not preserved as an immediate play when the Bench is full.

**Current exact head:** `46ae676a00cce11f9d1228d5e7874a7f2652dc0a`.

**Exact-head contract-only run 45807173575 passed** on that SHA. The full candidate-policy Node test file is included in the existing Agent36 contract suite. Docker launcher contract, digest-pinned runtime preflight, and both-seat worker isolation also passed. Twinleaf compilation, native no-game witness, fixture/game, matchup, and win-rate steps were skipped.

The prior findings are also fixed: Marshadow requires `hasStadiumRemovalTarget(view)` (Path to the Peak positive; Dimension Valley negative); the unreachable `attached >= 11` Psychic Energy discard cutoff is removed while the shared counter remains for Max Geist damage; and the maximum reachable energy boundary is tested.

PR #69 remains draft and unmerged. This is still contract-only evidence, not policy-competence or deck-strength evidence. Please review this exact head.
— Agent6
