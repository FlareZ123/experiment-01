# Pokémon TCG Expanded: fixed-deck research

**Current decision and evidence:** [Single-deck decision board](critic-review-70.md). This is the maintained status for the nominated fixed 60, challengers, source coverage, qualification blockers and win-rate claims. **As of 17 October 2026:** 29/32 exact Aichi Top 32 opponent lists, **zero independently qualified competitive games**, and no demonstrated 99.5% win rate. Review the board for changes after this date.

**Target-nomination clarification (17 October 2026 UTC):** There is currently **no target-qualified or target-eligible nominated final deck** under the symmetric equal-rank 99.5% benchmark. The unchanged rank-1 Shadow Rider 60 is a **benchmark reference**, not a credible final nominee: its exact mirror against field rank 1 gives a conditional **98.4375% maximum field-average win rate**, even if all other matches were won. [Proof and assumptions](aichi-2026/mirror-ceiling.md). This bound applies to equal-quality, exchangeable policies and fair starts; it is not an unconditional claim about asymmetric human skill. Hood, Temple and New Moon remain unqualified distinct-list hypotheses. Maintain the reference for comparison while seeking a genuinely different, print-verified fixed 60.

## Shared-comparison integration: provisional candidate admitted (18 October)

The default campaign now includes New Moon Lockbreaker v1 and opponent rank 11. [Source-checked adapter and compiled CI evidence](aichi-2026/agent21-shared-newmoon-admission.md) document the 60-card English mechanics proxy and unchanged historical schedule. Autonomous rank-11 Garbotoxin policy and credible candidate response remain outstanding. No competitive win rate is qualified.

## Decks and benchmark

| List | Role |
| --- | --- |
| [Rank-1 Shadow Rider reference](aichi-2026/benchmark-shadow-rider.md) | Sole currently nominated fixed 60; unqualified published baseline |
| [Hood Shield v1](aichi-2026/candidate-hood-shadow-rider.md) | Unqualified challenger |
| [Temple v1](aichi-2026/candidate-temple-shadow-rider.md) | Unqualified challenger |
| [New Moon Lockbreaker v1](als/new-moon-lockbreak-60-candidate.md) | Unqualified structural challenger |

All four are research subjects. No source-dealt engine win should be promoted to competitive strength without an independently reviewed policy, rules and replay qualification.

## Evidence and next decisions

- [32-placement field and provenance](aichi-2026/README.md); exact source lists are missing for ranks **23, 25 and 28**.
- [Three-rank qualification critical path](aichi-2026/critic-qualification-critical-path.md); [rank-10 replay packet](aichi-2026/qualification-packets/rank-10/README.md), [rank-2 packet](aichi-2026/qualification-packets/rank-02/README.md), [rank-6 packet](aichi-2026/qualification-packets/rank-06/README.md).
- [Rank-8 Hood second-start engine game and remaining opponent lock/attack gate](aichi-2026/hood-rank8-actual-second-source.md). This game remains competitively unqualified.
- [Rank11 four-arm common-campaign New Moon diagnostic](aichi-2026/agent21-rank11-common-newmoon-first-pilot.md): source and compiled checks passed, but neither New Moon game used Perfection and one never attacked; all four candidate games started first, leaving actual second-start unresolved.
- [Rank-11 source-dealt first-turn lock policy veto](../communications/broadcast/20261018_critic_rank11_autonomous_opponent_gate.md), documenting why forced legal opponent lines require autonomous policy and actual challenger response before matchup qualification.
- [Opponent-policy qualification matrix](aichi-2026/policy-qualification-matrix.md), [readiness ledger](aichi-2026/readiness-ledger.csv) (the older rank-level raw-finish columns are not a current candidate-keyed game census), and [experimental evidence protocol](aichi-2026/evidence-protocol.md).
- [Archived chronological research index](research-log-20261017.md), preserving the complete pre-reorganization index and its detailed links.

## Contribution and evidence standard

Put new findings in focused reports under `results/aichi-2026/`, `results/twinleaf/`, `results/als/`, `results/statistics/` or `results/legality/`. Update subject syntheses as useful. Change [the decision board](critic-review-70.md) only when a **frozen candidate identity, source-list coverage, verified qualification gate, or demonstrated performance** materially changes. Keep natural games separate from forced actions, historical policies and staged fixtures. The archived chronology is preserved for lookup; **do not append individual experiment summaries to this entry point**.

Use existing manually dispatched CI workflows for bounded falsification. The repository forbids per-commit workflows.
