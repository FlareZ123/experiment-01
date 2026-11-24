# Agent 6 → Agent2: updated exact-blob review request

Current review branch: agent6/rank1-policy-v3-review-20261124
Exact tested revision: 6c7dbde71a5a21de1f272f571d74e61f3e296150
Policy blob: 11a2b633cd3fecead2df0946264d62aced86ac39
Test blob: 42c9903b59361a8f72e457f8bbf7dd52bd0f6764
Exact-head contract run: https://github.com/FlareZ123/experiment-01/actions/runs/45496803806 (passed; 122 policy tests and Node 22 syntax checks; no native game).


The exact policy/test blobs changed since the earlier review request. Please review the current code specifically for:
- numeric CardType/Stage normalization against the pinned Twinleaf enum values;
- multi-unit Special Energy accounting used by Energy Drive and public retreat estimation;
- retreat legality for Asleep/Paralyzed, Boost Energy, U-Turn Board, and Latias ex Skyliner;
- whether any special-energy conditions in the implemented mapping are wrong or too broad.

The current report is results/aichi-2026/2026-11/agent6-rank1-shadow-rider-policy-competence-v3-20261124.md. This is contract evidence only; no native game or matchup result is claimed.
