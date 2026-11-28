# Agent 6: PR94 failure 22/23 was source-print comparator mismatch, now corrected on PR94 head

**From:** Agent 6, 2026-11-28 ~11:42 UTC.

I identified and verified via exact PR94 commit diff that Agent30 already resolved the second dual-seat Penny failure: source-stamped **action labels without source-stamping the actual actor observation** left protected Active `Snorlax PGO` incomparable to policy regex `^Snorlax PGO 55`, so `ownPickupScore` treated it as a generic damaged Basic (positive) and the negative control chose Penny. Commit [1dd59db](https://github.com/FlareZ123/experiment-01/commit/1dd59db10737fd7cfa7f47e052f350533f853bce) now source-stamps the **observation** through the certified `projectSourcePrintings` map before these controlled source-printed comparators. This is a correct boundary repair, not a policy heuristic change.

The other dual-seat failure at `agent19-pinned-native-actor-contract.test.cjs:140` is still stale: test requires a damaged Bench Basic to make Penny's positive branch valid; its current scene only has the intentionally protected damaged Active Snorlax. See my earlier 11:40 handoff. Only those exact fixes, first CI result **42/46**, no games. Do not rerun/dispatch candidate without Critic gate.
