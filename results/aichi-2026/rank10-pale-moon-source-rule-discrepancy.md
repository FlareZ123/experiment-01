# Aichi rank-10 Pale Moon-GX deferred Knock Out survives an ordinary retreat in raw Twinleaf

**Evidence date:** 17 October 2026. **Original source experiment and opt-in correction: Agent 36. Independent paper-text check and synthesis: Agent 3.** This describes a compiled engine/rules discrepancy in a controlled one-deal counterfactual. It does **not** qualify competitive win-rate evidence or an optimized deck.

## Proven source and rule

- [Passing manual CI 38990149556](https://github.com/FlareZ123/experiment-01/actions/runs/38990149556) ran the pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source study output is [artifact 12084449589](https://github.com/FlareZ123/experiment-01/actions/runs/38990149556/artifacts/12084449589).
- Both original source 60s are fixed: published Aichi rank-1 Shadow Rider, or existing Hood candidate, in physical seat A; rank-10 Regidrago in physical seat B. Fixed seed `3162592764`, opponent actually first. Original and corrected source forks use identical frozen pre-retreat state digest for each comparison, with no injected hand/Bench cards.
- Supplied database printing **Trevenant & Dusknoir-GX SMP SM217** (`cards/en/smp.json`) says `Pale Moon-GX` knocks out the *Defending Pokémon* at the end of the opponent's next turn. The supplied **Advanced Player's Rulebook v3.4 A-03 Retreat**, page 8, explicitly says effects of attacks on an Active Pokémon disappear when it moves to the Bench. Section C-15 and neighboring effects passages likewise describe the Active-to-Bench clearing condition. Ordinary retreat should therefore clear a pending Defending-Pokémon attack effect from this Koraidon.

## What the real source Store did

The root Store captured Regidrago's turn-five **Koraidon ex TEF** with **Double Dragon Energy ROS** and a Benched **Regidrago VSTAR SIT**. A real `RetreatAction` paid the retreat cost, sent Koraidon to the Bench and promoted VSTAR. The raw engine kept its `Player.pendingEndOfTurnEffects` entry:

`knock_out / Koraidon ex TEF / targetLocation: bench / attack: Pale Moon-GX / source: Trevenant & Dusknoir-GX SMP`

The immediately following real `PassTurnAction` triggered that stale entry: Koraidon was discarded from the Bench and a KO was resolved. This is the precise printed attack effect that should have been removed on the Active-to-Bench transition.

Agent 36's reversible research-owned correction `simulation/twinleaf/pending-end-turn-switch-cleanup.cjs` removed **one** pending entry upon the same actual retreat, leaving Koraidon on the Bench after turn end. The [authentic compiled source replay](../../simulation/twinleaf/aichi-rank10-delayed-ko-switch.cjs) recorded that contrast in both candidate arms.

| Frozen physical-A source | Raw post-retreat terminal (Prizes remaining A/B) | Corrected post-retreat terminal | Winner |
| --- | --- | --- | --- |
| Published champion versus rank 10 | **4 / 0** | **2 / 1** | Regidrago in both arms |
| Hood Shield v1 versus rank 10 | **0 / 6** | **0 / 6** | Hood in both arms |

The changed 4/0 to 2/1 Prizes proves a *consequential* downstream engine-path difference in the champion source. Same winner in these two source seeds does not generalize to other starting hands, sequences or matchups.

## Implication for the single-deck benchmark

The raw compiled game engine has a directly demonstrated rule inconsistency in a full-source matchup and must not serve as paper-Expanded ground truth for this interaction. A correction being opt-in and source-verified is an improvement to one tested line, while other delayed effects and Active-to-Bench mechanics remain to be audited. Published candidate evaluations that encounter this queue without the correction cannot be promoted as paper-rules-verified results.

The precise opponent choice to retreat was an **experimental action fork**, not a human-calibrated policy that chose it from alternatives. Full-policy competence, hidden-information fairness, all 32 opponent rosters, independently replicated seeds and every competitive-evidence gate remain **unqualified**. The target 99.5% rate is wholly unverified.

### Reproducers and ownership

- [Full source fork](../../simulation/twinleaf/aichi-rank10-delayed-ko-switch.cjs)
- [Reversible research-side correction](../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs)
- [Source card, score and retirement alternatives](rank10-koraidon-score-horizon.md)
- [Manual compile/test workflow](../../.github/workflows/aichi-attack-pass-score.yml)

All substantive engine results above are Agent 36's. This document makes their passing CI result and the independent printed-rules check visible to evidence consumers.
