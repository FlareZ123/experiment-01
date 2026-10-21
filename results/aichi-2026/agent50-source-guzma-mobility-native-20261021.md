# Native source-owned Guzma pivot after Marnie

**Agent 50, 21 October 2026 UTC. Retrospective same-deal development evidence; zero competitively qualified games.**

## Registered experiment

The published Aichi rank11 Mega Absol/Garbodor source had passed with `Guzma BUS` in hand on a previous, native-authenticated source-first New Moon game. The immediate precursor was a genuine source T7 `Marnie SSH` redraw after New Moon used Escape Rope to force de-tooled Garbodor Active. [Registration](https://github.com/FlareZ123/experiment-01/blob/agent50-sourcefirst-marnie-rescue-20261021/results/aichi-2026/registrations/agent50-source-after-marnie-guzma-pivot-20261021.md) committed before adding the source-only Guzma root.

Frozen source rank11 exact 60, New Moon exact 60, source seat0, candidate seat1, source starting first, seed `482443328`, engine `a9905a76a6c4103ba4bcb9a49e86bad795c5c05`, initial source physical deal SHA256 `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, Marnie-only control full root ledger `cfa5672e609ca7854d63e062424b6140d986c7cd220d804b8f18a785921e96e6`. The new actor-only Guzma proposal, source physical seat0 only, checks held Guzma, both players' visible Benches, Energy invested in the owner's Bench and an otherwise-unpayable Active attack, an unused and unlocked Supporter, and the real native paper quota. Both genuine ChoosePokemon prompts retain their baseline first legal choice. No hidden deck, Prizes or opponent hand is supplied to the decision.

## Exact native result

| Criterion | Marnie-only control | Marnie + source Guzma |
| --- | --- | --- |
| Same initial physical deal and exact source/candidate 60s | Yes | Yes |
| First identical native accepted actions | 65 | 65 |
| Changed source T9 root ordinal65 | PassTurnAction | **PlayCardAction Guzma BUS** |
| Real source switch | Garbodor stays Active | **Oranguru V ASR promoted** |
| Opponent forced Active from Bench | None | **Lunatone** |
| Native root-action count | 153 | 181 |
| Source settled attacks | 0 | 0 |
| Candidate settled attacks | 6 | 9 |
| Remaining source/candidate Prizes | [6,0] | [6,0] |
| Engine winner | Candidate | Candidate |

The Guzma treatment complete native root ledger SHA256 is `b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468`. This verifies the real Store accepted a missed switching route. It did **not** make the source deliver an attack or change the native winner. First-legal prompt choices, earlier Energy allocation and future turn policy remain weak. The source roster's eight Basic Darkness Energy cannot pay Garbodor BKP's mandatory Psychic symbol for `Offensive Bomb` but can support the three-Colorless requirement of Oranguru V's `Psychic`, making Benched Energy placement a separate plausible recovery.

## Evidence and corrected policy bug

- [Corrected paired genuine native CI 39690011411](https://github.com/FlareZ123/experiment-01/actions/runs/39690011411), all nine pure Marnie/Guzma tests and paired native step passed. [Whole ledger artifact 12388656015](https://github.com/FlareZ123/experiment-01/actions/runs/39690011411/artifacts/12388656015), ZIP SHA256 `8225c3c5533402cfd982e5b69752d351e7099498a7d7b6535c24cd9b1a891063`.
- Original abort [39689481909](https://github.com/FlareZ123/experiment-01/actions/runs/39689481909): incorrect actor policy compared `ownTurnResources.supporterPlayedTurn` to global turn; native actually treats it as per-turn 0/1 use count, and the paper guard correctly vetoed a second same-turn Supporter. Fixed both actor decision predicates to `>=1`; the abort is retained as instrumentation failure, excluded from game outcomes.
- The broader smoke workflow later failed independently on a Canceling Cologne sudden-death quota assertion, subsequent to the successful paired games.
- Reproducible source-branch runner [`agent50-sourcefirst-stranded-guzma-native-pair.cjs`](https://github.com/FlareZ123/experiment-01/blob/agent50-sourcefirst-marnie-rescue-20261021/simulation/evaluation/agent50-sourcefirst-stranded-guzma-native-pair.cjs); owner-only pure tests `tests/agent50-stranded-guzma-frontier.test.cjs`; all changes are default-off. A separately [preregistered Guzma-connected Energy staging](https://github.com/FlareZ123/experiment-01/blob/agent50-sourcefirst-marnie-rescue-20261021/results/aichi-2026/registrations/agent50-guzma-energy-route-counterfactual-20261021.md) tests whether future switch access should redirect Basic Darkness to Benched Oranguru before Guzma is played.

This single retrospectively selected game measures source-opponent policy competence only. The full Aichi field has 29/32 exact decklists, zero competitively qualified native games, and no demonstrated 99.5% win rate.
