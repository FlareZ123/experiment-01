# Agent 28: autonomous Mimikyu Shred on an actual historical root

**18 October 2026.** [Compiled manual CI 39137751293](https://github.com/FlareZ123/experiment-01/actions/runs/39137751293), head `74dfe08256d06dfa38e6c8760127d86bf70629dc`, completed successfully. Source-game result is **diagnostic, zero independently qualified competitive games**.

## State-dependent policy

New [AutonomousApexShred-v1](../../simulation/twinleaf/mimikyu-autonomous-shred-policy.cjs) evaluates a player-observable board/own-discard/last-declared-attack predicate at live decisions: candidate Active Mimikyu GRI paying Psychic+Colorless, spent GX, discarded Dialga-GX UPR, previous opposing non-GX Apex Dragon from Regidrago VSTAR SIT, and opposing Active Regidrago VSTAR within the 80-damage Shred KO window. A tactic placed before generic Retreat proposes real `AttackAction('Copycat')`; a nested resolver selects printed `Shred` through actual `ChooseAttackPrompt.validate`. The policy contains no hardcoded turn 28 or root dispatch 215. Conservative printed-identity requirements deliberately leave other matchups and wider tactical states untouched.

The archived policy's turn-28-only gate remains intact via a factored predicate. Three new pure tests passed for multiple global turns, required resources, attack history and either acting seat. [Pilot runner](../../simulation/twinleaf/rank10-autonomous-shred-pilot.cjs) and [manual-only workflow](../../.github/workflows/mimikyu-rank10-pair.yml) are reproducible without editing Twinleaf vendor code.

## Compiled authentic-source result

The control and alternate used the unchanged published rank-1 champion Shadow Rider 60 as candidate **physical B**, published rank-10 Regidrago 60 as opponent **physical A**, seed **4246551499**, historical **DoubleDragonAttachTactic-v3-archive**, all identical research hooks and engineered candidate-only turn-27 Mimikyu preparation. Both game paths had exactly matching real Store root actions **0 through 214** and matching source-zone and card-history fingerprints at the true decision. The first actual divergence was root **215**, control `RetreatAction`, autonomous policy `AttackAction('Copycat')` with nested printed `Shred` selection. The pilot asserted a real turn-28 Copycat root announcement.

| Source arm | Engine winner | Prizes remaining (Regidrago / champion) |
| --- | --- | --- |
| Baseline generic bot | Regidrago | 0 / 4 |
| Autonomous Shred policy | Champion | 3 / 0 |

The pre-action zone digest was `5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d`, and Card-history digest `0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548`. These values are reported by the compiled script as a source integrity gate. The resulting source game is the same historical opportunity already proved by a forced action fork; **the new evidence is the bot autonomously selecting the action with a turn-independent public-state predicate**.

## Remaining falsifiers

The source requires an earlier **opt-in turn-27 setup tactic**; its result cannot be credited to wholly unassisted play. It is one predetermined opportunity, one physical order, and one current card opponent. Generic opponent strategic competence, paper rules, full Store reducer/clone replay, hidden-information noninterference, held-out independent deals and the entire 32-list field remain unqualified. The prompt resolver is independent of root ordinal, but opponent policy and this exact state still need expert adversarial review. Neither source arm is a competitive win-rate sample. **29/32 exact sources, zero qualified games, 99.5% unproven.**
