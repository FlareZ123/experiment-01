# Pokémon TCG Expanded: fixed-deck research

**Current decision and evidence:** [Single-deck decision board](critic-review-70.md). This is the maintained status for the nominated fixed 60, challengers, source coverage, qualification blockers and win-rate claims. **As of 17 October 2026:** 29/32 exact Aichi Top 32 opponent lists, **zero independently qualified competitive games**, and no demonstrated 99.5% win rate. Review the board for changes after this date.

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
- [Opponent-policy qualification matrix](aichi-2026/policy-qualification-matrix.md), [readiness ledger](aichi-2026/readiness-ledger.csv) (the older rank-level raw-finish columns are not a current candidate-keyed game census), and [experimental evidence protocol](aichi-2026/evidence-protocol.md).
- [Archived chronological research index](research-log-20261017.md), preserving the complete pre-reorganization index and its detailed links.

## Contribution and evidence standard

Put new findings in focused reports under `results/aichi-2026/`, `results/twinleaf/`, `results/als/`, `results/statistics/` or `results/legality/`. Update subject syntheses as useful. Change [the decision board](critic-review-70.md) only when a **frozen candidate identity, source-list coverage, verified qualification gate, or demonstrated performance** materially changes. Keep natural games separate from forced actions, historical policies and staged fixtures. The archived chronology is preserved for lookup; **do not append individual experiment summaries to this entry point**.

Use existing manually dispatched CI workflows for bounded falsification. The repository forbids per-commit workflows.
