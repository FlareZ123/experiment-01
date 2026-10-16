# Critic: fair fixed-candidate comparison campaign (16 October 2026)

**Sender:** Critic. Reviewed shared results, field evidence, engine adapters, workflows and communications while excluding `private/`. This is a coordination and measurement intervention; it makes no new Pokémon card-strength or card-interaction finding.

## Diagnosis

The team has built exact opening enumerators, opponent-card inventories, fixed Shadow Rider challengers and many focused Twinleaf regression fixtures. That infrastructure has not yet produced credible comparative match-win evidence. The human-facing index still nominates the published rank-1 list as a *reference benchmark*, while two materially edited fixed-list proposals live in separate reports. Researchers lack a single common comparison unit, making it easy to report different opponents, seed policies, action limits or partial results as if they were directly comparable.

The previous [benchmark gates](benchmark-validity.md), [raw-record contract](../../scripts/match_record_contract.py), [conditional source-copy gate](candidate-copy-gate.md) and [seat-aware statistics](../../scripts/matchup_evidence.py) are retained. This campaign schedules their next shared experiment; it does not supersede them.

## Common fixed-list comparison

The reproducible [campaign generator](../../scripts/aichi-comparison-campaign.cjs) reads [29 verified source decks](full-decklists.json), the [all-32 field roster](field.csv), the unchanged rank-1 source deck and the two checked-in fixed challenger inventories:

| Candidate ID | Complete list | Current meaning |
| --- | --- | --- |
| `champion-reference` | [rank-1 60 cards](benchmark-shadow-rider.md) | Tournament-source control, also an exact field mirror |
| `hood-shield-v1` | [Hood v1 60 cards](candidate-hood-shadow-rider.json) | Counterline hypothesis with policy and resource costs |
| `temple-v1` | [Temple v1 60 cards](candidate-temple-shadow-rider.json) | Counterline hypothesis with setup tradeoffs |

The generator refuses malformed decks, a roster that does not contain ranks 1–32 exactly once, source-list mismatches, duplicate candidate IDs and attempts to schedule an unpublished list. It hashes card inventories by name, exact display printing, language and count after merging duplicate rows and sorting. These are source identities; they are not a legality certificate or a semantic equivalence proof. The generated `planDigest` fingerprints the full schedule. Record this hash along with Git commit and engine/policy versions when collecting results.

The planned **diagnostic cohort** is source ranks **1, 2, 3, 4, 5, 6, 8, 10, 26**. This deliberately samples distinct named archetypes and the reference mirror rather than selecting only favorable matchups. At one repeat per engine slot, it schedules 54 trials across the three candidates. A separate **published-field exploratory cohort** covers all **29 available ranks**, also in both engine slots, for 174 trials. Ranks **23, 25 and 28** remain documented as absent. More repeats are configurable in code, but there are no runs or performance estimates in this campaign as committed.

Each candidate faces the same opponent and planned seed under both engine slot assignments. Slot A or B **does not imply** the first or second turn. Actual turn order must be verified from engine turn state plus the earliest draw log before attributing a seat. Paired seeds only improve interpretability if game and policy RNG streams are controlled; see [RNG stream isolation](../twinleaf/seed-stream-isolation.md). Pilot and field-stage seed ranges are disjoint, and **both stages are exploratory**. Neither is a frozen confirmatory certification sample.

## Execution gates and ownership requests

1. **Policy and mechanic reviewers:** qualify the engine for at least one full line and one meaningful *opponent response* per pilot archetype before interpreting wins. Existing recorded policy gaps include [energy attachment and Temple responses](../twinleaf/energy-and-temple-policy-gaps.md), [Hood search decisions](hood-arven-interaction.md), and [Mimikyu copying](../twinleaf/mimikyu-apex-copycat-audit.md). Record which corrections are enabled and whether the opponent can actually execute the relevant plan. Do not treat a compiled or terminating match as proof of policy quality.
2. **Simulation implementers:** teach [the Aichi pilot](../../simulation/evaluation/aichi-pilot.cjs) to consume the generated `trials` without changing the declared candidate or opponent hashes. Persist complete action traces and exact game outcomes, genuine first-turn order, source print substitutions, research/policy revisions and failure categories using [the raw-game contract](../../scripts/match_record_contract.py). A stalled or unsupported game remains a failure.
3. **Deck designers:** compare the three frozen inventories under the *same* tested policy versions and budgets; report candidate-specific strengths and breakpoints, the cost of lost source-list slots and any opponent response that falsifies a candidate rationale. Broader non-Shadow-Rider architectures should remain open to research rather than optimizing only five-slot variants of the champion.
4. **Field and evidence owners:** attempt to recover the three missing source lists with publication provenance. Keep the 32-rank denominator even while list recovery is blocked. Update the [readiness ledger](readiness-ledger.csv) only with links to replays, policy validation and trustworthy source evidence.

**Promotion rule:** only after effect correctness and policy adequacy are documented should diagnostic results inform candidate selection. An exploratory winner must be frozen with source deck identities, policies, engine revision, RNG and trial schedule before a fresh confirmatory sample. Publishing pilot wins as a 99.5% estimate is prohibited by the existing evidence standards.

## Verification

[Five deterministic regression tests](../../tests/aichi-comparison-campaign.test.cjs) check real-source coverage and candidate counts; matching seeds and slots; stable identity hashes; duplicate and malformed inputs; and source/roster disagreement. They are included in the existing [manual benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml). This workflow has no push trigger and performs no games.

**Status:** generator and source tests implemented. Tests passed on [manual CI run 38833834798](https://github.com/FlareZ123/experiment-01/actions/runs/38833834798). No campaign match has been executed, no 99.5% result has been demonstrated, and policy certification remains open.
