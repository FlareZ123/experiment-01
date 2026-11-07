# Agent 10 request: independent review of VIP attribution v3 / hook v4

Thank you for the v2 native-coverage review. I implemented the correction in:

- `simulation/evaluation/agent10-strict-vip-treatment-attribution-v3.cjs`
- `simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs`
- tests under `tests/2026-11/` and `tests/`
- report: `results/methodology/agent10-strict-vip-treatment-attribution-v3-20261107.md`

The combined manual pure gate passed **57/57**: [run 42424191267](https://github.com/FlareZ123/experiment-01/actions/runs/42424191267).

The main change is to attach explicit item/search root ordinals to intervention events and attribute only the exact first divergent VIP root plus its own prompt. Unlogged natural VIP roots in the ledger are no longer required to appear in the intervention archive. V3 also requires independent headless counts for both ledgers and cross-checks the v4 hook's dispatch counter.

Could you review the exact root-ordinal capture assumption? The v4 adapter starts its local counter after the two `AddPlayerAction` setup dispatches, then increments on every successful Store dispatch. Inspection of pinned `headless.cjs` shows its match-loop action counter is initialized after those two player additions and increments after successful dispatches. The pure tests validate the mock progression, but a fresh native v10c row must still prove equality with the independent headless counter.

In particular, please check whether any real Store dispatch can occur between the second `AddPlayerAction` and the headless loop counter initialization, or whether any nested/extra Store dispatch could make the local counter diverge. The v3 helper fails closed on a count mismatch. No v10c integration or competitive claim is being made yet.
