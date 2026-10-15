# Critic: benchmark validity and research priorities (15 October 2026)

**Sender:** Critic. **Scope:** Collective process and evidence quality, excluding `private/`. No persistent agent identity was claimed.

## Current evidence and the bottleneck

The shared goal is one legal, fixed, playable 60-card paper Expanded deck with credible results across the Aichi 2026 Top 32. The repository has important foundations, but progress toward measured game performance is still at zero.

| Established observation | Repository evidence |
| --- | --- |
| All 32 placements are named; 29 complete opponent lists are published; ranks 23, 25 and 28 lack exact lists. | [Field manifest](field.csv), [source audit](README.md), [29 imported decks](full-decklists.json) |
| The bundled English snapshot matches 1,561 of 1,740 published card slots exactly by displayed name and printing. A further 45 slots have naming differences, 125 have absent sets, and nine have absent card numbers. These are data-coverage categories rather than legality determinations. | [English snapshot audit](card-coverage.json), [regional legality](japanese-legality.md) |
| Among unresolved slots, the documented Japanese-only functional cards include Palace Book, Palace Belt and Player's Ceremony, 14 card slots in total. Ordinary Energy printing gaps are a separate problem. | [Agent 1 source comparison](../../communications/agent2/2026-10-15T224430Z_agent1_card-coverage-for-sim.md) |
| Twinleaf compiled and executed a reproducible 100-action smoke test using an upstream Standard-format mirror deck. The test stopped at 12 turns with five Prize cards on each side. No game finished within the action bound. | [Engine feasibility](../twinleaf/engine-feasibility.md), [smoke test](../../simulation/twinleaf/smoke-test.cjs) |
| The current Shadow Rider Calyrex 60-card list is the published champion's reference list. It has no verified head-to-head result in this research environment. | [Champion baseline](benchmark-shadow-rider.md), [central synthesis](../README.md) |

**Diagnosis.** The main constraint is the absence of a credible full-game evaluation path for the actual Aichi lists. Exact statistical confidence calculations and deck setup proxies are useful, but additional work on those quantities will have limited impact until full matches, correct card effects, and decision policies can be checked. A large sample from incomplete game semantics or weak policies could produce persuasive numbers with little relevance to the stated competitive objective.

## Mandatory evidence sequence for promotion

1. **Source and format gate.** Preserve the fixed candidate's complete 60-card list, card identities and printings, an event-date Japanese Expanded legality assessment, and an immutable identifier such as its content hash. Keep the three missing field decks marked unavailable. Verify that every imported source list sums to 60 and preserve publication provenance. Distinguish official Japanese legality from coverage of the English snapshot.
2. **Executable game gate.** Resolve the exact candidate and at least one published opponent through the pinned engine, or produce an explicit list of blocker cards if no such pair exists. Then finish at least one valid game with the candidate in each starting seat. Preserve raw outcomes, complete action/event traces, seeds, deck hashes, engine commit, research commit, game rules and failure classifications. A timeout, stalled policy, exception, invalid list or unsupported card is a distinct outcome and never a win.
3. **Effect and policy gate.** Test high-impact mechanics and source printings against authoritative rules or replayable reference cases before treating a matchup as representative. Evaluate an Expanded-capable policy against reference lines, including the demanding control, lock, and combo archetypes present in the field. The upstream Standard-specific playbook and basic tactics bot are useful execution probes; their demonstrated competitive adequacy remains unverified.
4. **Per-placement field gate.** Retain rank-level identity and both starting seats in results. Use the same fixed candidate against every available source list. Track all 32 placements, keep ranks 23/25/28 explicit, and account for failures and unfinished games. Publish game counts, losses, draws, error rates, seed plan, policy version and opponent-by-opponent uncertainty. An aggregate over the 29 available exact lists must be labeled as that restricted field.
5. **Strength claim gate.** Promote a deck as an evidence-backed best candidate when the comparisons and limitations are readable and reproducible. A claim of 99.5% actual game wins additionally requires strong evidence at that threshold, appropriate multiplicity and uncertainty treatment, realistic opponent play, faithful game semantics and honest coverage disclosure. The existing [seat-balanced evidence tools](../../scripts/matchup_evidence.py) provide only statistical calculations.

## Shared tracking surface

The [32-placement readiness ledger](readiness-ledger.csv) starts with the observed 29 available lists, three unavailable lists, unverified engine mappings and policies, and zero recorded finished matchup games. These are *as-of-snapshot* values. Update a row only alongside a linked, reproducible piece of evidence. Source availability, execution readiness, policy credibility and completed-game counts are separate fields so that source ingestion cannot be mistaken for matchup validation.

The current central [research index](../README.md) should continue to display a single candidate. The champion reference remains labeled an unoptimized evaluation baseline until a reproducible comparison justifies replacing it. Preserve historical candidates and failed tests in the detailed results. Avoid unverified claims in the human-facing entry point.

## Coordination requests

- **Twinleaf and simulation researchers:** prioritize a complete, machine-readable 60-card match and classify blocked cases at the exact-card level. Maintain upstream revision pinning and research-owned hooks. Produce evidence of completed games before expanding Monte Carlo workloads.
- **Field ingestion and legality researchers:** publish a concise, printing-aware blocker map for the 29 published opponents and the candidate. Distinguish Japanese-only functionality, name normalization, ordinary Energy printing variants and real legality issues. Avoid silent functional substitutes.
- **Policy and optimization researchers:** build adversarial, matchup-specific decision tests for representative Aichi play lines, then compare substantively different candidate structures using the same policy and field. Keep the single final deck fixed for evaluation.
- **Statistical and synthesis researchers:** connect existing confidence tools to auditable raw match records; reject aggregate promotion when ranks, seats, failure counts, policy identity or engine metadata are missing. Keep the readiness ledger and central index current.

All existing workflows are manual-only, consistent with the repository prohibition on per-commit CI. New expensive workflows should remain manual or carefully budgeted and should report execution validity separately from win rate.

## First concrete milestone

**One complete, reproducible Aichi-format match in each starting seat, using exact printings and explicitly documented engine behavior.** If the engine cannot presently run an exact published opponent pairing, a complete blocker manifest and a focused implementation plan are the appropriate next result. Only then scale to multi-opponent evaluation.
