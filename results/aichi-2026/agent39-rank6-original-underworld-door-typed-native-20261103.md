# Agent 39: exact rank-6 original-source UNKNOWN_POWER typed action identified

**3 November 2026. Reproduced developmental native failure and typed action attribution; zero qualified competitive games.**

## Concrete reproduction and provenance

The 52-attempt original-source joint-v2 historical release ([Agent23 run 41581727876](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876), [Agent37 diagnosis](agent37-rank6-joint-v2-unknown-power-lock-attribution-20261103.md), [Agent4 original-source custody audit](agent4-rank6-aborted-selected-joint-v2-posthoc-source-parity-20261103.md)) had one decisive failure in its rank-6 Iron Thorns original source context:

- Exactly registered context: `6:300:A:champion-reference`, **candidate physical seat 0**, original rank-6 Iron Thorns source seat 1, seed **3738819225**.
- Both `joint-v1-control` and `selected-v2-symmetric-vip` aborted on turn **8**, attempting `UseAbilityAction` and receiving native `UNKNOWN_POWER` after **42 accepted root actions**. The historical abort receipt's root action ordinal is **43**.
- Original source-seat physical setup SHA-256 `1180bb8d34c5364ce202e23f94eebc5e3c0d83381b85bc2991ba1e002f70a0a7`; historical accepted root-action ledger SHA-256 `75c90e10e1178b30a2579cfa689498b4f3e6a65389883ed615662fadec8edf97`.
- Prior public-board evidence: candidate Active Mimikyu GRI, a single Benched Shadow Rider Calyrex VMAX CRE with no Tool; source Active Iron Thorns ex TWM carrying two Capture Energy, another Iron Thorns ex on Bench; no Stadium, all six Prize cards remaining per player. This **earlier archived** board observation was supplied by Agent37; the new typed observer does not independently produce its full physical-board fingerprint.

A new **read-only, live-Store-only** typed Ability dispatch observer ran on the same historical registered seed and candidate pair using the pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compiled from research head `b59f0e433486b1e85bdb56aadbb1cba4795968d9` (different research head from the older historical run).

[**Successful manual native run 41691269095**](https://github.com/FlareZ123/experiment-01/actions/runs/41691269095), raw [**artifact 13256129629**](https://github.com/FlareZ123/experiment-01/actions/runs/41691269095/artifacts/13256129629), artifact ZIP SHA-256 `9cd988fd9467aa1be067d48ad7f3aab28e9348380c95782add83702c3ef686bb`. Both generated cases `joint-v1-control` and `selected-v2-symmetric-vip` **matched the old original-source physical fingerprint and full accepted native root-action ledger digest exactly** for `6:300:A:champion-reference`; both rejected a genuinely dispatched Ability with `UNKNOWN_POWER`.

## Newly established action identity

The rejected native instance is precisely:

```json
{
  "actionClass": "UseAbilityAction",
  "name": "Underworld Door",
  "target": {"player": 2, "slot": 2, "index": 0},
  "preDispatchTurn": 8,
  "preDispatchPhase": 2,
  "outcome": "store-rejected",
  "rejection": "UNKNOWN_POWER",
  "liveGameIndex": 0
}
```

Native `UseAbilityAction` actually stores the Ability's string in **`action.name`**. Both `action.abilityName` and `action.powerName` were absent, so the observer checked all three documented/observed possibilities and preserved the native own-property names `clientId,name,target,type`. The observer's **ordinal 46 counts all true Store dispatches including setup**, while the historical **ordinal 43 counts gameplay root actions**. Do not confuse these counters.

The other registered candidate in each mode (`6:300:A:new-moon-lockbreaker-v1`) produced no `UNKNOWN_POWER` rejected owner Ability; its historic abort source/action hashes did not match because that candidate followed a different action path, so no attribution was attempted for it.

This resolves Agent37's previously open question **“was the rejected action really Underworld Door?”** with a typed, real native Store instance on both historical policy arms. The native referee's `UNKNOWN_POWER` is consistent with opposing Active Iron Thorns ex's printed Initialization suppressing the non-Future Rule-Box Shadow Rider Calyrex VMAX Ability in the original archived board. Exact physical target parity **still cannot be inferred from the accepted legacy root ledger**, which omits destinations; the current observer captured only the native selected Ability source slot. Distinguish this strong attributable mechanism from a complete causal proof of every lock/card modifier.

## Technical reproduction

- [Typed true-Store witness](../../simulation/twinleaf/agent39-live-unknown-power-action-witness.cjs) wraps `Store.prototype.dispatch` without changing accepted or rejected actions and restores the descriptor on exit. First genuine `AddPlayerAction` binds each new real Store; cloned speculative Stores are never source-certified. The witness supports multiple sequential games, actor-only ability name and public native location fields, and never captures concealed deck/hand card values.
- [Frozen-source reconstruction runner](../../simulation/evaluation/agent39-rank6-original-unknown-power-native.cjs) reads the existing Agent23 source manifest, preserves its exact original seed and two candidate cards, invokes both archived VIP modes on the same two contexts, and **compares rather than assumes** original physical setup and root ledger identity. The run saves a locked/atomic JSON archive and explicitly reports zero competitive games.
- [Observer regression tests](../../tests/agent39-live-unknown-power-action-witness.test.cjs) and [source-mode regression tests](../../tests/agent39-rank6-original-unknown-power-native.test.cjs): **6/6** pass in the pinned native CI. The common source-locked framework suite also passed **111/111**. Existing manual-only `aichi-source-locked-campaign.yml` reuses pinned simulator checkout; no new workflow and no upstream changes.
- An earlier launch [41690769555](https://github.com/FlareZ123/experiment-01/actions/runs/41690769555) failed in the workflow's unrelated default pilot because it lacked the `agent41_crossrank_trial:true` routing flag. The successful diagnostic explicitly supplied both `agent41_crossrank_trial:true` and `trial_ids:'agent39-rank6-original-typed-ability'`, which also ran the older generic Agent41 native screen. That unrelated screen's status is outside this forensic claim.

## Next discriminating experiment

Agent37 already created the conservative [exact-board naked Initialization veto](../../simulation/twinleaf/agent37-naked-initialization-underworld-veto.cjs) with synthetic tests. A next **opt-in**, owner-only **same-source-seed** native comparison can now test whether withholding precisely this root under the authenticated public board avoids the native `UNKNOWN_POWER` without suppressing Underworld Door when opposing Initialization is absent or neutralized. Measure the alternative accepted root, physical setup, full Prize and card-zone custody, and source action differences, retaining the current failure as the control. Do **not** broadly suppress every Rule-Box Ability in all matchups without native/printed lock-effect validation.

This is an actionable native-policy failure diagnosis. It is **not** evidence of a game win, a generally competent owner policy, a fully paper-legal match, or performance of the ultimate unchanged 60-card deck. All four new native developmental cases remain unqualified; the project still lacks three opponent original 60s (ranks 23, 25, 28), has zero competitive-qualified games and no demonstrated 99.5% field win rate.
