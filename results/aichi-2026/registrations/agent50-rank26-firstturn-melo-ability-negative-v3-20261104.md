# Agent50 v3 registration: first-turn Tool attack must require Meloetta's permission

**4 November 2026, preregistered before modifying tests or running the next native fixture.** Existing [strict v2 CI 41763310934](https://github.com/FlareZ123/experiment-01/actions/runs/41763310934) passed twice and certified staged 2-Prize KO and source winner. **No qualified games.**

## Mechanistic question

The original card database gives Meloetta ex BLK44's Debut Performance: “If you go first, this Pokémon can use attacks during your first turn.” The pinned native card uses label `Live Debut`, with `reduceEffect` setting `effect.attack.canUseOnFirstTurn=true` in `UseAttackEffect` only if Meloetta is physically Active, the effect is not Ability blocked, and global turn is 1. The pinned `useAttack` reducer checks this flag to prohibit ordinary first-turn attacks. The positive stage alone cannot prove this permission is correctly scoped to Meloetta.

## Immutable controls

Use the same already published constructed initial state and exact rank26 source printings (Meloetta, Squawkabilly, original Lightning MEE, DCE SUM, TM: Crisis Punch PAF), with the same artificial opponent one Prize, opponent lone 210HP Shadow Rider Active, first global turn, paper attackFirstTurn disabled. No full authentic deal or five prior KOs. All negative cases must attach DCE with actual `PlayCardAction`.

- **N1:** Squawkabilly ex Active (Meloetta on Bench), valid Lightning + DCE + TM and opponent exactly 1 Prize. A firstturn Crisis Punch must be rejected `CANNOT_ATTACK_ON_FIRST_TURN`, and source Prizes and opponent board must remain untouched. Both physical seats.
- **P:** Meloetta ex Active, otherwise same scene. Reuse strict v2 positive assertions for exact two source Prizes, opponent physical KO into discard, no active/bench Pokémon, native FINISHED and correct winner. Both physical seats.
- **N2:** Repeat the Squawk control **after** the P cases in the same Node process to detect `canUseOnFirstTurn` flag persistence across card instances or selections. The control must again reject the attack on both seats, with no Prize/board change.
- **Diagnostic:** print native Tool attack's `canUseOnFirstTurn` flag immediately before every negative action and after catching it. If first-turn control unexpectedly succeeds, **mark native rule fidelity failed**, preserve logs and investigate whether attack permission leaked across instantiations or baseline rules incorrectly permit firstturn attack. If a proposal is rejected but mutates authoritatively visible card zones, separately report that effect.
- **Logging erratum:** change the preexisting `opponentLostAllPokemon` diagnostic from `![x.opponent.active.getPokemonCard()]` (an always-false negation of an array) to `!x.opponent.active.getPokemonCard()`. This is log-only and does not alter positive Store behavior.

Run once using the existing manual workflow `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml` on main after commit. Record head SHA, run ID, all negative and positive test status, and explicit limitations. Preserve failures; do not repeatedly alter controls until green without a new explanation. Zero natural source attacks/wins qualify in every outcome.
