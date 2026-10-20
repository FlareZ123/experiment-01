# Pre-registered New Moon first-own-turn VIP: first compiled 16-deal audit (Agent 7)

**20 October 2026. Mechanical policy-exposure evidence only, zero competitive-qualified games.** Agent 21 [pre-registered the source schedule and fixed intervention](registrations/newmoon-first-own-vip-v1-20261019.md) before outcomes; Agent 7 connected its existing manual workflow and dispatched its first compiled execution.

## Frozen execution and reproducibility

- **[Successful manual CI 39426668350](https://github.com/FlareZ123/experiment-01/actions/runs/39426668350)**, checked-out repository commit `d5b8af4b49c5d61c9926ea12d9b0b441086b517f`, pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Existing manual workflow `.github/workflows/rank11-direct-boostshake.yml`, explicit dispatch `vip_prospective_trials=16`, `trials=32`, `seed_protocol=decorrelated-v2`, `source_seat=0`. The first input activates the exact 16-deal registered study; the others control unrelated always-run rank-11 diagnostics and do **not** modify this frozen cohort.
- Research executable `simulation/evaluation/newmoon-first-own-vip-prospective.cjs`; candidate-only owner-visible intervention `simulation/twinleaf/newmoon-first-own-vip.cjs`. Candidate is the unchanged frozen New Moon Lockbreaker v1 English-equivalent 60; source opponents are exact published ranks 6 (Iron Thorns) and 11 (Absol/Garbodor). Registration fixes four repeats, both physical candidate seats, same-deal original and intervention arms, 90-action cap.
- CI archive **[artifact 12265758906](https://github.com/FlareZ123/experiment-01/actions/runs/39426668350/artifacts/12265758906)**, name `rank11-direct-boostshake-unqualified-seat-0`, 10,219 ZIP bytes, SHA-256 `07ff7dc92c2aa460b498086ed4509de72ba80c1a6b246e3f9a607a5a1f01cb05`; contains `newmoon-first-own-vip-prospective.json` alongside unrelated source diagnostic files.

## Verified stdout census

The compiled CI printed the following output directly from the registered runner's machine-generated JSON:

| Field | Observed |
| --- | ---: |
| `registeredSourceDeals` | 16 |
| `observedAttempts` | 16 |
| `verifiedActualStartingOrders` | 16 |
| `legalVIPDispatches` | 4 |
| `ownerPromptValidSelections` | 4 |
| `falseOrFailedAttempts` | 0 |
| `competitivelyQualifiedGames` | **0** |

The program's method counts a legal VIP offer when the candidate wrapper's real-hand proposal passes the native `isValidAction` check; the owner-deck target counter records the subsequent `ChooseCardsPrompt` prefix accepted by its native validator. A 4/16 observed offer frequency **describes this deliberately small mechanical cohort**, with no claim of a population setup frequency or candidate improvement. Source and candidate are paired in the runner. CI exit success independently establishes that the bounded executor completed and uploaded the archive, but the stdout summary **does not itself verify** four settled Bench transitions, all original-versus-intervention root diffs, or the four actual-start/order cell counts.

The archived detailed JSON should be independently audited before promoting any per-rank, per-seat, first/second, original control, intervention effect or outcome statement. The original source roster and source policy are not optimized by this intervention; the general bot remains known to have attack-choice and information-safety problems. The 90-action cap and unmodeled paper clock prevent competitive win inference.

## Next discriminating checks

1. Independently consume `newmoon-first-own-vip-prospective.json` from the immutable artifact. Verify all 16 registered IDs, printed candidate/source deck digests, true starting-order/seat cells, exactly matched original deal, preserved censored cases, and four native first-turn VIP prompt-to-public-Bench transitions. Preserve failures if found.
2. Compare the true owner first-turn action sequence with the baseline on each of the four interventions; expose whether Bench construction actually unlocks a later attack or whether the default bot simply passes. Do not make a deck-strength claim without adversarial, information-safe source replies.
3. Feed a **versioned** owner-information-safe common policy through the established Agent 41 bilateral v2 runner before evaluating any fresh win-rate cohort. This study's scripted VIP-specific intervention is not a proof that the whole policy is actor-blind.
4. Extend to genuine all-field, legal/Japanese-print and paper-clock coverage only after the shared source and reply fidelity gates are met. Exactly 29 of 32 complete source lists remain available; ranks 23, 25 and 28 are still missing.

**Classification:** a pre-registered, compiled, source-real policy **mechanics** result. It advances native first-own-turn Item/prompt coverage and leaves **0 competitive-qualified games and no validated 99.5% deck**.

## Independent full archive audit, 20 October 2026

The previously missing 16-row original-artifact examination passed [manual archive CI 39429115085](https://github.com/FlareZ123/experiment-01/actions/runs/39429115085), check-out SHA `c795ce3dad00de4e8bf7689a01dbe0d369790f54`, without replaying a single source deal. The existing archival workflow downloaded the exact run 39426668350 artifact, ran four passing negative-and-positive tests, and executed [an independent denominator, seed, native proposal and Bench auditor](../../scripts/agent7-newmoon-vip-archive-audit.cjs).

| Audited field | Result |
| --- | ---: |
| Registered original deals present | 16/16 |
| True source first, drawn starting-order verified | 11 |
| True candidate first, drawn starting-order verified | 5 |
| Native legal VIP offers | 4 |
| Native accepted owner-deck prompt selections | 4 |
| Public post-dispatch Bench containing the selected Basics | **4** |
| Exceptions or missed registered attempts | 0 |
| Competitive qualified games | **0** |

Source-rank and physical-seat strata:

| Source | Candidate seat | Candidate first | Source first | VIP Bench witnesses |
| --- | --- | ---: | ---: | ---: |
| Rank 6 Iron Thorns | A | 1 | 3 | 2 |
| Rank 6 Iron Thorns | B | 2 | 2 | 1 |
| Rank 11 Absol/Garbodor | A | 0 | 4 | 1 |
| Rank 11 Absol/Garbodor | B | 2 | 2 | 0 |

Three positive witnesses placed both Gengar & Mimikyu-GX TEU and Mewtwo & Mew-GX UNM onto the post-dispatch public Bench. The other selected Gengar & Mimikyu-GX TEU with Squawkabilly ex PAL. Three witnessed offers occurred when the candidate started second, one when it started first. All **32 paired baseline and alternative trajectories hit the 90-action cap**. The archived per-row actual-start and action counts can be independently inspected in the audit CI log.

The [archive audit code](../../scripts/agent7-newmoon-vip-archive-audit.cjs), [four regressions](../../tests/agent7-newmoon-vip-archive-audit.test.cjs), and archive-only mode on the existing manual `.github/workflows/aichi-rank11-artifact-audit.yml` are committed. This validates bounded actual VIP owner-search and public-Bench execution. It does not establish better attacks, competitive player skill, opponent decision safety, Japanese legality or match wins.

## Paired first-own-turn action integrity, independent archive-only re-audit

[Manual replay-free audit CI 39429657479](https://github.com/FlareZ123/experiment-01/actions/runs/39429657479), source `41e9fb362337485ab0c83d2018001de9ca0eaeb3`, passed all four pure tests and the same immutable source archive. Auditor now compares every first-own-turn decisionTrace action against its same-deal baseline, preserving full native action and selection lists for four positives.

- **12/12 no-VIP-offer controls** have exactly equal first-own-turn action sequences between baseline and policy-intervention arms, an important negative-control parity result at the available 25-decision window.
- **4/4 VIP-offer arms** diverge from baseline, initially through a legal Battle VIP Pass PlayCardAction and matching owner-deck ResolvePromptAction. Each ends the candidate's first-own-turn action list with PassTurnAction; none has an attack entry in this limited transcript.
- Two positives, rank6 repeat0 seat A and rank11 repeat1 seat A, insert VIP+native prompt while retaining the remaining baseline candidate first-own-turn action sequence.
- Rank6 repeat1 seat A, seed 3384976141: original first turn uses Hisuian Heavy Ball to obtain Squawkabilly ex and subsequently plays Squawkabilly ex to Bench. VIP arm obtains the same Squawkabilly ex from Heavy Ball yet does **not** later play it. That is a concrete downstream action displacement and a warning that successful Bench filling can consume future setup options. The archive does not by itself establish which Bench or policy constraint caused the omission.
- Rank6 repeat3 seat B, seed 1756476188: baseline executes Secret Box and passes after Path to the Peak, whereas VIP arm adds a Powerglass play before Path and Pass. The additional later choice is mechanically observed, with strategic value unmeasured.

All four alternatives used their authentic native owner-deck search to put Gengar & Mimikyu-GX alongside Mewtwo & Mew-GX or Squawkabilly onto the public Bench. These four first-turn divergences remain **mechanical sequencing evidence**, because the parent bot's subsequent attacking policy is not qualified. The no-op parity check is confined to candidate first-own-turn reported decisions; it does not certify identical full-game action ledgers or independent RNG replay.

## Bench-capacity attribution from original archived events

An additional replay-free [CI 39430206247](https://github.com/FlareZ123/experiment-01/actions/runs/39430206247), using the same immutable experiment archive and four passing tests, exposed the **public five-slot Bench snapshot immediately after each successful VIP native prompt**:

| Source, seat, repeat | Public Bench immediately after VIP | Free slots |
| --- | --- | ---: |
| Rank 6, A, 0 | Unown, Gengar & Mimikyu-GX, Mewtwo & Mew-GX | 2 |
| Rank 6, A, 1 | Duskull, Galarian Articuno V, Gengar & Mimikyu-GX, Mewtwo & Mew-GX | **1** |
| Rank 6, B, 3 | Gengar & Mimikyu-GX, Squawkabilly ex | 3 |
| Rank 11, A, 1 | Lillie's Clefairy ex, Gengar & Mimikyu-GX, Mewtwo & Mew-GX | 2 |

In the rank-6 repeat1 seat-A positive, the intervened candidate then physically plays another Duskull onto its sole open Bench slot, before retrieving Squawkabilly ex with Hisuian Heavy Ball. No Squawkabilly ex Bench play follows. The archived public Bench snapshot, actual first-own-turn Duskull play and standard five-slot Bench rule jointly support **Bench occupancy as the immediate mechanical obstruction**. The original paired control instead plays the retrieved Squawkabilly ex and had no VIP targets occupying those two spaces. A substitute future play might have a different value: the relative utility of the Gengar/Mewtwo line and Squawkabilly remains unmeasured.

Methodological implication: even a printed-legal, native-accepted first-turn search can consume Bench capacity and crowd out an otherwise executable draw-support Basic. Conditional tactical opportunity costs must enter deck and common-policy evaluation alongside Item access probabilities. No wider 60-card or matchup superiority is inferred.
