# Candidate Guzma physical target order and Aichi prize-liability correction

**28 November 2026; Agent 3; review-only candidate-policy successor based on draft PR #95.**
Branch: `agent3/guzma-post-switch-prize-repair-20261128`.
Candidate source inventory unchanged; no authorization for native CI, V3 games,
registration, policy release, or a mainline merge.

## Actual tactical defect

- Original Guzma **BUS 115** reads: “Switch 1 of your opponent's Benched Pokémon
  with their Active Pokémon. If you do, switch your Active Pokémon with 1 of
  your Benched Pokémon.” The opponent Bench target is selected first. Yet the
  prior `choosePokemonRecipient` opponent-target path scored attacks from
  **our present Active**, which must normally leave the Active position after
  the opponent's target is selected. This contradicts the already corrected
  root `canGuzmaForAttack` gate that evaluates our future Bench attacker.
- Prior `prizeLiability` incorrectly assigned Regidrago **VSTAR SIT 136** one
  Prize instead of two and **Mega Absol ex MEG 86** two instead of three.
  Both are Aichi-source opponent printings. Modern Mega Evolution ex's
  `['MEGA','ex']` must be distinguished from old **M Rayquaza-EX ROS 76**
  `['MEGA','EX']`, which remains a two-Prize Pokémon-EX.
- Two independent mismatches compound in a Guzma target choice:
  old branch chooses a ten-HP two-Prize Iron Thorns ex TWM 77 because the
  departing Shadow Rider Calyrex V CRE 74 can Shadow Mist for ten;
  it ignores the three-Prize Mega Absol ex MEG 86 at 150 remaining HP,
  which the *actual post-Guzma Benched* Latias ex SSP 76 can knock out with
  a three-Psychic-funded 200-damage Eon Blade.

## Bounded change

1. For **opponent-target Guzma prompts only**, evaluate attack feasibility
   across our existing Benched Pokémon when at least one Bench slot is
   occupied; if no Bench exists, the Active remains the attacker. The
   subsequent **own-Bench Guzma prompt** already scores the actual newly
   promoted attacker against the now-gusted Active; it is unchanged.
2. Correct fixed source-print Prize multipliers: VMAX/V-UNION/TAG TEAM/modern
   Mega Evolution ex = 3; VSTAR/V/GX/ex/EX/older M Pokémon-EX = 2;
   other ordinary Pokémon = 1. Do not classify all `MEGA` subtypes as
   three-Prize. Rank an attack-enabled final-Prize Knock Out as a tactical
   high-priority choice.
3. Preserve the existing strict prompt-token protocol, unknown-card abstention
   behavior, frozen sixty, runner, native engine, and opponent inventories.

## Executed evidence

`tests/2026-11/agent3-guzma-postswitch-source-prizes-20261128.test.cjs`
is a ten-case, both-physical-seat actual worker/protocol test. It covers:
post-switch attacker selection; modern Mega ex three-Prize discrimination;
VSTAR two-Prize discrimination; old M Pokémon-EX two-Prize negative control;
and no-own-Bench active-retention fallback.

Executed directly in the sandbox V8 CommonJS evaluator using the exact GitHub
source strings for the candidate policy and strict policy protocol, not a
mocked replacement of the decision algorithms. **Before change: 2/8 of the
original eight tests passed; after change: 8/8.** After adding the two no-Bench
regressions: **10/10 passing**. Six existing neighboring candidate test suites
(Guzma root, first-attack funding, Copycat/retreat/Labyrinth, Acerola,
colored attack costs, Underworld Door root) were also executed in the same
V8 evaluator, **76/76 passing**. The test harness supplied only a minimal
`node:test` and `node:assert/strict` adapter; it did not execute Node
itself, install Twinleaf, or settle a native prompt.

### Evidence boundary

This is source-printed, current-policy **decision-choice evidence**, not
a same-Store Guzma continuation; damage protection, retaliatory effects,
prior-attack receipt freshness, and the real prompt order remain unverified
inside a compiled pinned Twinleaf Store. No complete game was run; none of
the 32 Aichi matchups is competitively qualified. A future native,
owner-approved integration needs to assert the actual first opponent target
then own Active switch order and a real legal attack under the current
source-printing bridge. PR #95 and the successor remain draft and outside
the frozen V3 fixture. The 99.5% target remains unproven.

### Relevant paths

- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` (modified on successor)
- `tests/2026-11/agent3-guzma-postswitch-source-prizes-20261128.test.cjs`
- Draft PR #95 candidate policy base, and the original
  `tests/2026-11/agent3-candidate-guzma-post-switch-attack.test.cjs` root test.
