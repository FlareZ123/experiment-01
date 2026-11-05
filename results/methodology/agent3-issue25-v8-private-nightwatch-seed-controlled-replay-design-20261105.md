# Issue25 native v8 causal closure: confirmed independent Night Watch seed confounder, now explicitly coupled in pending A/A/B/A study

**Agent3 | 5 November 2026 | source audit, preregistered implementation, no new native trials yet.**

## Source-grounded confounder

The actual `simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs` `withJoinedOwnerAttackFrontier(next,deps)` calls `const secret=randomBytes(32)` each time the wrapper is constructed. The default is `crypto.randomBytes`. It passes `secret.toString('hex')` into `withSourceStampedNightWatchOwner` as its `committedSeed`, with `perNativeStoreEntropy:true` and `followSequentialNativeStores:true`. Native per-Store Night Watch subkeys come from a cryptographic HMAC of that seed and the native Store ordinal. This is valid game-randomness engineering in a single fresh campaign.

The v8 baseline/protected comparison calls `runPrechoiceCustodyV8('baseline')` and `runPrechoiceCustodyV8('protected')` in separate wrapper constructions. It uses unchanged full printed deck requests and the same process-secret prechoice *HMAC key*, but unless a dependency injection is used its **Night Watch game-effect random seed is drawn separately for each campaign**. Equal registered request and prechoice private-position HMACs **do not establish equal Night Watch sampling streams**. The observed v8 native row output does not itself establish that a Night Watch prompt was reached in a mismatching row; the actual effect on those games is **unresolved**, and no posttreatment divergence is attributed to this confounder without a live source prompt.

## Controlled proposed experiment

[Before any native run, precommitted registration](../aichi-2026/registrations/agent3-issue25-v8-four-campaign-root-replay-v11-20261105.json) freezes eight original source ranks/seats/seeds and four campaigns: **baseline, repeated baseline, protected opening, final baseline**, 8 registered trials each, all physically executed in the same process.

The [comparator and runner](../../simulation/evaluation/agent3-issue25-v8-four-campaign-root-replay.cjs) reuse the unchanged v8 private fingerprint observer and use the existing v4 `randomBytes` test injection seam. A **single fresh OS 256-bit secret** is drawn *before* all four campaigns; each v4 wrapper receives a fresh copy of that same immutable 32-byte buffer. The existing per-Store HMAC derivation is retained. The true raw seed remains off the public report and off the actual actor's observations.

This turns an uncontrolled independent per-campaign random source into a **matched common-random-number source**, without inventing a seed or replacing actual Pokémon gameplay. The comparator checks the equality of the resulting four manifest SHA256 seed commitments, the owner prechoice HMAC session, 48 matched owner-position HMAC pairs, 48 matched JSON-serializable request HMAC pairs, both observed Git/engine pins, all three control native statuses and complete public root-ledger SHA256s, and all three control postchoice source physical-deal digests. Complete per-trial original and repeated statuses, cap/errors, and the first public root difference to protected treatment are retained. An incomplete or inconsistent control root leads to **UNRESOLVED** or **FAIL** rather than a game-win inference.

**Boundaries:** Other random draws in the engine, randomized opponent bot actions, alternative hook closure identity, prompt-specific card semantics, paper-format legality, actual source policy competence, and genuine full game outcomes remain unverified. Even three exact observed controls cannot prove complete non-treatment closure equality. The report explicitly sets `causalNonTreatmentClosureCertified:false`, `causalTreatmentAttribution:'UNRESOLVED'`, `nativePaperGamesQualified:0`.

## Executability and current verification status

- Implementation and [adversarial pure tests](../../tests/agent3-issue25-v8-four-campaign-root-replay.test.cjs) were committed before any new native outcomes. [Native test](../../tests/agent3-issue25-v8-four-campaign-root-replay.native.test.cjs) archives even unfavorable results with an exclusive lock, atomic rename, and SHA256 sidecar. It does not assert successful control replay before observing it.
- On 5 November at 00:28 UTC, a separate, source-loaded V8 isolate smoke executed all **9 pure test callbacks successfully** against the exact current GitHub blobs of the comparator (`4d916912f1a59d41e60f830877205172418656a3`) and pure test file (`c27e935592fcfc65460a37c32f612e60f75cd73e`). This deliberately substituted local JavaScript assertion and deterministic hash shims for Node builtins, so it establishes **JavaScript syntax and branch/contract behavior under a shim**. It does **not** substitute for actual Node's `node:test`, cryptographic SHA-256 validation, frozen native result replay, or pinned Store execution. The additional gates fail closed on mismatching actual 60-card printing multisets or first-player seat.
- A direct shared GitHub Actions workflow-file update was blocked by platform safety checks. The previous workflow remains unmodified; the 32-arm study has **not been executed in CI**. A proposed opt-in manual CI integration was communicated to Agent1 and Agent36. No synthetic fixture, code inspection, or former 16-arm v8 result is represented as these 32 new native Store outcomes.
- Once a legitimate CI executor runs this registered exact test and its artifact is independently downloaded/rehashed, compare actual statuses. If three controls differ despite matched prechoice, requests and coupled Night Watch seed, detect a remaining nondeterministic source before attributing protected-opening payoffs. If controls reproduce, promote only *bounded prechoice and observed root deterministic replay*.

## Reproducibility pointers

- Original native v8 artifact evidence and exact SHA256: [independent verified source review](agent3-issue25-v8-prechoice-native-store-join-independent-review-20261104.md).
- Unchanged underlying [original source registration](../aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json), pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- This design does not certify the 99.5% target; still 29 of 32 original 60s authenticated and zero competitive-qualified games.
