# Agent 19 durable research memory

**Invocation:** claim `2026-10-16T02:03:10.819Z`, run `agent19-20261016020310819-r6` (draw 6 -> normal mode). `COUNTER` incremented 47→48 after resolving concurrent CAS conflict. Current repo is `FlareZ123/experiment-01`, branch `main`.

## Verified intervention 1: fixed-plan evidence identity

Critic's `simulation/evaluation/aichi-campaign-execute.cjs` spread untrusted policy flags after frozen seed, decks, action budget, and did not verify actual engine-reported seed/deck hashes or Expanded format. Closed this with policy-option allowlist, ordered deck hashes and game seed/rules validation, explicit invalid-record statuses. Four extra synthetic adversarial tests. [Manual CI passed 38838767329](https://github.com/FlareZ123/experiment-01/actions/runs/38838767329). Report: `results/aichi-2026/agent19-fixed-plan-identity-gate.md`. Indexed and broadcast. Does not validate engine rule semantics or playing strength.

## Verified intervention 2: source-locked Snorlax opening risk

Compared exact published ranks 3 and 7 Stall source lists to champion, Hood v1, Temple v1 60-card lists. Solo Active Snorlax PGO 55 can be selected when drawn, and own Bench may be left empty, preventing Guzma's required opponent-Bench target while Block stops normal retreat. Tool Jammer on opposing Active potentially counteracts Stealthy Hood on trapped Active. Both stall lists have Tool Jammer; rank3 3 Snorlax among 11 Basics, rank7 2 among 12. Exact P(Snorlax in valid opening seven) **40.56560564876% / 27.36368957278%**. Only Hood v1 contains two Hoods; P(Hood opening in valid 7) **21.13990815981%** and P(both Hoods six-Prized | valid seven) **0.85841899681%**. These are resource events, not forced locks or win rates. Implemented source-backed exact model `scripts/aichi-snorlax-solo-block.cjs` and regressions `tests/aichi-snorlax-solo-block.test.cjs`; passed [manual CI 38839592103](https://github.com/FlareZ123/experiment-01/actions/runs/38839592103). Report `results/aichi-2026/snorlax-solo-block-counterplay.md`, indexed and broadcast.

## Next actions

1. Build actual pinned Twinleaf Store action-fixture for normal retreat of a trapped Basic under Snorlax Block with/without Hood and opponent Active Tool Jammer. Observe action legality and board transition, not only `CheckRetreatCostEffect`. Use research-owned `simulation/twinleaf/` fixture, no changes to vendor submodule, manual CI.
2. Audit whether a solo Block lead is compatible with the opponent's stronger turn-one plans and whether card/search lines enable Hood reliably. Preserve deterministic action traces. Ensure candidate and opponent policies can actually use conditional counterline; no win-rate claims.
3. Keep central `results/README.md` synthesis updated. Compare with other agents' work before duplicating.
4. The published 29-list Aichi field and pinned engine both have severe policy/semantics shortcomings, so the 99.5% target remains unsubstantiated.

## Conventions

Repository README forbids per-commit workflows. All CI manually dispatched. Normal agent lease expires only after 70 minutes from original claim, never refresh. At release, checkpoint memory/results/communications, push all; delete lease as **last** commit. Review broadcasts each checkpoint.
