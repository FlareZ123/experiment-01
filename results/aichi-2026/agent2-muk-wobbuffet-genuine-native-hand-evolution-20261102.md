# Pinned Twinleaf reproduces the official Wobbuffet → Alolan Muk disable cascade after a real owner hand-evolution action

**Agent 2 | 2 November 2026 | four staged native Store cases, both actor seats; zero natural matches and zero competitive-qualified games.**

## Scientific question

The [official Japanese Pokémon Card Game Q&A](agent2-muk-wobbuffet-official-ruling-20261102.md) gives a precise interaction: opponent's Active Wobbuffet PHF36 already applies *Bide Barricade* and blocks a non-Psychic evolved Pokémon Ability; owner evolves Grimer SUM57 **from hand** into Alolan Muk SUM58 with *Power of Alchemy*. Muk then suppresses Wobbuffet's Basic Ability, so the non-Basic Ability becomes functional. The card text and ruling are direct paper facts. What does the **pinned native Store** do when the player actually announces and pays the evolution action in that position?

The [source driver](../../simulation/twinleaf/agent2-muk-wobbuffet-native-order.cjs) creates a deliberately staged deterministic board with:

- **Opponent:** Wobbuffet PHF Active (main case), or Wobbuffet Benched with a different Active (negative Active-only control).
- **Candidate:** Active Regidrago V, already in-play Bench Grimer, previously evolved Bench Regidrago VSTAR, Bench Latias ex, and physical Alolan Muk in owner's hand.
- Phase `PLAYER_TURN`, global turn 3, proper `pokemonPlayedTurn=1`, full six physical Prize slots on both sides, actual player identity and alternate seat layout.
- **Announced genuine `PlayCardAction`** for owner hand-index 0, Bench 0, which must evolve the actual Grimer, leave Muk as the Stage1 in its physical stack and remove it from owner's hand. No native cards or reducer are patched for this test.

The [assertion test](../../tests/agent2-muk-wobbuffet-official.native.test.cjs) compares `CheckPokemonPowersEffect` and `IS_ABILITY_BLOCKED` on the exact printed Powers **before and after** this real evolution. In the main case, paper requires: Wobbuffet Bide Barricade **unblocked before, blocked after**; Regidrago VSTAR Legacy Star **blocked before, restored after**; Latias ex Skyliner (Basic Psychic) **unblocked before, blocked after**; Muk's own Power of Alchemy remains available. In Bench-Wobbuffet controls, Bide Barricade never actively suppresses the evolved Ability before evolution, while Muk still removes Latias's Basic Ability afterward.

## Actual executed result

A focused [manual GitHub Actions run 41538584932](https://github.com/FlareZ123/experiment-01/actions/runs/41538584932) **passed** at research head `20f807e3545284ed1287ff66e79f658ae5461b3e`, with upstream Twinleaf pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The job checked out the pinned Git submodule, installed the pinned server dependencies, compiled the server, executed the four-case raw reporter, and ran the strict Node assertions. Each step completed successfully. The full native output is preserved as [Actions artifact 13184444775](https://github.com/FlareZ123/experiment-01/actions/runs/41538584932/artifacts/13184444775), `agent2-muk-wobbuffet-pinned-native-staged`.

| Board condition | Candidate physical seat | Actual evolution action | Paper-valid native predicates | Status |
| --- | --- | --- | --- | --- |
| Opponent Wobbuffet already Active | 0 | Accepted from hand | All Wobbuffet / VSTAR / Latias / Muk checks | **PASS** |
| Opponent Wobbuffet Benched | 0 | Accepted from hand | Active-only control for VSTAR / Latias / Muk | **PASS** |
| Opponent Wobbuffet already Active | 1 | Accepted from hand | All Wobbuffet / VSTAR / Latias / Muk checks | **PASS** |
| Opponent Wobbuffet Benched | 1 | Accepted from hand | Active-only control for VSTAR / Latias / Muk | **PASS** |

No custom paper-hook was necessary for the observed pinned interactions. This removes a potentially consequential simulation paper-fidelity uncertainty: **an already-active opposing Wobbuffet does not permanently shield its own Basic Ability from an Alolan Muk that evolves afterward**. It also validates that a previously blocked *Stage VSTAR* Ability becomes usable in this specified state, while the candidate's own Basic Latias Ability becomes blocked after establishing Muk. These are discrete and opposing strategic consequences, which a simple static "lock good" valuation would miss.

## Qualification and what remains missing

This is a controlled **staged midgame state**, despite the real hand evolution. No opening seven was dealt, no Grimer was searched or Benched naturally, no Boost Shake was played, no opponent attack or Prize turn followed, and neither player followed a competitive decision policy. It does not observe when Wobbuffet was promoted, Item-lock counterplay, opponent gust, Tool removal, a real source 60, actual Pokémon damage, or a 25-minute official match clock. The two cards' *Ability conditions* were successfully checked, but no subsequent Legacy Star usage was required by this particular regression.

In particular, a matched natural test against the authentic **rank7 Snorlax Stall 60** (three Wobbuffet PHF, two Snorlax PGO, three Mimikyu PAL) still requires a legal K0 opening, owned held-Card/Prize custody, real held/evolved Muk, owner and opponent turn decisions, and a full source-attested settlement. The benchmark still has **29/32 authenticated original 60s and 0 qualified games**. Our candidate [Apex Alchemy v0](agent43-apex-alchemy-structural-candidate-20261102.md) and [Shake4/Quick2](agent2-apex-alchemy-shake4-quick2-falsification-20261102.md) remain research candidates, **not demonstrated winners**. Nothing about this one paper interaction yields a game-winning probability.
