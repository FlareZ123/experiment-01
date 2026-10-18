# Rank-10 source root133: simultaneous payload, Supporter and mobility bottlenecks

**Agent 8, 18 October 2026 UTC.** Source-dealt, single-seed mechanical opportunity audit. This is a negative feasibility finding within the existing Regidrago-versus-Shadow-Rider benchmark, not a full-game policy qualification.

## Frozen evidence

- Original published 60s: Aichi rank 1 Shadow Rider (physical engine seat A) and rank 10 Regidrago (seat B). Seed `4246551499`, Regidrago actually first; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Initial source root133, global turn27, had Active `Koraidon ex TEF`, Benched `Regidrago VSTAR SIT` at index 5 with two Grass Energy. The existing controlled fork attaches an actual in-hand `Double Dragon Energy ROS` to that VSTAR and re-enters the genuine source bot.
- Additive read-only fields in [the existing Guzma-pivot witness](../../simulation/twinleaf/dde-root133-guzma-pivot.cjs), with [pure test](../../tests/dde-root133-guzma-pivot.test.cjs), passed full [manual compiled CI 39112798647](https://github.com/FlareZ123/experiment-01/actions/runs/39112798647). The workflow used `targeted_only:true`; head was `f5680368d6e17c5f9dc44e4e9d32a96b046f074a`. Relevant step `Summarize source-root Guzma opportunity and outcome` printed `ROOT133_GUZMA_WINDOW`. Both source-control match projections retained their previously published digests.
- Prior independent [real Apex prompt audit](dde-root133-apex-copy-payload-bottleneck.md) passed compiled [CI 39094999965](https://github.com/FlareZ123/experiment-01/actions/runs/39094999965): the fork's three copied attacks all selected Regidrago V's `Dragon Laser`, the only Dragon attack payload present in discard.

## Actual public board and own hand after the DDE retarget

The observed six-card hand was `Dragapult ex TWM`, `Battle VIP Pass FST`, `Guzma BUS`, `Hisuian Goodra VSTAR LOR`, `Raihan EVS`, `Faba LOT`.

The observed own Bench occupied all eight Sky Field slots: `Dialga-GX UPR`, `Marshadow UNB`, `Dedenne GX UNB`, `Kyurem SFA`, `Budew ASC`, `Regidrago VSTAR SIT`, `Regidrago V SIT`, `Budew ASC`. Active was Koraidon ex. No Latias ex was in play. `supporterTurn=0`, `usedVSTAR=true`, and `pokemonKnockedOutDuringOpponentsLastTurn=false`.

These fields distinguish three otherwise tempting routes:

1. **Legacy Star:** already consumed, so it cannot newly mill cards or recover a search Item from discard in this state.
2. **Raihan:** the knockout precondition was absent on the genuine Store state. Printed Raihan EVS additionally requires an attachable Basic Energy in discard, and the pinned implementation checks its own KO marker; neither of those extra conditions needs resolving when the documented KO prerequisite is false.
3. **Skyliner mobility:** Latias ex SSP was absent, so its Basic-Pokémon no-Retreat-Cost Ability could not provide a free Koraidon-to-VSTAR retreat. A real Guzma pivot was successfully executed in the prior fork, but spent the turn's Supporter channel.

Neither `Quick Ball`, `Mysterious Treasure` nor `Battle Compressor` appeared in the actual six-card hand. Two powerful Dragon payloads were instead *in hand*, not available to Apex Dragon's discard-based copy menu. This is a zone-and-action contention observation; it does not prove that every conceivable longer line was impossible.

## Concrete Prize-conversion threshold

The supplied card pool gives Regidrago V's Dragon Laser 130 Active damage, Dragapult ex's Phantom Dive 200, Hisuian Goodra VSTAR's Rolling Iron 200, and printed Shadow Rider Calyrex VMAX 320 HP. The earlier source observation separately verified Muscle Band's +20 Active damage in this branch.

Two Dragon Lasers therefore accumulate **300**, leaving VMAX **20 HP**; Dragon Laser plus Phantom Dive would nominally reach **370** before other modifiers and game-state changes. Stronger-copy access was thus materially relevant. This arithmetic is a *counterfactual damage threshold*, not a playable alternative in the source state: those Dragon cards were not in discard.

## Consequence and next experiment

The previous DDE-to-Bench plus Guzma branch made three real Apex Dragon attacks, knocked out Marshadow, and then left Shadow Rider VMAX at 300 damage after two hits. It finished a rank-1 engine win with Prize remainder `[0,5]`; the original DDE-to-Active Koraidon control finished another rank-1 engine win at `[0,3]`.

The new state observations **veto** a superficially simple turn27 repair based on fresh Legacy Star, playable Raihan or free Latias retreat. The next high-yield test is an **earlier-source-prefix** intervention that establishes a discard-capable Dragon payload before root133 while preserving the eventual Active switch, or a distinct independently sampled source game where those prerequisites differ. Do not inject a Dragon into discard or add phantom search cards.

**Scope:** real source Store own-hand/public-board observer and compiled source replay; unqualified generic policies, incomplete paper-rule verification, one seed, no independent full-game win-rate inference. Full Aichi exact lists remain 29/32, independently qualified competitive games 0.
