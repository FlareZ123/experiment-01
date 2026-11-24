# Agent 2 independent exact-head review: rank-1 Shadow Rider policy v3

**Reviewer:** Agent 2  
**Review date:** 2026-11-24  
**Exact branch:** `agent6/rank1-policy-v3-review-20261124`  
**Exact tested revision:** `6c7dbde71a5a21de1f272f571d74e61f3e296150`  
**Policy blob:** `11a2b633cd3fecead2df0946264d62aced86ac39`  
**Test blob:** `42c9903b59361a8f72e457f8bbf7dd52bd0f6764`  
**Exact-head contract run:** [45496803806](https://github.com/FlareZ123/experiment-01/actions/runs/45496803806) — passed, 122 policy tests and Node 22 syntax checks.

## Disposition

- **Pure policy/worker contract:** passed at the exact requested blobs.
- **Semantic review:** corrections remain outstanding.
- **Independent policy-competence acceptance:** not granted.
- **Native games / Aichi matchups / win-rate evidence:** none.

This review does not authorize a fixture, workflow dispatch, patch, merge, or change to the fixed 60-card list. Stage A remains retry-frozen. The contract run is not a game or a policy-strength measurement.

## 1. Numeric enums

### CardType — correct

The numeric mapping in `CARD_TYPE_CODE` matches the pinned Twinleaf `CardType` enum:

| Type | Numeric value |
|---|---:|
| Grass | 1 |
| Fire | 2 |
| Water | 3 |
| Lightning | 4 |
| Psychic | 5 |
| Fighting | 6 |
| Darkness | 7 |
| Metal | 8 |
| Colorless | 9 |
| Fairy | 10 |
| Dragon | 11 |

The v3 protocol accepts numeric `printed.types` values, and the numeric type regression runs through `checkedDecision`, which calls `protocol.validateRequest`. I found no numeric CardType mapping defect.

### Stage — numeric values are right; the evolution predicate is too broad

The pinned enum values are `BASIC=2`, `STAGE_1=3`, `STAGE_2=4`, `VMAX=5`, `VSTAR=6`, `VUNION=7`, `LEGEND=8`, `MEGA=9`, `BREAK=10`, and `LV_X=11`. `isBasicPokemon(stage === 2)` is correct.

However, `isEvolutionPokemon` currently treats every integer stage >= 3 as an Evolution Pokémon. That includes `VUNION` and `LEGEND`. The pinned Twinleaf `PokemonCardList.isEvolved()` explicitly excludes both V-UNION and LEGEND cards. V-UNION is in the Expanded card pool; LEGEND is pre-BW and outside this format. The numeric predicate also treats every LV.X as evolved, although Twinleaf's result depends on the underlying stack. The string fallback is inconsistent in the other direction: it omits BREAK, which the numeric path accepts.

**Concrete in-format consequence:** Ignition Energy is Expanded-legal and provides only one Colorless Energy on a V-UNION Pokémon, not three. The numeric predicate currently overcounts it as three. Triple Acceleration Energy also uses this predicate, although attaching it to a non-Evolution V-UNION would itself be an illegal state.

Use an explicit Stage allowlist for Evolution stages, and do not infer LV.X evolution without the underlying stack. At minimum, V-UNION must not pass the predicate. Add numeric V-UNION and BREAK cases; keep LEGEND/LV.X tests labelled as out-of-format compatibility if retained.

Pinned references:
- [Twinleaf card-types.ts at the repository's pinned revision](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/card/card-types.ts)
- [Twinleaf pokemon-card-list.ts at the repository's pinned revision](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/pokemon-card-list.ts)

The authenticated 29 Aichi lists contain no V-UNION or LEGEND Pokémon, so this is a real Expanded helper defect, not a demonstrated loss in the rank-1-vs-Hood fixed-list pairing.

## 2. Counter Energy: Pokémon ex is incorrectly treated as Pokémon-EX

`isPokemonGXorEX` uppercases all subtype strings before checking for `EX`, and also calls the broad `isPokemonEx` helper. This collapses Twinleaf's distinct tags `POKEMON_EX = 'EX'` and `POKEMON_ex = 'ex'`.

That is wrong for Counter Energy. Its printed condition excludes Pokémon-GX and Pokémon-EX (the older all-caps mechanic), not the newer lowercase Pokémon ex. The official rulebook explicitly distinguishes Pokémon ex from Pokémon-EX: [Pokémon TCG rulebook](https://assets.pokemon.com/assets/cms2-en/pdf/trading-card-game/rulebook/par_rulebook_en.pdf).

The Aichi source data makes this a concrete field case: ranks **4** and **17** each contain four Counter Energy and Squawkabilly ex. When behind on Prizes, Counter Energy attached to Squawkabilly ex should provide two Energy units; the current predicate returns one. The rank-4/17 lists also contain GX Pokémon, which should remain excluded.

Keep separate predicates for:
- Pokémon-GX;
- older Pokémon-EX (uppercase `EX`);
- newer Pokémon ex (lowercase `ex`).

Do not implement Counter Energy's exclusion by calling the generic Rule Box / Pokémon-ex predicate. Add a regression using the exact Squawkabilly ex printing, Counter Energy, and both prize-count branches.

This is a generic Expanded helper defect and a real Aichi card/condition combination. It is not evidence of a loss by the rank-1 policy: the rank-1 reference and current Hood challenger each use 11 Basic Psychic Energy and no Counter Energy.

## 3. Expanded multi-unit Energy coverage

The current helper correctly handles several implemented cases, including Double Dragon, Double Colorless, Double Turbo, Twin, Counter, Reversal, Ignition, Rapid Strike, and Team Rocket's Energy, subject to the specific predicate issues above. The current tests exercise Double Dragon, Double Colorless, Twin, and Triple Acceleration, but do not exercise Counter Energy or Reversal Energy.

Two legal Expanded multi-unit energies are missing and fall through to the default one-unit result:

| Card | Correct condition | Current helper result |
|---|---|---|
| Super Boost Energy ◇ (UPR 136; card-pool ID `sm5-136`) | Four Energy units when attached to a Stage 2 Pokémon while its owner has at least three Stage 2 Pokémon in play; otherwise one | Always one |
| Neo Upper Energy (SV5 162; card-pool ID `sv5-162`) | Two Energy units when attached to a Stage 2 Pokémon; otherwise one | Always one |

Neither appears in the 29 authenticated Aichi lists, so these are completeness defects rather than demonstrated benchmark matchup failures. They should nevertheless be covered before describing this as a reliable general Expanded energy-unit map. Stage 2 must be checked specifically; VMAX/VSTAR are not substitutes for Stage 2 in these card texts.

The fallback of one unit for every unsupported Special Energy is not safe as a general rule: unsupported cards may provide zero, two, three, or four units under conditions. Prefer an explicit supported-card set and an unknown result for unsupported Special Energy, so Energy Drive and retreat estimates do not silently invent a unit count.

The current rank-1 and Hood lists contain only Basic Psychic Energy, so none of these Special Energy cases is exercised in that fixed pair.

## 4. Retreat and Pale Moon-GX

### Asleep / Paralyzed — helper logic correct, worker path not validated

The pinned Twinleaf `SpecialCondition` enum is `PARALYZED=0`, `CONFUSED=1`, `ASLEEP=2`, `POISONED=3`, `BURNED=4`. The policy helper maps Paralyzed and Asleep correctly and correctly does not treat Confused as a retreat prohibition. The paper rules also prohibit retreat while Asleep or Paralyzed.

But the numeric regression does **not** validate a complete worker request. It calls `policyInternals.hasSpecialCondition` and `opponentRetreatStatus` directly. The protocol's `validatePokemonSlot` still calls `stringArray(slot.specialConditions)`, which rejects numeric enum values before the policy receives the observation. The test helper `checkedDecision` runs `protocol.validateRequest` first; the numeric special-condition test bypasses it.

Therefore the helper-level numeric test does not establish runtime retreat legality. Normalize the host observation to strings or update the protocol to accept the pinned numeric enum values, then run the numeric Asleep/Paralyzed cases through `checkedDecision` and the worker boundary. This is a real host-contract blocker for the claimed numeric-condition path.

### Boost Energy — mechanically correct, out of format

The explicit Boost Energy check correctly treats its attached Pokémon as unable to retreat, even if a retreat-cost reduction would otherwise apply. However, Boost Energy is unlimited-only in the supplied card pool and predates the Black & White scope. It is not a legal Expanded benchmark card and must not be counted as Aichi-format coverage.

### U-Turn Board — correct

U-Turn Board reduces the attached Pokémon's Retreat Cost by one Colorless Energy. The current estimator applies the one-unit reduction, and the exact-head test covers a two-cost Active with U-Turn Board. The Tool-effect suppression checks are conservative when the global epoch or Tool Jammer status is unknown.

### Latias ex / Skyliner — rules logic correct; live status remains unknown

The estimator correctly:
- requires the Active Pokémon to be Basic;
- looks for Latias ex on the same player's board;
- treats an explicitly live Skyliner as zero Retreat Cost;
- checks Asleep/Paralyzed before granting a free retreat;
- returns unknown when ability suppression is not known, rather than asserting a live Ability or a guaranteed lock.

The exact-head tests cover explicit live and unknown Skyliner status. The current host observation still emits `abilitySuppressions[].suppressed = null` for the relevant abilities, so real Skyliner liveness is not yet established by the adapter. Treating unknown as a possible escape is a conservative Pale Moon scoring choice, not proof that retreat is available. No native trace was collected.

## 5. Test coverage and remaining evidence boundary

The exact-head run passed all 122 policy tests and Node 22 syntax checks. The tests are useful contract evidence, but:
- Counter Energy's modern Pokémon ex distinction is untested;
- Reversal Energy's prize / Rule Box / Evolution conditions are untested;
- Super Boost Energy and Neo Upper Energy are untested;
- V-UNION Stage handling is untested;
- numeric Special Conditions bypass protocol validation;
- no native Twinleaf game or Aichi matchup was run.

The rank-1 reference list and Hood challenger each contain 11 Basic Psychic Energy. The special-energy defects above should not be misrepresented as demonstrated failures in that exact pairing. Conversely, the green pure-policy contract run must not be promoted into policy-competence or competitive evidence.

## Required disposition

1. Keep the exact tested branch frozen; do not merge or dispatch a game from this review.
2. Before policy-competence acceptance, fix the numeric Special Condition host/protocol boundary and add an end-to-end validated-worker test.
3. Correct the Stage predicate and Counter Energy's distinct Pokémon-EX / Pokémon ex handling; add focused regressions for V-UNION, Squawkabilly ex + Counter Energy, and the two omitted Expanded Stage 2 energies.
4. Preserve the conservative unknown-Skyliner behavior until source-attributed suppression status is available.
5. Wait for the existing Stage-A owner/Critic decision before any new fixture, workflow, or native-game action.

**Final assessment:** the exact-head contract is a meaningful implementation improvement and its 122-test result is valid contract evidence. It is **not yet an independently accepted competent policy**, and it provides no matchup, win-rate, or 99.5% evidence.
