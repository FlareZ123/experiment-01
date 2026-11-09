# Hood Shield versus champion: identified paired-native advantage after censoring

**Agent 21, 9 November 2026.** This is a decision analysis of the archived, prospective, full-29 fixed-60 experiment by Agent 3. It uses all 58 registered source groups and both frozen candidate lists, with no new games, seed selection, list changes, or claims about paper competitiveness.

## Decision result

**The source-matched 55-group Hood-minus-champion native win-count advantage lies in the exact no-assumption envelope [-9, +13].** If expressed per matched group, this is **[-16.36, +23.64] percentage points**. That interval includes substantial possible inferiority and possible superiority. The nine observed winner reversals among 41 matched double-terminal groups favor Hood **6 to 3**, contributing +3 observed wins. They do not establish a fixed-60 ordering when the 14 matched incompletely resolved groups remain unknown.

| Physically paired result | Groups | Contribution to Hood-minus-champion native wins |
| --- | ---: | ---: |
| Both arms true native terminal | 41 | +3 exactly: six Hood-favorable, three champion-favorable, 32 identical winner outcomes |
| Both arms incomplete | 8 | -8 through +8 |
| Champion terminal, Hood incomplete | 5 | -4 through +1 |
| Hood terminal, champion incomplete | 1 | 0 through +1 |
| **Paired total** | **55** | **-9 through +13** |
| Original source deal mismatched | 3 | Excluded entirely |

These are **sharp partial-identification bounds on native game winner indicators**, conditional on the 55 groups with the same original-source physical deal. Each unknown native result is allowed to resolve to either candidate win or source win; every observed valid native terminal is fixed. No independence, missing-at-random, coin-flip, or hypothetical assignment of a capped game as a loss is imposed. The arithmetic cannot establish statistical win-rate confidence or paper-rules correctness. If an incomplete game cannot be finished under the frozen profile, the interval remains only a hypothetical-completion envelope.

The original runner's 58 groups contain three mismatched source deals, **rank 8 seat A, rank 16 seat B, rank 26 seat A**. Their outcomes are unsuitable for same-deal paired causal differences even when an arm has a terminal. The published 31 native wins for each contender are marginal counts over all 58 registered attempts and cannot override this pairing boundary.

## Where uncertainty actually resides

The 14 source-matched unresolved groups are:

| Original rank and candidate seat | Champion native status | Hood native status | Individual Hood-minus-champion interval |
| --- | --- | --- | --- |
| 2 A, 2 B | Cap, cap | Cap, cap | each [-1, +1] |
| 3 B, 8 B, 16 A, 22 B | Cap in each | Cap in each | each [-1, +1] |
| 15 B | Native error | Native error | [-1, +1] |
| 31 B | Cap | Cap | [-1, +1] |
| 9 B, 17 A, 27 B | Champion native win | Hood cap | each [-1, 0] |
| 24 A | Champion native loss | Hood cap | [0, +1] |
| 29 B | Champion cap | Hood native win | [0, +1] |
| 31 A | Champion native win | Hood native error | [-1, 0] |

**Eight two-arm unresolved groups account for 16 of the total 22 interval-width units.** Ranks **2** and **31** alone contribute seven width units. Rank 2, original runner-up Vileplume Control, did not complete either seat under either contender. Rank 31 has one complete champion win paired with Hood's native error plus one two-arm cap. In contrast, the three physically matched, fully completed champion-favorable reversals at ranks **7 B, 11 A and 12 A** remain confirmed developmental native observations. Those unfavorable states merit targeted source-safe tactical inspection before any Hood promotion.

The structurally motivated Hood protection against Iron Thorns has not yet demonstrated an outcome benefit in a physically matched both-terminal reversal. The rank-29 B observed Hood win is paired against an incomplete champion game, so its possible advantage remains [0, +1]. Rank-24 A has a completed champion loss and unfinished Hood arm, and hence also remains [0, +1]. Both are informative test targets without asserting positive win-rate effects.

## Direct next research decisions

1. **Do not select Hood from its 6:3 completed reversal count.** The whole native paired interval straddles zero. Retain Hood as a credible modified-deck hypothesis and the champion as a developmental reference.
2. **Resolve the largest decisive gaps through one common opponent-competent semantic profile:** rank 2 both seats and rank 31 both seats, then the six other double-unresolved groups. Diagnose their first payable source action and native-error category before merely raising root caps. Any fresh horizon or policy must be preregistered.
3. **Treat source-mismatched ranks 8 A, 16 B and 26 A as an input comparison defect.** Reconstruct equivalent original physical deals or use a genuinely paired new registration. Do not impute those rows into the identified interval.
4. **Challenge Hood in the three known champion-favorable reversals** at ranks 7 B, 11 A and 12 A with audited owner-visible choices and retained actor policy. An opponent competency upgrade can change both contenders' outcomes; those development results do not automatically transport to competent paper play.
5. Apply the same interval algorithm to subsequent full-list comparisons; qualify a deck-selection claim only with an opponent-competent, paper-accepted common profile and a censoring-aware paired outcome analysis.

## Frozen evidence and reproducibility

- Original unchanged 60-card lists and all-29 runner: [Agent 3 source report](agent3-hood-vs-shadow-all29-native-20261109.md), [Hood 60](../../aichi-2026/candidate-hood-shadow-rider.md), [champion 60](../../aichi-2026/benchmark-shadow-rider.md).
- [Original native GitHub Actions run 42578010606](https://github.com/FlareZ123/experiment-01/actions/runs/42578010606), artifact ID **13656062292**, artifact name `agent3-hood-vs-shadow-all29-native`, raw JSON `agent3-hood-vs-shadow-all29-native.json`.
- Original uncompressed JSON SHA-256: `3f7df2ca61fc2120a361adfbc1c09d288a4f37e07d5fcc0519f62574b5162f47`. Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Compact 58-group source-locked indicator and seed matrix](agent21-hood-full29-paired-censor-matrix-20261109.tsv), with X marking the three unpaired original source deals.
- [Reusable CJS sharp-bound reducer](../../../scripts/2026-11/agent21-sharp-paired-censor-bounds.cjs) and [five unit/inventory cases](../../../tests/2026-11/agent21-sharp-paired-censor-bounds.test.cjs). The compact matrix reproduces **55 matched, 41 doubly terminal, 8 doubly unresolved, 5 Hood-only unresolved, 1 champion-only unresolved, -9 to +13**. Actual full physical source fingerprints, error traces and raw actions remain in the original artifact; the compact matrix is a reproducible outcome reduction, not independent game-action certification.
- An independent Python calculation over the full original 148 MB JSON found the same 58 rows, 55 physical source matches and all bounds. The Node implementation was added as a regression fixture. Manual repository CI was not required to obtain the original native results and has not been represented as passing here.

**Status:** 29/32 original Aichi opponents have authenticated full 60-card inventories. Three source lists remain missing. Zero games are competitively paper-qualified. No fixed deck has demonstrated 99.5% wins.

## Follow-up: native noncompletion traced to concrete board states

Read-only extraction of the archived original root ledgers reveals the following decision-relevant failures. These observations are native bot/Store diagnostics, with no imputed winners.

- **Rank 31 seat A, Hood arm:** the real Store aborted at source turn 49, root action 253, `AttackAction(Come and Get You)` by the original-source Active **Duskull PRE**, returning `CANNOT_USE_POWER`. Its `preDispatchBoard` has all **five source Bench slots occupied** (three Unown, Chimecho, Koffing), while Duskull holds one Telepathic Psychic Energy. The supplied printing's Come and Get You text is *“Put up to 3 Duskull from your discard pile onto your Bench.”* The supplied Advanced Player’s Rulebook section **C-11** says attacks that place Pokémon onto a full Bench terminate without placing them; the Trainer/Ability rule is different. Thus the engine rejection, the available printed attack, and Bench capacity merit a **native versus paper attack-precondition regression**. A full Bench is a potential cause, not a proven complete explanation for the `CANNOT_USE_POWER` error; examine any other live attack restrictions before writing an engine hook. The champion arm on that same source deal naturally completed with a champion win at root 201; Hood's game remains **unresolved**, not a Hood loss.
- **Rank 31 seat B:** both arms reached 260 roots at **turn 54**, with the original-source player playing **zero Attacks and 26 PassTurn actions** in each arm. Candidate attacks were 26 each. This resembles a long resource/retreat/control cycle, so an arbitrary longer root limit alone cannot establish strategic competence or official-clock winners.
- **Rank 2 seat A:** the champion arm reached 260 roots at turn 63 with seven original-source Attacks and 24 source PassTurn actions. The Hood arm reached the same root cap at turn 61 with **zero source Attacks and 30 source PassTurn actions**. On seat B, both arms capped at turns 62 and 59 with 13 and 11 source Attacks, respectively. These four observations should drive specific source-actor action reviews before any claim that Vileplume is a favorable Hood matchup.
- **Rank 3 seat B:** the Snorlax source registered no Attacks and 33/30 source PassTurn actions in champion/Hood arms, which is consistent with a stall strategy. A naïve attack-count rule would mistake intentional control play for incompetence. Both arms reached 260 roots.

This triage distinguishes an **identified Store abort at a particular printed attack/board state** from **long nonterminating games that require independent clock and control-policy review**. For any native replay of rank 31, preserve the original printed sixty and full physical deal, and keep modifications default-off and out of historical result tables.

## Confirmed pinned-engine defect and native correction

The earlier rank31 Duskull hypothesis has been narrowed to a concrete pinned-source defect. At Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/duskull.ts` implements `Come and Get You` with a mandatory precondition over **`player.hand.cards.some(...name === 'Duskull')`**. The attack prints **“Put up to 3 Duskull from your discard pile onto your Bench.”** In the same reducer, the actual native selection uses `player.discard` and sets `{min:1,max:Math.min(benchSlots,3),allowCancel:false}`. A full Bench produces `max:0`, and zero selections are forbidden even when “up to” permits no placements. `Duskull PRE` inherits this reducer from SFA via `set-prismatic-evolution/alt-arts.ts`.

A scoped, default-off research hook at [Duskull paper attack correction](../../../simulation/twinleaf/2026-11/agent21-duskull-come-and-get-you-paper-hook.cjs) replaces only the inherited printed attack's reducer while the test or experiment runs, restoring the exact original prototype afterward. It checks the owner's **discard**, uses permitted **0 through 3 physical cards** within open Bench capacity, moves selected identities through native `MOVE_CARDS`, and permits an attack with no available destination or target to resolve inertly. The vendor Git submodule is unchanged.

**Native test success:** the five-case test suite [both-seat Duskull Store regression](../../../tests/2026-11/agent21-duskull-come-and-get-you-native.test.cjs) passed in the pinned compiled Store under manual workflow [42583298051](https://github.com/FlareZ123/experiment-01/actions/runs/42583298051). The fixture reproduced original `CANNOT_USE_POWER` for a one-Energy Duskull PRE with five occupied Bench slots and at least one discarded Duskull, observed corrected native success in each seat, verified physical discard-to-Bench movement in each seat with an open slot, and confirmed empty-discard no-op behavior. This verifies the targeted game mechanic only; it certifies **zero competitive matches**.

A posthoc matched original rank31 seed replay with the hook on/off is separately registered as a developmental diagnostic in `simulation/evaluation/2026-11/agent21-rank31-duskull-native-replay.cjs`. It must retain the original deal fingerprint, actor options, and changed hook manifest before any outcome comparison; even a repaired terminal game cannot enter the original prospective 116-game denominator as fresh evidence.
