# Agent 9: native rank-24 K0-to-K1 owner-search policy failure

**Date:** 19 October 2026 UTC. **Evidence:** successfully compiled genuine Store replay, with read-only actor-owned deck-search witness, historical source seeds. This is a **decision-policy diagnostic**, not a competitive game, new prospective seed cohort, or deck-win claim.

## Exact reproducible provenance

- Manual-only GitHub Actions [39344467619](https://github.com/FlareZ123/experiment-01/actions/runs/39344467619), **passed**, source `76eda973b2fd549c409c97880fc7930b86391798`.
- Source code: [rank24-k1-search-regression.cjs](../../simulation/twinleaf/rank24-k1-search-regression.cjs), reusing [actor-deck-search-only Store observer](../../simulation/twinleaf/owner-deck-search-witness.cjs) and original [rank6-broad-thorns-policy.cjs](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs).
- Reused manually dispatched [rank24 workflow](../../.github/workflows/aichi-rank24-prospective-policy.yml) with `k1_probe_only=true`, skipping the unrelated 24-seed expensive comparison. No workflow runs on ordinary Git pushes.
- Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; published-field manifest SHA256 `653ed6620d742f1f011d729557265e6173902b5fa87c8b4830f886f7be585173`; source rank-24 60 ordered-ID SHA256 `6c0ac12669bf4fd2efe143fcbddb455c9baee85124516ef946981cc42a65fe73`; rank-1 reference ordered-ID SHA256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Archived artifact **12230690971** `rank24-k1-owner-search-regression`. ZIP SHA256 `adcb0c9efa48d3f37e85cb5a01612aa6a20f0f53f647e013a1882d21ce6ee4cd`; contained `rank24-k1-search-regression.json` SHA256 `d5902778b2e3dca44cc37795af692dffbcf9239749a10badb74de2865ba614bc`.
- Every case ran twice against *the same original field/seed/policy*: without any witness, then with the read-only owner-search witness. Assertions required equality of **complete captured root decision trace**, **attack trace**, game outcome/turn/action/deck hashes and **all policy events**. All three exact equality checks passed.
- Original rank24 24-seed/72-arm cohort provenance and all-seed noninterference replay: [Prize root-cause report](rank24-thunder-prize-abort-audit.md) and [frozen source cohort](rank24-prospective-policy-archive-audit.md).

## Native actor-owned search observations

The witness only reads `p.deck.cards` while a genuine unresolved `ChooseCardsPrompt` has `prompt.player===sourceOwner` and `prompt.cards===sourceOwner.deck`. It never reads owner hidden deck or true Prizes at an ordinary decision root, and never reads opponent private cards. It records the printed identity `Thunder Mountain Prism Star LOT` at the exact time of each licensed search.

| Original frozen seed | Actor's legitimate first deck search | First search sees Thunder | Later search or effect | Policy outcome |
| --- | --- | --- | --- | --- |
| `2966203069` | Tag Call on global turn 2, root ordinal **15**, 46 cards | **0** | Guzma & Hala search root ordinal **21**, 45 cards, also **0** | G&H search abort, no intended attack |
| `1150814608` | Held Guzma & Hala root ordinal **23**, 46 cards | **0** | Additional owner-deck search root 28, 43 cards, still **0** | Same G&H search abort |
| `2804067880` | Held Guzma & Hala root ordinal **25**, 46 cards | **1** | Fetch Thunder, play Stadium, attach Double Colorless Energy | **Volt Cyclone declared** |

All source players actually started **second** in the real game and each draw log was verified. In `2966203069`, the original decisions were `Play Tag Call` → `Tag Call finds Guzma & Hala` → `Tag Call wait` → `Play Guzma & Hala` → `Choose G&H mode` → abort at its search. During the prior Tag Call deck search, the actor was legally entitled to inspect its entire remaining deck (Advanced Player's Rulebook I-H) and determine Thunder Mountain had been Prized. Hence the opponent policy expended the once-per-turn Supporter on a **stale K0 plan even though K1 evidence already existed**. The positive control `2804067880` establishes the same native policy can fetch the available Stadium, attach Energy and announce the attack.

This narrows the earlier report's claim. The native observer proves precisely *when* the owner could learn the missing singleton. It does **not** show that the bot in the original policy retained that information, or that a different Supporter, Item or turn sequence would have won. The two held-G&H cases discover unavailability inside G&H itself, so they are distinct from stale-K1 continuation.

## Next common-policy falsification

A shared actor-information policy needs an explicit knowledge-state update **upon an owner-authenticated deck search**. The pre-search plan should be reconsidered before the next root that would spend the Supporter, comparing legal alternative lines and resource costs. Reuse frozen seed `2966203069` as a native **negative**, and `2804067880` as a native **positive**, preserving the two underlying original 60s and both actors' ability to act. Confirm any intervention through new Store logs, full accepted effects and following opponent decisions. Avoid using the analyst's physical Prize truth to make pre-search decisions.

**Global benchmark status remains 29/32 published exact opposing 60s, zero competitively qualified game wins, and no demonstrated 99.5% fixed deck.**
