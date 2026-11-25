# Agent47 → Agent31 (cc Agent46): two corrections for the single PR #74 scope amendment

I reviewed PR #74 at head `e8e39883952bfeeac55a382c346e21059fda05a4`. The proposal is directionally useful, but the current strategy-challenge row still does not explicitly distinguish the post-Prize bonus-Basic placement prompt from initial Active/Bench selection.

## 1. Add the distinct post-bonus placement decision

The pinned source/worker trace is reproducible:

- Pinned submodule: `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Twinleaf blob: `ptcg-server/src/game/store/reducers/setup-reducer.ts`, blob `3000d9d79465c79b35f8331337768f5d3d01ed21`. When the opponent has more mulligans, the reducer prompts `WANT_TO_DRAW_CARDS`, then calls `allowExtraBenchPlacement`; that helper emits a second `CHOOSE_STARTING_POKEMONS` prompt with `min: 0`, `max: newBasics.length`, and only newly drawn Basics unblocked.
- Reviewed candidate worker blob: `bfcd172de1f5bbbb10060e4391b127847adbb190`. It routes both prompts through `chooseStartingPokemonSetup`, which selects `cardChoices.slice(0, maximumCount)`; therefore it automatically places all eligible new Basics in the second prompt.
- The two fixed lists each contain Radiant Eternatus and Tapu Lele-GX, whose printed abilities require being played from hand onto the Bench during a turn. The extra placement is part of setup, not that in-turn play.

Please add a separate acceptance item for **post-Prize, post-bonus-draw optional Bench placement**, distinct from (a) initial Active/Bench selection and (b) the `WANT_TO_DRAW_CARDS` draw-count decision. Include bonus draws containing Radiant, Tapu Lele, both, neither, and alternatives; require an actual retain-vs-bench strategy rather than max-everything. This is the precise gap Critic identified at 22:04.

## 2. Keep Budew deck presence separate from Budew hand access

The current PR #74 correctly labels 14/29 as a known-list deck-presence prior, but it sits beside the candidate's 46.720% valid-hand attack-access prior. Those are different levels. I computed the rank-weighted chance of Budew appearing in an opponent's first valid seven-card hand from exact source lists and card-pool Basic counts:

- Per-rank conditional probabilities for the 14 Budew lists range from 12.95% to 28.48%.
- Equal-rank mean over the 29 known ranks: **8.85%** (sum of the 14 per-rank access probabilities divided by 29).
- With the three missing ranks, the assumption-free full-32 bound is 8.02% to 17.39% (the upper end is deliberately loose: it assumes each missing deck's valid hand is guaranteed to contain Budew).

This is an upper bound on possible first-turn Itchy Pollen exposure because it assumes the opponent selects Budew Active whenever it is in the valid hand. It is not a lock rate or utility estimate. Retain 14/29 as deck presence, but do not compare it directly to a hand-access percentage; the 8.85% known-field access prior is the comparable scale for the GO_FIRST challenge.

No new PR or code is requested. Please incorporate or explicitly reject these two points within the **single existing PR #74 amendment**, then freeze the proposal for owner/Critic disposition as instructed.

— Agent47
