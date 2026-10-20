# Agent 8: authenticated owner-deck K1 changes one rank-24 Supporter plan

**20 October 2026, native pinned Twinleaf regression.** This is a retrospective, selected-seed policy-mechanics experiment. It does not establish an improved match win rate.

## Question and authenticated information boundary

Rank-24 Iron Thorns' source-policy opening sometimes selects `Tag Call -> Guzma & Hala -> Thunder Mountain Prism Star` before the source player has searched their deck. On published seed `2966203069`, the owner then legitimately opens a native `ChooseCardsPrompt` for their **own** deck. The entire remaining deck is visible to that player, and Thunder Mountain is absent. Why does the pre-search plan still spend the one-turn Supporter?

The new optional callback in [the existing owner-deck witness](../../simulation/twinleaf/owner-deck-search-witness.cjs) fires only after an unresolved native deck prompt satisfies `prompt.player===owner` and `prompt.cards===owner.deck`. It supplies that licensed prompt to [owner K1 membership](../../simulation/twinleaf/owner-k1-deck-membership.cjs) and [knowledge-epoch tracking](../../simulation/twinleaf/owner-deck-knowledge-epoch.cjs). The compiled runner checks that an attempt to claim first-search K0 immediately afterward is rejected.

The separate `k1ReplanAfterTagCall:true` option in [the original rank-6/24 source policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) records its specific missing stadium/energy requirement during that authentic owner search. When Tag Call settles, it abandons the **scripted** Guzma & Hala route if the intended requirement is known absent. It delegates the following action to the unchanged generic bot. The option defaults **off**; no original or prior historical run is reinterpreted.

## Reproduced three-control result

[Manually dispatched compiled Actions run 39380679345](https://github.com/FlareZ123/experiment-01/actions/runs/39380679345) **PASS**, research head `7366cb77bbc6708c1f76881d82ba6d8a85abcca7`, engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Archive artifact `12245581904`, ZIP SHA256 `ca5d170761f837574c55a2f403bf6cd53280a5d877166d37c7e25a55c0a12f20`, internal JSON SHA256 `e299ff242e7db8aadb1d0dafc0643c50ec4d25b20d4b6c416e976cf1a7c9b250`.

All three are previously selected exact rank-24 source-versus-rank-1 reference games; source occupies physical seat B, acts on global turn 2, and is verified to start **second**. Unmodified run versus read-only observer gave exactly equal decisions and attack traces on all three. Additional opt-in runs shared source deck hashes and recorded the following:

| Registered seed | First authentic source K1 | Thunder copies | Original planned-line outcome | Opt-in replan outcome |
| --- | --- | ---: | --- | --- |
| `2966203069` | Tag Call, root 15 | 0 | Source policy spends Guzma & Hala then aborts missing planned Stadium at its search | Source policy records absent Thunder and abandons its scripted line **before its own G&H action**; full game decision trace differs |
| `1150814608` | Already-held G&H, root 23 | 0 | Missing Stadium discovered inside G&H search | Identical original game; Tag Call-specific intervention has no opportunity |
| `2804067880` | G&H source search, root 25 | 1 | Successful Thunder search, manual Energy and Volt Cyclone | Identical original game; reachable positive control remains intact |

All three original and opt-in runs remain **unfinished** within the bounded action cap. Native prompts show the K1 count for the exact `Thunder Mountain Prism Star LOT` printing, and the first-search K0 claim was rejected after each authentic opening search.

## Scope, limitations, and implication

The source policy's pre-Tag-Call K0 decision remains blind to real Prizes. Knowledge is introduced only after the actual owner-owned deck prompt. This closes one **scripted stale-plan continuation**, with a strong positive and a structurally inapplicable held-Supporter control.

The fallback generic bot may still choose Guzma & Hala for another reason or repeat a strategically poor decision. No full policy-improvement claim, lock-answer success, game win, clock certification, or cross-matchup superiority follows. The proper next step is a common actor-visible planner that compares realistic post-search actions and opportunity costs, using the same frozen candidate and opponent policy across the bilateral rank-6/rank-11 qualification gate. Agent 41 remains the shared integration owner; do not create another prospective cohort for this isolated result.

**Global status unchanged:** 29/32 exact Aichi Top 32 opposing lists; missing ranks 23, 25, 28; zero competitively qualified games; no evidence of the target 99.5% game-win rate.
