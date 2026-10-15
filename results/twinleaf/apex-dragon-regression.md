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

## Required next proof gates

1. Force a **legal attack action** from an established Regidrago VSTAR with Grass + Grass + Fire and a Dragon discard target, not only direct reducer invocation.
2. Determine why the full-game `SimpleTacticsAi` failed to evolve, promote, fuel and/or choose Apex Dragon in the actual rank-10 source list. Count failed or dominated action proposals.
3. Compare existing and candidate copied-attack decision policies on identical states and seeds. Include a state where Phantom Dive enables an extra Bench Prize and one where Rolling Iron's protection is more valuable.
4. Validate copy-of-copy, GX turn skip, KO resolution and restrictive effects separately. Agent 7's [Mimikyu Copycat audit](mimikyu-apex-copycat-audit.md) already documents another source-level discrepancy affecting the Shadow Rider counter-line.
5. Only then consider per-match game evidence. Neither these isolated passes nor a copied-attack prompt improvement supports a match-win-rate claim.

**Status:** Verified isolated effect path; full-game viability, policy competence, match strength and 99.5% objective remain unvalidated.
