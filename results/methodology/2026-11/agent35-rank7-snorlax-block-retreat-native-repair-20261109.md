# Two original-rank7 Snorlax Block native aborts eliminated by owner-visible retreat veto

**Agent35, 9 November 2026.** This is an **exposed-seed retrospective bug regression**, not an independent competitive improvement or a new prospective match. Correct native rules behavior is the question.

## Pre-change Store failure on actual 60-card originals

The frozen [first three-architecture CI42602156428](https://github.com/FlareZ123/experiment-01/actions/runs/42602156428), full raw [artifact13667015662](https://github.com/FlareZ123/experiment-01/actions/runs/42602156428/artifacts/13667015662), recorded the following two **actual native Store** failures under original source-rank7A Snorlax Stall:

| Exact registered trial | Old last root | Native error | Face-up state at failing action |
| --- | ---: | --- | --- |
| `7:3501:A:champion-reference` | 181 (turn42) | `RetreatAction BLOCKED_BY_EFFECT` | Unpowered Active Shadow Rider Calyrex VMAX with Float Stone; funded VMAX Bench; opposing Active Snorlax PGO Block |
| `7:3501:A:hood-shield-v1` | 174 (turn34) | `RetreatAction BLOCKED_BY_EFFECT` | Unpowered Active Shadow Rider Calyrex V with Float Stone; funded VMAX Bench; opposing Active Snorlax PGO Block |

[Printed Block, Snorlax Pokémon GO 055](https://limitlesstcg.com/cards/PGO/55) continually forbids the opponent's **voluntary Retreat** while Snorlax is Active. Float Stone can reduce the cost to zero, which does not override an outright prohibition. The actor-only observation contract already exposes `opponentPublic.active.abilityDetails[].text` on face-up Pokémon. Existing float-stone move planners used printed Retreat Cost, Status and Tool-lock, but not this explicit enemy prohibition. Proposed Float Stone attachment could therefore set up an illegal subsequent RetreatAction.

## Concrete implementation

Added `simulation/twinleaf/agent35-opponent-active-retreat-lock.cjs`, a pure owner-public test of printed opponent Active Ability text. It detects explicit active-conditioned prohibition on opponent voluntary retreat. It does not examine private source hand, deck, or Prize data, other positions, or candidate identity. Conservative if the enemy Ability is temporarily suppressed; a specialized active-suppression policy can separately prove its legal exception.

Wired into three common fallback policies to decline both **wasteful preattachment** and **illegal actual retreat**:

* `simulation/twinleaf/agent31-zero-energy-strand-floatstone.cjs`
* `simulation/twinleaf/agent1-owner-float-stone-mobility.cjs`
* `simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs`

These are decisions, not changes to Twinleaf native reducer or card text. Legitimate switch effects, gust, Knock Out, and opponent lock removal remain separate options, because [rulebook sections A-03/C-14](../../../resources/advanced-players-rulebook.md) distinguish retreat from switching. Targeted tests `tests/2026-11/agent35-opponent-active-retreat-lock.test.cjs` plus existing three planner suites and frozen-group comparison tests passed under Node22.

## Actual native retrospective result

[Successful complete compiled native CI42604314403](https://github.com/FlareZ123/experiment-01/actions/runs/42604314403), [full 48-game regression artifact13667272222](https://github.com/FlareZ123/experiment-01/actions/runs/42604314403/artifacts/13667272222), ZIP SHA256 `25858bb84f616c075346c4b2cdc0973bfd5fcbe38713b6d781cb18d95dce9b5f`. Same exact original registrations, candidate fixed sixties, original source rank7, paper profile and engine pin:

| Same exposed original source deal | Before | After public Block guard |
| --- | --- | --- |
| Rank7A champion | `BLOCKED_BY_EFFECT` abort at native root181 | no error; continued to root260 action cap |
| Rank7A Hood | `BLOCKED_BY_EFFECT` abort at native root174 | no error; continued to root260 action cap |
| Overall 48 game count | 3 native aborts | 1 native abort |
| Competitive-paper-qualified games | 0 | 0 |

A third independent Hood rank11A `UNKNOWN_POWER` abort remains. Its native pre-dispatch public board has opposing `Garbodor BKP` with **Forest Seal Stone** Tool physically attached, and candidate attempted a `UseAbilityAction`, strongly implicating the already investigated Garbotoxin/Underworld Door lock window. This is being referred to the existing owner teams; additional proof needed before attribution.

This repair demonstrably eliminates two **known illegal voluntary RetreatAction aborts**. It does not cause a natural terminal, increase a verified win rate, or solve paper-opponent skill. Subsequent prospective source registrations are needed for inference, and the global objective still lacks 3 original decklists and a single 99.5%-supported chosen deck.
