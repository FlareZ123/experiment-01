# Rank-11 hidden-hand partition reverses the pinned attack choice

**Agent 10, 19 October 2026. Evidence: compiled pinned Twinleaf, artificial full-inventory board, not a competitive game.**

## Tested decision

The existing [Poltergeist full-source-60 fixture](../../simulation/twinleaf/rank11-hidden-opponent-hand-poltergeist.cjs) preserves Wataru Yano's published rank-11 Mega Absol/Garbodor **exact 60** while exchanging four unrevealed Darkness Energy for four unrevealed Battle VIP Pass between the opponent hand and deck. Both alternatives have the same visible Pokémon, damage, hand/deck/Prize counts, and the attacking player's own observations.

This follow-up uses a Gengar & Mimikyu-GX as the attacking Active Pokémon with two attached Psychic Energy, plus an artificial owner inventory of one Basic Gengar and 59 Basic Psychic Energy (all 60 cards accounted for across play, deck and Prizes). The purpose is to remove the artificially short owner's-deck effect from the original diagnostic, **not** to model a competitive attacking deck. An unused GX allowance makes both printed attacks candidate actions. Source opponent Active damage is varied identically in each hidden pair from 0 to 200.

[Script](../../simulation/twinleaf/rank11-hidden-hand-action-choice.cjs) | [Regression](../../tests/rank11-hidden-hand-action-choice.test.cjs) | Manual-only CI `rank11-hidden-opponent-hand.yml`.

## Compiled findings

- [First compiled run 39243820009](https://github.com/FlareZ123/experiment-01/actions/runs/39243820009): original 21-card partial attacker fixture, 12 actor-observation-matched hidden pairs, **zero changed attack choices**. In all pairs the bot selected Poltergeist. It reproduces the existing prospective Poltergeist score leak but shows how a strong score leak can fail to alter a chosen action.
- [Full-inventory compiled run 39244263019](https://github.com/FlareZ123/experiment-01/actions/runs/39244263019): pinned vendor commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, **12/12 regression control states passed and 6/12 action pairs reversed**. At all six damage levels with GX still available, the Energy-hand state selected **Horror House-GX** and the Trainer-hand state selected **Poltergeist**. At all six levels with GX already spent, both selected Poltergeist.

The owner has identical legal information in each paired decision. The selected action therefore depends on an unrevealed opponent-hand/deck partition in the pinned default tactic. The [pinned AttackTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attack-tactic.ts) uses full-State hypothetical scoring, and the [printed Gengar reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx.ts) reads the opponent's hidden Trainer count when resolving Poltergeist. This is a **policy information leak that actually changes the chosen attack**, beyond the prior 83-versus-407 score-only result.

## Boundaries and response

These 12 deliberately selected comparisons are **neither independent games nor frequency samples**. The modified hidden zones include the opponent's unseen deck as well as hand; separate deck-order attribution has not been established. The artificial single-Gengar Energy deck is a decision probe, not a proposed fixed competitor. The diagnostic tests *native printed* attacks and does not verify Mewtwo & Mew-GX delegated Perfection, source-dealt root exposure, paper timing, real opponent competence or completed match outcomes.

Action-value policies used to judge decklists must not read exact opponent hidden partitions. Opt-in observer-constrained hidden-pool sampling exists in [opponent-hidden-pool-attack-sampling](../../simulation/twinleaf/opponent-hidden-pool-attack-sampling.cjs); it requires independently justified knowledge of the source multiset and visible information before its output can be interpreted as a policy. It has not qualified the shared bilateral-v2 competitive pilot.

**Field state:** 29/32 exact registered source 60s, zero competitively qualified games; the 99.5% target is not proven.
