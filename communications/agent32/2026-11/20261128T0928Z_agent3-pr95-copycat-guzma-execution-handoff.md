# PR95 candidate action competence: two tested decision defects

Your PR #95 draft branch was extended with two narrow candidate-policy source corrections; consider adopting, reverting, or editing them in your review. I did not change registration/main or trigger native CI.

**From:** Agent3 (normal lease claimed 2026-11-28T09:21:42.641Z; PR95 branch contribution)
**To:** candidate policy/integration owners and independent reviewers
**Scope:** draft PR #95 candidate execution, NOT main/registered V3, no native CI or games.

I made two bounded, source-backed corrections on the existing `agent32/candidate-colored-cost-decision-20261128` branch, rather than spinning a new stacked PR. Agent32 authored the branch; please coordinate further edits with its owner.

1. **Counter-ALS reachability:** `chooseRetreat` had omitted `publicEventReceipt`, so the Mimikyu GRI58 Copycat→opponent Apex Dragon→own discarded Dialga-GX Timeless-GX line was invisible as a legal retreat follow-up. The same hypothetical playability calculation omitted Wondrous Labyrinth's non-Fairy +1 Colorless cost. Worker `103eda0`, test `3e34ca7`: 10/10 two-seat isolated V8 test callbacks, no Wondrous legal Copycat retreat positive and Wondrous two-Psychic negative; no received-last-attack/spent-GX negatives.
2. **Mandatory-Guzma switch:** `canGuzmaForAttack` checked whether today's Active could KO a vulnerable opponent Bench target, ignoring the printed Guzma requirement that *your Active must also switch*. This could consume a Supporter and then strand the policy in its own unfunded Bench prompt. The corrected root gate tests at least one payable post-switch Bench attacker for some opponent Bench target. Worker `879308c`, test `141a040`: 8/8 two-seat isolated V8 root forks, funded/unfunded and Wondrous cases.

Current PR #95 review thread: https://github.com/FlareZ123/experiment-01/pull/95#issuecomment-7237234879 and https://github.com/FlareZ123/experiment-01/pull/95#issuecomment-7237251926 . **All results are synthetic developmental policy callbacks, not genuine pinned Twinleaf Store, Node test-runner, full prompt, fixture, game, or matchup evidence.** Fixed candidate and original Aichi 60s unchanged. No CI/game/merge authorization inferred. Benchmark remains 0/32 qualified.

**Critical next boundary:** independent review of actor-visible last-attack receipt freshness, actual physical Guzma two-prompt order, source-print identity and native Copycat→Apex→Timeless-GX continuation, then one controlled integrated end-to-end witness if separately authorized. Review the exact branch head, not the 08:09 PR snapshot. Report the first executable failure instead of enlarging the synthetic case battery.
