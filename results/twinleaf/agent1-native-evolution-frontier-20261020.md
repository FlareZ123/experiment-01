# Actor-only natural evolution: verified paper-stage frontier

**Agent 1, 20 October 2026 UTC.** Status: **development-only root-policy component**. No competitive game-win evidence.

## Why this matters

The canonical actor-only root planner originally proposed Basic Benching, Basic or opt-in Special Energy attachment, selected printed attacks, and Pass. It could not choose an ordinary hand Evolution card. This is a consequential missing decision for source archetypes. In the 29 published full Aichi Open League 2026 Top 32 lists, **11** carry at least one named VMAX or VSTAR printing: ranks **1, 5, 10, 12, 13, 14, 18, 20, 21, 27, 32**. This is a card-name census, not a matchup score. Three complete opponent lists remain unpublished in the available source manifest.

## Native engine control

A manual workflow compiled the pinned `vendor/twinleaf` revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, initialized its actual card library, constructed two-player turn-three boards with Basic Pokémon already in play since turn one, and dispatched ordinary `PlayCardAction` inputs. It observed three successful hand transfers and face-up evolutions:

| Basic in play | Hand Evolution | Native result |
| --- | --- | --- |
| Shadow Rider Calyrex V CRE | Shadow Rider Calyrex VMAX CRE | accepted; VMAX became Active |
| Regidrago V SIT | Regidrago VSTAR SIT | accepted; VSTAR became Active |
| Trubbish FST | Garbodor BKP | accepted; Stage 1 became Active |

[First native CI evidence](https://github.com/FlareZ123/experiment-01/actions/runs/39514274666), [asserted native fixture](../../simulation/twinleaf/agent1-native-evolution-stage-probe.cjs). A preliminary source reading incorrectly suggested VMAX/VSTAR would be rejected: `const isEvolved = stage === Stage.STAGE_1 || Stage.STAGE_2;` evaluates to a truthy enum constant even for non-Stage-1 values. The compiled native test falsified the supposed VMAX/VSTAR rejection. This source expression may be overly permissive for other stages, which is a separate **unproven** concern. No production hook was added for this imagined failure.

## New actor-only decision

[Conservative chooser](../../simulation/twinleaf/agent1-actor-evolution-frontier.cjs) now supports ordinary from-hand steps:

- Basic or Restored to Stage 1;
- Stage 1 to Stage 2;
- Basic Pokémon V to VMAX or VSTAR, requiring the exact printed predecessor name.

It reads only the owner's visible hand and the public board. The [observation contract](../../simulation/twinleaf/actor-observation-contract.cjs) now exposes `lastPlayedOrEvolvedTurn` for face-up Pokémon. The chooser rejects attempts in the opening turn window, repeated same-turn evolution, unknown chronology, an explicitly blocked target, and public Pokémon/Ability/evolution-play locks. Special card-effect evolution, Rare Candy and TM: Evolution need independent decision routes. The Store remains the final legal-action authority.

The [canonical root adapter](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) offers this chooser **only** with `deps.naturalEvolutionRoot=true` or `AGENT1_NATURAL_EVOLUTION_ROOT_DEV=true`. Default behavior remains unchanged. Native action translation preserves the actual target Active/Bench slot. [Physical witness](../../simulation/twinleaf/agent5-owner-root-slice.cjs) requires an extra face-up Pokémon layer and the intended new top printing before confirming the effect.

The [six regression tests](../../tests/agent1-actor-evolution-frontier.test.cjs) cover printed stage adjacency, VMAX and VSTAR selection, lock/turn exclusions, the default-off contract, an actor-only typed `PlayCardAction`, and the face-up native-shaped Store witness. [Manual CI run 39515475465](https://github.com/FlareZ123/experiment-01/actions/runs/39515475465) passed all six tests and independently reproduced the three actual compiled native Store hand evolutions.

## Current limits and next decision

The integrated wrapper was exercised with a synthetic Store witness, while ordinary evolution mechanics were separately exercised with actual compiled Store actions. A single, complete **source-dealt actual Store match** running this actor-only evolution branch has **not yet** been qualified here. The generic unsupported prompt fallbacks remain, so this does not create a fully actor-only policy or a strategically competent opponent. The pure chooser currently prioritizes an eligible evolution in hand order and prefers an eligible Benched predecessor. Both are simple design choices to measure, not proven optimal lines.

Next: pre-register a bounded source-dealt rank-1 versus rank-10 paired development panel, inspect actual accepted evolution actions on both seats, count unsupported generic fallbacks, and test whether this materially changes board establishment before inferring any performance. Maintain the full opponent manifest, both seats, and evidence categories separately from aspirations about 99.5% wins.
