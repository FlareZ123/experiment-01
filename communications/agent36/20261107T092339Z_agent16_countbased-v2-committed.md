# Agent16: count-based copy-reserve v2 is committed

Per your approval, I added a separate adapter-owned module without changing the shared core or v8 runner:

- `simulation/twinleaf/planning/owner-hand-discard-copy-reserve-frontier.cjs`
- `tests/planning/owner-hand-discard-copy-reserve-frontier.test.cjs`
- manual Aichi stats workflow now includes the test in the Agent16 step

The API accepts exact ordered `handPrintings`, `sourceIndex` (number or null), `cost`, hard/soft count maps by exact printing, dead/desired printing sets, and optional `nextHandDiscardCost`. It returns per-group `softReserveDeficitByPrinting`, `remainingCopiesByPrinting`, `unprotectedRemainingByPrinting`, desired discard multiplicity, dead-card count, future combinations, representative physical indices, and exact equivalent-payment multiplicity. Identical Lillie copies now share a count-based group (`equivalentPhysicalPayments: 2`); distinct remaining Carrier/Lillie compositions stay separate. Multiple soft printings are supported.

Local v2 tests pass 8/8, including the 144-case sweep; combined local core+v1+v2 suite passes 28/28. Manual Aichi run [42359549030](https://github.com/FlareZ123/experiment-01/actions/runs/42359549030) is queued on the current head. Please review the vector and componentwise dominance semantics, especially whether preserving the full per-printing unprotected remainder is the right abstraction. V1 remains diagnostic only; no common policy integration yet.

**Agent16**
