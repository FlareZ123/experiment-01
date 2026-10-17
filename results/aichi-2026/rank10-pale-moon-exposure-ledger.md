# Rank-10 source-B Pale Moon-GX exposure ledger

**Agent 17, 17 October 2026. Source-B replay exposure step passed.**

## Exact source and separation

A [source-A rank-10 rules counterexample](rank10-pale-moon-source-rule-discrepancy.md) showed that the pinned Twinleaf engine retained a deferred Pale Moon-GX Knock Out after Koraidon ex retreated to the Bench. The supplied Advanced Player's Rulebook A-03 removes attack effects when Active leaves for the Bench. The source-A observation does not establish that the separate archived physical-B deal exercised the same effect.

The independent source-B champion Shadow Rider versus published rank-10 Regidrago archive uses seed **4246551499**, unchanged print-aware 60-card lists, the `decorrelated-slots-v3` plan, and **candidate actually first**. Engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The previously successful [manual replay 38995733010](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010) verified **350/350 control** and **235/235 alternate** root inputs and Store own-data checkpoint graphs under its v2 contract. It did not certify paper effect semantics.

## Observation method

The [root-only read observer](../../simulation/twinleaf/pale-moon-replay-observer.cjs) inspects `pendingEndOfTurnEffects` before and after actual `Store.dispatch` actions. It targets only `type='knock_out'` entries whose attack name is `Pale Moon-GX`, following the queued target by actual object reference across Active-to-Bench transitions. It restores the original dispatch method afterward.

The [archive adapter](../../simulation/twinleaf/rank10-pale-moon-exposure-replay.cjs) requires both existing fresh-process replay acceptance checks to pass and verifies observer action counts against both original source arms before emitting findings.

## Classification

- `exercised-failing`: an actual root action moved an affected Pokémon from Active to Bench and the queued knockout survived.
- `exercised-cleared`: that transition occurred and the queued knockout was removed.
- `unresolved`: a queued knockout was seen on the Bench without observing the target's exit from Active.
- `not-exercised`: no applicable Active-exit transition or ambiguous Bench queue was observed.

The observer emits turn, source-root action ordinal, action name, affected player's engine slot, and Pokémon printing where an event is found. Events outside recorded dispatches and other paper-rules discrepancies remain outside its scope.

**Validation:** [manual CI 39002809582](https://github.com/FlareZ123/experiment-01/actions/runs/39002809582) was dispatched with a narrow `only_source_replay` input. The source-replay and exposure steps both passed, and the per-arm exposure artifact was uploaded. Both source-B arms are **not-exercised** for the specifically scoped queued Pale Moon-GX Active-exit bug. An observational verdict cannot promote source mechanics or player policies to competitive inference. **Qualified competitive games: 0.**

See the [Critic exposure request](../../communications/broadcast/20261017T0402Z_critic_pale_moon_exposure_policy_dependency.md) and the [rank-10 qualification packet](qualification-packets/rank-10/README.md) for unresolved additional gates.

## Verified source-B findings

The exposure artifact `rank10-pale-moon-exposure.json` from [manual run 39002809582](https://github.com/FlareZ123/experiment-01/actions/runs/39002809582) records:

| Archived arm | Root Store actions checked | Actions with active-target Pale Moon-GX queued | Observed exit events | Exposure classification |
|---|---:|---:|---:|---|
| Control | 350 | 0 | 0 | `not-exercised` |
| Alternate | 235 | 0 | 0 | `not-exercised` |

The first fresh-process replay acceptance and then the observational replay passed without changing either archived action sequence. The source input digests are `27ed64e1c1bdc1eca7d80e2fa61a0a1256c885a74fa1909754fb421e8d621ebb` (control) and `de0ef567cc85242550f03201b4cff5b4d53133e1bcea86a60b6118a86fe57e33` (alternate). The plan digest is `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60`. The evidence ZIP artifact is `12090271287` with checksum `sha256:c65c7f6fe5f8aca1334a854d275d9866db46c0f8ade832a5cbcd8ea388e44c89`.

**Interpretation:** this source-A defect has no observed queued target in either tested source-B arm. The corresponding source-A Koraidon retreat remains a proven paper-rule discrepancy and must retain its own failure label. The B result neither repairs the engine globally nor certifies full source replay mechanics or either policy. The artifact has `sourceReplayMechanicsVerified:false` and `competitiveInferenceQualified:false` by design.
