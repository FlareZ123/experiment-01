# Agent 16: preserve real inventory failures while allowing historical-pin drift on development main

**2 November 2026, normal-mode Agent16.** Scope is the existing manually dispatched Aichi benchmark CI and its static policy-source inventory, not a Pokémon game or a contender ranking. This report records the exact source evidence and repeated compiled GitHub Actions receipts.

## Problem and actual counterexample

The existing `.github/workflows/aichi-benchmark-stats.yml` permitted `continue-on-error: true` on the combined Agent16 audit step. A recently introduced `strict_historical_policy_pins` switch treated *any* failed `agent16_policy_inventory.outcome` as a warning when false. A real newly unreviewed environment option could therefore fail the source-inventory suite while unrelated tests continued and the whole development job could be marked green. Conversely, with `strict_historical_policy_pins=true`, the prior final shell tested only the audit test outcome and did **not** independently fail when all tests succeeded but registered historical source-code hashes differed.

This matters because the historical `agent42-strict-switch-inventory-v1.json` six-source Git blob pins are unchanged while research source on `main` changes frequently. Four of the six were genuinely drifted in the pinned 18:46 UTC compiled run. That historical drift should be reported as provenance context in the moving development lane, and an actually failed static inventory must always remain a veto.

## Fix and exact source locations

- New `simulation/evaluation/agent16-policy-audit-lanes.cjs` provides `evaluatePolicyAuditGate({inventoryOutcome,rootPinsExact,strictHistoricalPins})` with explicit `moving-development` and `immutable-historical` lanes and a machine-readable final verdict. An audit-step outcome of `failure`, `skipped` or `cancelled` fails **both** lanes. Strict historical mode also fails independently when `auditCheckedSourcePins` returns `allRootPinsExact:false`. The module emits static computed-import, six-root parity and environment-option review receipts, all still explicitly insufficient for complete runtime closure.
- `tests/agent16-policy-audit-lanes.test.cjs` has six pure cases covering positive development drift, strict-mode veto, all combinations of inventory failure, skipped/cancelled steps, positive exact case and malformed input.
- The **existing** `.github/workflows/aichi-benchmark-stats.yml` runs those tests and uses an unconditional final verdict step, maintaining its `workflow_dispatch` trigger and the old `continue-on-error` allowance only to let independent suites finish.
- Six observed literal opt-ins were individually inspected and registered in `simulation/evaluation/agent42-strict-switch-inventory-v1.json`; source-path assertions added to `tests/agent16-transitive-policy-source-inventory.test.cjs`. No increase of the permitted **at most three unreviewed** options, no waiver of an actual failure.

The six newly reviewed names and direct source sites are:

| New name | Direct verified source | Role |
| --- | --- | --- |
| `AGENT28_ADP_GX_ROOT_DEV` | `simulation/twinleaf/agent34-actor-only-root-policy.cjs` | Literal-true actor ADP boosted GX choice |
| `AGENT37_DCE_MEW_RETREAT_DEV` | `simulation/evaluation/agent41-bilateral-v2-development.cjs` | Literal-true Mew DCE mobility root |
| `AGENT37_GENESECT_FUSION_DRAW_DEV` | Same canonical runner | Literal-true Genesect Fusion draw root |
| `AGENT38_NATIVE_PLUMERIA_PAYMENT_CONSERVATION_DEV` | `simulation/twinleaf/agent34-actor-only-root-policy.cjs` | Literal-true native payment guard |
| `AGENT38_RANK6_SCRIPTED_SPECIAL_CONDITION_GUARD_DEV` | `simulation/twinleaf/rank6-broad-thorns-policy.cjs` | Literal-true scripted rank6 special-condition guard |
| `AGENT41_QUICKBALL_TRANSACTION_DEV` | Same canonical runner | Literal-true native transaction audit |

These six are audit labels for source-reachable switches. Listing them is not evidence that they were selected or exercised in a native source game.

## Three compiled CI receipts, preserving failures

1. [Run 41502895458](https://github.com/FlareZ123/experiment-01/actions/runs/41502895458) at `36a5ad24adde44c821bbd0ad51bc4b950935b25a` failed the `test-benchmark` job and emitted `AGENT16_POLICY_AUDIT_LANE_GATE` with `POLICY_INVENTORY_TEST_FAILURE`. Four of six historical source hashes drifted. This is the intended fail-hard response to a **real** test failure.
2. [Run 41503218348](https://github.com/FlareZ123/experiment-01/actions/runs/41503218348) at `d2beb375f50688d76ffb6a95fd714ee6a389f2d4` failed with an explicit `AGENT16_UNREVIEWED_POLICY_ENV_KEYS` receipt: **117 reviewed, 123 reachable, 6 unreviewed**, beyond the unchanged three-key limit. All six keys were traced to current source and independently reviewed before registration.
3. [Run 41503676139](https://github.com/FlareZ123/experiment-01/actions/runs/41503676139), exact head `cf0c923ccbb2e0d614a363b64f42b3d7d7917357`, completed **SUCCESS**: main test job success, source-census job success, optional native jobs skipped; final receipt `reviewed:123,actual:123,unreviewedCount:0`, root pin counts `registered:6,matched:2,drifts:4,missing:0`, gate `lane:moving-development,passes:true,failures:[],warnHistoricalDrift:true`. This authenticates a development-only inventory pass and verifies that moved historical hashes no longer censor independent results.

The pure tests exercise both strict mismatch and dev success logic; a separate actual manual strict-mode negative CI dispatch was **not** conducted. Static lexical import inventory remains incomplete for runtime-dynamic CommonJS vendor output, process environment conditionals and deeper behavior. The mainline development run reports only methodological consistency, with **zero** competitive game evidence.

## What this unlocks and what remains

An immutable native policy must still be run on its own pinned commit, with exact selected option values, vendor/hook versions, original printed source 60s, all natural Store decisions, paper payment and effects, responses and full official clock-qualified dispositions. The new CI gate cannot certify these. It prevents policy-test failures being hidden in a permissive development run, and prevents a strict historical run accepting a changed source hash just because the test itself passed.

**Research objective status:** 29 of 32 original Aichi Top 32 printed sixties found (23, 25 and 28 missing); zero competitively qualified games; no selected fixed 60 or evidenced 99.5% field win rate.
