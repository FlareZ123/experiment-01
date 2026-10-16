# Apex Dragon: validated copy-effect execution and remaining policy gap

**Agent 12 | 16 October 2026 (UTC research session).** Pinned engine: [Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`](https://github.com/twinleafgg/twinleafgg/tree/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05). All changes are research-owned, under `simulation/twinleaf/`, without modifying the upstream submodule.

## Why test this

Published Aichi rank 10 Regidrago carries Regidrago VSTAR SIT 136, Dragapult ex TWM 130, Hisuian Goodra VSTAR LOR 136 and other Dragon attack payloads. Existing weak-bot [source-deck games](regidrago-policy-diagnostic.md) show **zero uses of Apex Dragon** despite the opponent-facing game result completing. That failure did not establish whether the attack copier was broken or the bot could not construct the required board.

Paper rules in the bundled Advanced Player's Rulebook, II-C-18, explain that using another attack as your attack performs the selected attack's damage and effects and normally ignores the selected attack's own Energy cost. Regidrago VSTAR still needs to satisfy **Apex Dragon's own** Grass, Grass, Fire cost.

## Verified isolated mechanics

Both tests use pinned compiled server modules and controlled `State`, `Player`, `Store`, `AttackEffect`, the real `ChooseAttackPrompt` and `ResolvePromptAction`. Both invoke the *card reducer directly*, deliberately bypassing game setup and attack-cost validation.

| Test | Discard payload | Expected observation | Observed in manual CI |
| --- | --- | --- | --- |
| [Basic copy](../../simulation/twinleaf/apex-copy-contract.cjs) | Dratini OBF, *Tail Snap* | Copy offered and 20 Active damage | **PASS**: 20 |
| [Dual-effect copy](../../simulation/twinleaf/apex-phantom-dive.cjs) | Dragapult ex TWM, *Phantom Dive* | 200 Active damage and six damage counters on a Bench Pokémon | **PASS**: 200 Active and 60 Bench |

The simple case ran in [CI 38822490362](https://github.com/FlareZ123/experiment-01/actions/runs/38822490362). Both cases ran in [CI 38822911113](https://github.com/FlareZ123/experiment-01/actions/runs/38822911113) with all steps green. Tests additionally check that Regidrago VSTAR's printed `Apex Dragon` attack remains unchanged after delegation.

**Inference supported:** These two selected, isolated discard-payload copying paths work at the pinned revision. The completed match failures are therefore not explained by a blanket inability to copy an ordinary damaging Dragon attack. **Unsupported inference:** that the engine correctly implements every Dragon copy interaction, that an attack from a legal real game can be established, or that Regidrago has any measured match strength under skilled play.

## Investigating the generic copied-attack resolver

Pinned `ptcg-server/src/simple-bot/prompt-resolver/choose-attack-prompt-resolver.ts` collects every unblocked attack from eligible Pokémon, sorts by raw printed `damage` descending, and breaks a tie by **larger printed attack-cost length**. It never scores contingent board effects, repeated turns, prize timing, damage-counter placement, prevention, or matchup. This is a deterministic source-level property of `SimpleTacticsAi`, and can directly matter after Apex Dragon becomes selectable.

A focused [policy contract](../../simulation/twinleaf/apex-policy-choice.cjs) compares exact Aichi rank-10 candidate payloads:

- Hisuian Goodra VSTAR's *Rolling Iron*: 200 printed damage, three Energy in printed cost, and an 80-damage reduction effect.
- Dragapult ex's *Phantom Dive*: 200 printed damage, two Energy in printed cost, and six freely allocated Bench damage counters.
- Kyurem SFA's *Trifrost*: zero printed damage but 110 damage to three chosen opposing Pokémon through attack text.

The generic resolver is expected to select **Rolling Iron** from these three, regardless of whether spread damage would take critical extra Prizes. This expectation is grounded in the upstream selection code; its specific execution check was added to [the manual-only workflow](../../.github/workflows/apex-copy-regression.yml). Importantly, Rolling Iron can also be an excellent choice in many states. The lack of board-sensitive choice is the identified problem, not the raw preference in isolation.

An [opt-in proof-of-concept resolver](../../simulation/twinleaf/regidrago-prize-window-resolver.cjs) looks for a 60-damage Bench knockout window, then prefers Phantom Dive if it is an unblocked Apex Dragon copy candidate; [its dedicated contract](../../simulation/twinleaf/regidrago-prize-window-test.cjs) compares it with the upstream selection. The heuristic deliberately excludes Benched Pokémon with printed powers or Tools, but is **not** a generally faithful simulator of damage-counter immunity, other cards' prevention effects, tradeoffs or follow-up turns. It has not been shown to improve actual games and is not integrated into the shared headless evaluator.

## Pinned-game action and Energy validation

A subsequent [normal `AttackAction` check](../../simulation/twinleaf/apex-attack-action.cjs) injects Regidrago VSTAR Active and a Dragon Pokémon in discard with populated Prize zones. One Grass + one Grass attachment alone **fails** the cost check; adding Fire makes the declared Apex Dragon attack legal, and the selected copied Tail Snap deals 20 damage. [Manual CI 38823858094](https://github.com/FlareZ123/experiment-01/actions/runs/38823858094) passed. This is a legal attack-cost action on an established board, not proof that a complete match can establish that board.

[Two Double Dragon Energy and Temple of Sinnoh](../../simulation/twinleaf/apex-double-dragon-temple.cjs) were checked against the same paid attack path: one Double Dragon Energy fails to pay three typed Energy; two allow copying and dealing 20 damage; two under Temple of Sinnoh ASR provide two Colorless and fail the typed payment. [CI 38824490529](https://github.com/FlareZ123/experiment-01/actions/runs/38824490529) passed. This supports the effect component of Agent 13's [experimental Temple Shadow Rider candidate](../aichi-2026/candidate-temple-shadow-rider.md) without showing that its full list improves match outcomes.

## Timeless-GX and synthetic Prize-state correction

[Direct Apex Dragon to Dialga-GX Timeless-GX](../../simulation/twinleaf/apex-timeless-gx.cjs) with normal pinned `Store` prompts correctly deals **150 damage**, sets `usedGX=true`, and arms the extra-turn marker `usedTurnSkip=true`. The corrected [CI 38825272410](https://github.com/FlareZ123/experiment-01/actions/runs/38825272410) passed.

**Important false-failure postmortem:** Three earlier versions failed their final `usedGX` assertion. Those fixtures gave both synthetic players *zero Prize cards*. On prompt resolution, pinned `checkWinner` interpreted both as having taken all Prizes, entered Sudden Death, and `initiateSuddenDeath` reset both players' `usedGX` fields. Instrumentation showed Dialga's copied attack handler had correctly set the marker before the reset. Adding six nonempty Prize slots to each player's state resolved the failure, without changing Twinleaf. This demonstrates how an invalid injected game state can imitate an engine copy-handling defect. The report was shared with Agent 7, whose separate nested Mimikyu Copycat research originally exposed the apparent issue. Their documented *non-GX copied attack eligibility* discrepancy remains separately unresolved.

## Policy investigation and a pending counterexample

[The upstream copied-attack choice contract](../../simulation/twinleaf/apex-policy-choice.cjs) passed in [CI 38823251506](https://github.com/FlareZ123/experiment-01/actions/runs/38823251506): it selects Rolling Iron from a Goodra, Dragapult, Kyurem discard set by printed 200 damage and longer printed cost, ignoring Phantom Dive's six Bench counters.

[The opt-in Bench Prize prompt resolver](../../simulation/twinleaf/regidrago-prize-window-resolver.cjs) selects Phantom Dive over Rolling Iron on a controlled Bench target while leaving the upstream resolver in place otherwise; its [isolated contract](../../simulation/twinleaf/regidrago-prize-window-test.cjs) passed [CI 38823614407](https://github.com/FlareZ123/experiment-01/actions/runs/38823614407). A more demanding [normal-action board comparison](../../simulation/twinleaf/regidrago-prize-window-interaction.cjs) uses active Mimikyu PAL Safeguard and a low-HP Budew Bench target to test actual Prize collection. The first CI attempt failed because the fixture appended Budew as a **sixth** Bench slot and then selected slot zero for its damage counter prompt. A corrected fixture places Budew into the existing first Bench slot. Its current run remains pending validation; neither policy is competitively calibrated.

[Actual rank10 vs rank1 source-bot decision tracing](../../simulation/twinleaf/regidrago-fullgame-diagnostic.cjs) was also initiated as a separate manual-only reproducible workflow, to diagnose zero Apex Dragon usage across real matches.

## Required next proof gates

1. Extend validated paid Apex Dragon from an injected board into organically established real matches, and verify opening/evolution/attachment sequencing.
2. Determine why the full-game `SimpleTacticsAi` failed to evolve, promote, fuel and/or choose Apex Dragon in the actual rank-10 source list. Count failed or dominated action proposals.
3. Compare existing and candidate copied-attack decision policies on identical states and seeds. Include a state where Phantom Dive enables an extra Bench Prize and one where Rolling Iron's protection is more valuable.
4. Complete nested copy-of-copy, prize resolution and restrictive-effect tests, with fully populated Prize zones in injected fixtures. Agent 7's [Mimikyu Copycat audit](mimikyu-apex-copycat-audit.md) already documents another source-level discrepancy affecting the Shadow Rider counter-line.
5. Only then consider per-match game evidence. Neither these isolated passes nor a copied-attack prompt improvement supports a match-win-rate claim.

**Status:** Several isolated effect and paid-attack paths pass; four-game decision traces and the staged Prize policy test are awaiting conclusions. Full-game strategic viability, policy competence, match strength and the 99.5% objective remain unvalidated.

## Follow-up: spent GX selection and actual Prize lifecycle (16 October)

[Agent 12's source-pinned paid Apex Dragon regression](apex-gx-reuse-validation.md) passed [manual CI 38883186841](https://github.com/FlareZ123/experiment-01/actions/runs/38883186841). With available GX allowance, copied Timeless-GX deals 150, consumes GX and arms a bonus turn; when the allowance is spent, it deals zero, grants no extra turn, and an ensuing attack-selection retry can choose Dialga-GX's ordinary Shred for 80. The earlier prize-window interaction test was corrected to finish Wait and Prize prompts before asserting Knock Out: the completed opt-in Phantom Dive line now takes exactly one Budew Prize while the baseline Rolling Iron takes none. Both are injected-board action checks and do not qualify full-game strategy or match strength.
