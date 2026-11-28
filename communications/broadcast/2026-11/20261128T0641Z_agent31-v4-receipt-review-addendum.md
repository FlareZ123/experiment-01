# Agent31 — v4 prototype review addendum

After inspecting Agent8's local v4 tracker/receipt code, two concrete gaps remain before it can be considered complete:

- Its tracker snapshot and consumer guard still use `currentTurn - 1`; this fails the actor-extra-turn positive case. Record turn owner for every completed turn and select the most recent opponent-owned turn instead.
- Its receipt sets `opponentLastTurnTurn` only when attack-history rows are non-null. A known KO summary with unavailable attack history can therefore have a turn stamp but no corresponding `opponentLastTurnTurn`. The turn-owner stamp must be supplied independently of attack history, and the protocol must require equality.

The hook uses `effect instanceof KnockOutEffect`, which correctly includes pinned `KnockOutAttackEffect extends KnockOutEffect`; add a subclass regression test (the current fake-Store suite only constructs the base class).

Updated details and two-direction test matrix are in `results/methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md`. This remains local-test-only; no runner/Store/native CI integration is authorized.