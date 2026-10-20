# Agent 50: compiled historical common-policy replay v4

**20 October 2026.** [Manual CI 39367612404](https://github.com/FlareZ123/experiment-01/actions/runs/39367612404) succeeded at head `1a61899d6561b5071f73f6518c78099e5cfca1cd`, 44 synthetic regressions, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Full four-arm artifact 12239792618](https://github.com/FlareZ123/experiment-01/actions/runs/39367612404/artifacts/12239792618). Existing historical Store game controls and all four observational executions have matching root ledgers, source deals and public outcomes. No qualified competition games.

The v4 counterfactual re-applies `withBilateralCommonCandidatePolicy` to a freshly constructed bot *after* the genuine match. Thus the Forest Seal Stone V-recipient safeguard, Field Blower option, and Star Alchemy policy are active in detached comparisons. Replays remain exploratory and subject to a shared wrapper-closure caveat.

| Historical arm | Live action | Fresh with common wrapper | Classification |
| --- | --- | --- | --- |
| Rank 6 / champion reference | Lillie's Determination | Pale Moon-GX | Still baseline mismatch |
| Rank 6 / New Moon | Pass | Pass | Same action, hidden-order score sensitivity |
| Rank 11 / champion reference | Hisuian Heavy Ball | Hisuian Heavy Ball | Same action, no score difference |
| Rank 11 / New Moon | Pass | Pass | Same action, no score difference |

**Critical rank-6 New Moon detail:** one real finite-scored global-turn-3 owner root (9 attempted scorings, 5 finite), with the *same* fresh Pass action in physical and reversed-order worlds. The generic `UseAbilityTactic` for `Farewell Letter`, same target and same card/action signature, returned **50** in physical order versus **51** when the candidate's unseen deck was reversed. Other 8 tactic proposals remain in archive. This directly demonstrates hypothetical **score** dependence on physical own-deck order under the reconstructed common policy. It does not demonstrate an actual action reversal, illegal knowledge use in a certified K0/K1 information set, or any game win.

**Important limitation:** both v4 hypothetical worlds run inside one outer Field Blower policy closure, whose temporary phase/history variables may carry from the first to the second. The target root contains no Field Blower in the observed own hand, but absence alone does not certify no closure influence. The next controlled replay should create a fresh common wrapper for each world, independently seeded, keeping frozen States, policies and real Store controls identical. Champion rank-6 baseline remains unqualified even with all common wrappers; missing historical live bot instance state or another path difference is unresolved. The two rank-11 negatives are only root-specific.

No source-first hard-pressure qualification, 25-minute clock or paper-rule equivalence follows. Field still 29/32 exact lists; **zero competitively qualified games** and no demonstrated 99.5% win rate.

## Resolved raw target identity

The pinned Twinleaf `ptcg-server/src/game/store/actions/play-card-action.ts` defines `PlayerType.BOTTOM_PLAYER = 2` and `SlotType.ACTIVE = 1`. Thus the v3 unwrapped fresh `Forest Seal Stone` target `{player:2,slot:1,index:0}` is **the acting player's own Active**, not an unspecified Bench target. The two genuine sampled own Active Pokémon were `Trevenant & Dusknoir-GX SMP` (champion) and `Latias ex SSP` (New Moon), neither a Pokémon V. The card database's Forest Seal Stone (`swsh12-156`) states its Star Alchemy VSTAR Power is usable by the Pokémon **V** holding it. The hypothetical cloned Store's one-step no-throw attachment therefore consumes the Tool on a non-V holder without enabling Star Alchemy. It is an engine-accepted but strategically futile proposal in the observed roots, validating why the common V-recipient guard matters. This is source-grounded, with no claim of guaranteed next-turn payoff or paper-clock certification.
