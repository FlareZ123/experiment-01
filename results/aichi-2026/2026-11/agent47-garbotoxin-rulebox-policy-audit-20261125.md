# Garbotoxin Rule Box exclusion: Aichi field relevance and candidate-policy defect

**Agent47 · 25 November 2026**  
**Status:** source-confirmed candidate-policy defect; scope approval pending  
**Decision affected:** PR #69 implementation gate and Hood Shield policy competence

## Finding

The candidate policy's `all-tool-attached` ability-lock scope currently excludes Rule Box targets. This is incorrect for Garbotoxin and directly affects the nominated Hood Shield Shadow Rider v1 candidate, which contains one Radiant Eternatus with the Climactic Gate Ability.

At PR #69 head `f6ae93eb1858709e9040911cdec814bf6c0c5a83`, `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` implements:

```js
case 'all-tool-attached':
  return !isRuleBoxPokemon(holder);
```

The source collector already requires Garbodor to have a Tool and includes Active and Benched sources. The same-Ability exception handling already preserves Garbotoxin's self-exemption; the target-side Stealthy Hood logic is separate. The Rule Box exclusion is therefore the wrong part of the predicate.

## Why the expected test result is correct

The failing test `tests/2026-11/agent46-candidate-policy.test.cjs` lines 2893–2940 uses opponent-Bench Garbodor XY9 57 with Float Stone and expects Climactic Gate to be unavailable; the no-Tool control expects it to be available.

At pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- Garbodor BKP 57's `Garbotoxin` suppresses Abilities of each Pokémon in play when Garbodor has a Tool. Its reducer scans both players' Pokémon, not just the Active Spot.
- Garbodor LTR 68 inherits the same Garbodor implementation.
- Radiant Eternatus CRZ 105 defines `Climactic Gate` as `PowerType.ABILITY`.
- The supplied advanced manual's D-18 defines Rule Box membership; it does not make Rule Box Pokémon immune to Ability suppression.
- The pinned `CAN_APPLY_ABILITY_TO_TARGET` path has no Rule Box exemption.

Thus the existing `no` / `yes` expectations are correct. The observed `yes` is a worker defect. Changing the expected value to `yes` would conceal it.

## Relevance to the Aichi field

The nominated candidate, [Hood Shield Shadow Rider v1](../candidate-hood-shadow-rider.md), contains one Radiant Eternatus.

Four of the 29 available Aichi opponent inventories contain Garbodor and multiple Float Stones:

| Rank | Archetype | Garbodor | Float Stone |
|---:|---|---:|---:|
| 8 | Absol Garbodor | 2 (LTR 68) | 4 |
| 11 | Absol Garbodor | 2 (BKP 57) | 3 |
| 16 | Absol Garbodor | 3 (LTR 68 and BKP 57) | 4 |
| 22 | Absol Garbodor | 2 (BKP 57) | 4 |

These list counts establish a plausible Garbotoxin line in **4/29 available opponents**, not that Garbotoxin is live in every game. Which Garbodor receives a Tool, when it enters play, and whether the Tool/Ability is subsequently suppressed or removed are game-state questions not measured here.

When Garbodor has a Tool and Radiant Eternatus lacks an effective Stealthy Hood, the policy's current Rule Box exclusion can overestimate Climactic Gate availability against four published opponents. The candidate's two Stealthy Hood copies are a possible counterline, but their draw, attachment, and competing protection targets are not guaranteed. This is not merely a synthetic test edge case.

## Minimal correction

For the `all-tool-attached` scope, allow every otherwise-applicable Pokémon target, including Rule Box holders. Keep the existing source Tool requirement, same-Ability Garbotoxin exemption, and Stealthy Hood handling. Keep the existing regression expectations:

- Tool-equipped Benched Garbodor → Climactic Gate unavailable (`no`).
- Same Garbodor without a Tool → Climactic Gate available (`yes`).

The independent Fairy Zone test issue is separate: its 280-HP Regidrago already has 120 damage, while five-Energy Max Geist deals 160, so the Hood distinction is not observable. Reducing prior damage to 100 makes that test discriminating; it does not change the Garbotoxin conclusion.

## Evidence and limitations

- Candidate: `results/aichi-2026/candidate-hood-shadow-rider.md`.
- Opponent lists: `results/aichi-2026/full-decklists.json` (29 available lists; ranks 23, 25, 28 remain missing).
- Candidate policy: `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`.
- Regression: `tests/2026-11/agent46-candidate-policy.test.cjs`.
- Garbodor BKP 57: `ptcg-server/src/sets/07-x-and-y/set-breakpoint/garbodor.ts`.
- Garbodor LTR 68: `ptcg-server/src/sets/06-black-and-white/set-legendary-treasures/other-prints.ts` (inherits the DRX Garbodor implementation).
- Radiant Eternatus: `ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts`.
- Ability-target semantics: `ptcg-server/src/game/store/prefabs/effect-of-ability-prefabs.ts`.

This is a high-confidence source/card-text and policy-predicate defect. The 4/29 list inventory establishes matchup relevance, not actual live-lock frequency or match outcomes. No games, fixture dispatch, deck changes, or win-rate claims are included. Agent46 independently confirmed the root cause and corrected its earlier scope request; a follow-on patch and contract run still require explicit Critic/owner authorization.
