# Agent 3: exact registered original trial → native Store → KO Prize-card object join

**6 November 2026.** This report extends [v19 selected-v8 source/physical audit](agent3-v19-selected-v8-ko-physical-root-scope-20261106.md), and supersedes its session-to-trial mapping uncertainty. It remains developmental native evidence: **zero paper-qualified full games, no deck promotion or demonstrated field win rate**.

## Native root Store identity and registered trial

The pinned research headless entry `simulation/twinleaf/headless.cjs` already calls `request.onRootStoreCreated(store)` when the genuine native `Store` is constructed and before player registration. This is a stronger identity source than the old observer's inference that the most recent `AddPlayerAction` always belonged to the real Store. New passive observer `simulation/twinleaf/agent3-ko-source-prompt-physical-v4.cjs` now requires that specific callback-provided `rootBinding.current`, rejecting a different simulator Store that also dispatches `AddPlayerAction`. Its same-root KO correlation, exact selected Prize-card physical custody and full hook restoration retain v3 semantics.

One backwards-compatible research-runner callback extension in `simulation/evaluation/agent41-bilateral-v2-development.cjs` forwards the current `trial.id` as a second callback argument. Existing single-argument callbacks ignore it; the game actions, printed 60s, seed list, and common opponent policy remain unchanged. The v21 native test verifies **the exact ID in callback order**, with eight matching callback sessions for the eight registered original attempts. Source-code regression and both-seat counterexamples protect foreign-Store registration, stale-root KO events, native silent prompt no-ops, exceptions, and hidden Prize faces.

The frozen v8 original source registration is `results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json`. It contains exactly eight authenticated original rank 6, 11, 1, 3 attempts with two fixed candidate lists, identical seeds and independent physical deal evidence. Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Compiled native runs, artifacts, and independent comparisons

- [V20 callback-root native CI 42308637738](https://github.com/FlareZ123/experiment-01/actions/runs/42308637738), checkout `88bdb29bee87bbbacd90853fbab0f3d83567a756`: **SUCCESS**. [Artifact 13548135836](https://github.com/FlareZ123/experiment-01/actions/runs/42308637738/artifacts/13548135836), ZIP SHA-256 `2297e45dba4af25375042a1689448ef82a217e716479a69ddb33e7ede9b29252`; v20 JSON SHA-256 `ebbb180c4e6a858deccfac7514215a5d92c1a7d8dd20f2fa6973d6acd1d79603`. All eight real Store callbacks registered; six exact source-physical Prize prompt settlements observed.
- [V21 exact-registered-trial native CI 42309117631](https://github.com/FlareZ123/experiment-01/actions/runs/42309117631), checkout `1ab01adc35d8a269a043989759e47b769a270065`: **SUCCESS**. [Artifact 13547741965](https://github.com/FlareZ123/experiment-01/actions/runs/42309117631/artifacts/13547741965), ZIP SHA-256 `b75facbdb72b09e770f78b3bce6a646f8baf3229e9c99ea9e3e29772ecfc17b1`; v21 JSON SHA-256 `a3c87904745719e2e11d234fe5cb5585061f96ca28eed32253298a3d0face912`. The v21 native test is `tests/agent3-issue25-v21-v8-trial-bound-ko-prizes.native.test.cjs`. It preserved the exact v20 registration hash, all eight outcome rows/statuses/root counts, and **every field** of the prior KO observer audit, and added callback-proven trial names.
- Both used the existing manually dispatched workflow `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml` with `issue25_v14_only:true`, and archived raw JSON and SHA-256 sidecars via atomic locked writes. No new push-trigger workflow or silently changed baseline.

## Six exact native Prize selection events on authentic original trial IDs

| Original source | Fixed candidate | Actual taking seat | Native game turn | Chosen physical Prizes entering taker's hand | Disposition of entire source attempt |
| --- | --- | ---: | ---: | ---: | --- |
| Rank 6 Iron Thorns | Champion reference | 0, original source | 17 | 1 | Root cap 128 |
| Rank 6 Iron Thorns | New Moon Lockbreaker v1 | 0, original source | 17 | 1 | Engine error after 118 roots |
| Rank 11 Absol/Garbodor | Champion reference | 1, original source | 18 | 2 | Root cap 128 |
| Rank 11 Absol/Garbodor | New Moon Lockbreaker v1 | 1, original source | 6 | 1 | Engine error after 88 roots |
| Rank 1 Shadow Rider | Champion reference | 1, fixed candidate | 13 | 1 | Engine error after 98 roots |
| Rank 1 Shadow Rider | Champion reference | 1, fixed candidate | 17 | 2 | Same engine-error attempt |

Original rank 1 source vs New Moon (128-root cap) and both rank 3 source attempts (errors after 106 and 93 roots) had **no prompt-mediated KO Prize event observed by this observer**. That is an absence in a bounded instrumented subset, rather than a claim of zero Knock Outs or no auto-taken Prizes in these games.

All six events match an actual same-root native `KnockOutEffect`, exact later `ChoosePrizePrompt` object, a Store-settled choice, and eight specific Prize-card objects physically departing Prize and entering the taking owner's hand. Two prompts selected two cards. No unjoined stale-root KO candidates appeared in these eight native attempts. Complete observer, real Store callback count and original source outcome rows were **byte-for-byte identical as JSON values between v20 and v21**, confirmed by independently opening both downloaded archives. Exactly three attempts capped at 128 native roots and five ended in engine errors. No native terminal game occurred.

## Confidence boundaries

The headless callback proves that the observed Store is the game Store created by the real headless runner for each registered attempt. The source-correlated KO and Prize-prompt link remains a recipient/destination/count match within one Store dispatch. It is **not a unique `executeCheckState` provenance token**; `uniqueCheckStateOriginCertified=false` remains correct. These six observations also exclude automatic Prize taking that never creates `ChoosePrizePrompt`, plus any error/cap states beyond each trial horizon. They certify individual physical moves under the pinned engine and the frozen developmental decision policy, not printed attack payments or adversarial competence.

The resulting trial-specific examples can be reused as reproducible instrumentation tests for future prospective same-policy two-player releases. Do not convert a real Store Prize transition into an inferred complete competitive win, a matched counterfactual effectiveness claim, or a 99.5% field-rate estimate.

## Next proof target

Instrument the same original registered native Store's **every physical Prize-zone exit** at settled outer root boundaries. This would expose automatic KO Prize-taking and other Prize movement not represented by the six prompt-mediated events. Preserve a separate label for each physical cause (e.g., KO or non-KO unknown) and do not equate simple Prize-zone exit with a legal Knock Out. After that, prioritize genuine paid attacking/control lines and competent opponent response within prospective fixed-60 comparisons.
