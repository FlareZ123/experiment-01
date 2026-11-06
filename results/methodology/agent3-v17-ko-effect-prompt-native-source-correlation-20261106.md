# Agent 3: compiled real-Store KnockOutEffect → Prize prompt → physical transfer correlation

**6 November 2026, 19:27 UTC | Developmental evidence, zero qualified games.**

The previous v16 observer established exact native chosen-card Prize movement but classified its three prompts as **ordinary-KO-shaped**, because the prompt text and owner-hand destination did not uniquely prove a Knock Out origin. This continuation adds a second passive Store observer that correlates a `KnockOutEffect` applied by the native Store with a same-Store `ChoosePrizePrompt`, then checks settlement of that original prompt. The previous physical-object observer still checks actual selected-card transfer.

## Frozen cohort and execution

- Source-registered experiment: **8 unchanged original rank6/rank11 trial IDs**, across **A/B/A**, 24 actual pinned Store attempts. Control policy and source/candidate printed 60s are inherited unchanged from `simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs`.
- [Successful manual CI 42279030760](https://github.com/FlareZ123/experiment-01/actions/runs/42279030760), head `bb634a30e41cfca4db8b0e51d24327d8fae336e5`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The preexisting opt-in `issue25_v14_only` workflow compiled the engine, passed both-seat pure tests and passed the previous v14/v16 native regressions and the new v17 native test. No automatic per-push workflow was introduced.
- [Original complete six-file artifact, ID 13534352279](https://github.com/FlareZ123/experiment-01/actions/runs/42279030760/artifacts/13534352279): uploaded ZIP SHA-256 `eaf3f62db0ac87402a9167da1bcfc0d50a718fd0bb50d504191d08a6d3e63926`, independently rehashed from downloaded ZIP bytes. V17 `issue25-v17-ko-effect-prompt-provenance.json` is 15,601 bytes, independently verified SHA-256 `0d53c129851f60c9f36c4e53772cd73b7d361b87de52223533245247fc5989de`. The artifact also retains the v14 raw panel, v16 physical audit and their SHA-256 sidecars.
- Pure tests: `tests/agent3-ko-effect-prompt-provenance.test.cjs` exercise both owner seats, an unrelated Prize effect, a hypothetical other Store without genuine player registration, a `reduceEffect` call outside the actual dispatch, a silent native answer no-op, and prototype restoration after failure. All passed in the native CI preflight.

## Native observation

| Measurement | Actual recorded result |
| --- | ---: |
| Registered actual native Store attempts | 24 |
| Original source prechoice, request, actual-first-player equalities | 32 / 32 / 32 |
| Source physical-deal A/B/A matches | 8 / 8 |
| Repeated-control root/status A/A' matches | 8 / 8 |
| Eligible same-Store `KnockOutEffect` events | **3** |
| `ChoosePrizePrompt` creations correlated with those events | **3** |
| Exact pending correlated prompt answers settled by Store | **3** |
| Correlated but unsettled answers | 0 |
| Unattributed CHOOSE_PRIZE_CARD prompt creations | 0 |
| Physical observer's eligible KO-shaped Prize answers | **3** |
| Exact physical chosen-card Prize→owner hand transfers | **3** |
| Native Lost Zone or other destination transfers | 0 |
| All three correlated and physical observations by seat | seat 0 |
| Full competitively qualified games | **0** |

The `AGENT3_V17_KO_ORIGIN_NATIVE` native log and archived JSON retain source, test, runner, registration and vendor fingerprints. All three v16 physical movements were on **public turn 5, phase 3, seat 0**, each showing **one Prize card** moved from six remaining to five. These may be replay observations of the same registered deal in different A/B/A phases. **They are not three independent distinct physical opening conditions or opponent-complete matches.** The archived v17 report compares aggregated counts; it does not assert a per-attempt v16/v17 prompt-object identity join.

## Mechanism, what is proven, and limitations

- `simulation/twinleaf/agent3-ko-effect-prompt-provenance.cjs` wraps native `Store.prototype.dispatch`, `reduceEffect` and `prompt`, restores all original descriptors, and never changes card/game actions, targets, effects or prompt answers. It gates candidate KO effects to the most recently registered player Store, currently executing a Store dispatch, and excludes `calculatingPlayability`; it correlates the Prize taker, physical destination and sufficient Prize count with a subsequently created prompt. It checks settlement using the exact original prompt object's `result === action.result`. It returns no concealed card names or faces.
- The pinned `executeCheckState` creates `KnockOutEffect` and later groups `ChoosePrizePrompt` by recipient/destination/count. In this bounded replay, **the three native Store KO events, matching prompt creations and settled selections agree exactly with the three previous physical-card transfers**.
- This is stronger engine-origin evidence than choosing the prompt class or checking a three-card aggregate alone. The two observers share the same live engine and frozen physical draws, so they are **corroborating Store witnesses, not independent game samples**.
- The new observer's `realStoreIdentityProofComplete=false` is deliberate: most recent `AddPlayerAction` is an inferred real Store registration and could in principle be shadowed by a hypothetical Store that also adds players. The observer has no unique exported `executeCheckState` call-site token, so unrelated same-Store effects with matching recipient/destination/count might be miscorrelated in adversarial cases. Prompt provenance is therefore **correlated, not uniquely certified**. The v17 and v16 records also lack a shared per-choice session/ordinal identity.
- No ability to classify all valid redirected Prize dispositions, complete printed payment/targets, adversarial two-player decision competence, full games or official 25-minute paper-game time is gained. Store acceptance alone is not a paper-rules certificate. Do not promote this evidence to a matchup result or final deck ranking.

## Next decision-changing experiment

Expose a **single root-Store session/choice-ordinal join** to both observers and demand exact same-prompt identity for the KO effect source and physical card destination. Prove a negative fixture where another Store or speculative live-Store reducer evaluation creates a matching event but never reaches the authoritative `checkState` prompt. Preserve these 24 A/B/A attempts and the current artifact unchanged while the release steward decides whether to integrate an explicit source-ordinal receipt into the selected bilateral v8 successor.

**Research outcome:** three correlated genuine native KO-to-Prize movement witnesses, still **zero paper-qualified full games**, no selected final fixed 60, and no supported 99.5% field win rate.
