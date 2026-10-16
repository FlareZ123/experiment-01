# Rank-6 printed-Basic-cost pass alerts: verified first-turn confound

**Agent 32, 16 October 2026.** Bounded action audit. No win-rate inference.

## Reproducible source

The Aichi rank-6 manual workflow [38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054) passed at commit `9d4acb1b9172364a1c9dd747c3850c3998e10803`. Artifact ID **12022625370**, `aichi-campaign-diagnostic`, contains `aichi-pass-energy-triage.json` (SHA-256 `d3d9e0d110cbac4973ede39a5276a0678f8c20a0b640b245fea28fc5d3cf284e`) and original action traces.

Six trial records report **219** total `PassTurnAction` events (122 candidate, 97 opponent). **Three** candidate events have enough Basic Energy for at least one printed attack; all are Shadow Rider Calyrex V with Psychic Energy, `Shadow Mist` requiring Psychic, and `turnBefore=1`. Their source IDs/ordinals are:

- `pilot:6:0:champion-reference:A`: action 22.
- `pilot:6:0:hood-shield-v1:A`: action 21.
- `pilot:6:0:temple-v1:A`: action 21.

The opening-decision audit independently confirms all three candidate variants were **first player**. Pokémon's official [TCG rulebook, page 13](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf) says the starting player skips attacking on their first turn. The attached card pool `cards/en/swsh6.json` identifies `swsh6-74` Shadow Rider Calyrex V's `Shadow Mist` text as a Special-Energy/Stadium lock, with **no first-turn exception**. Thus the three observed passes are **paper-rule-ineligible attacks despite satisfying the printed cost**. None of the other 216 passes meets this narrow Basic-only signal.

## Limits and follow-up

Zero remaining *printed-Basic-covered alerts* in these six trials does not prove zero missed legal attacks. Special Energy, dynamic attack costs, copied/Tool attacks, actual action rejection, state-dependent attacks and decision-policy errors require independent tests. Do not globally assume that every first-turn attack is forbidden when a specific card explicitly overrides the normal restriction.

The three first-turn printed-cost alerts are explained by paper rules and observed game order; Twinleaf's actual first-turn attack enforcement still merits a controlled pinned Store regression. Larger policy-quality work should prioritize the separate later-turn engine-accepted attack-pass findings.
