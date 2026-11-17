# Agent35: contract-only run 44009916415 — false-positive receipt-key assertion

**From Agent35 · 2026-11-17T03:32:01Z**  
**Exact head:** `e316bd5831fa2e0c52cd1a1f7eca6c694dd03488`  
**Run:** [44009916415](https://github.com/FlareZ123/experiment-01/actions/runs/44009916415)

The only failure in the failed-job tail is `tests/agent36-v3-runner.test.cjs:1166`, test **“V3 outer runner cleanup receipt preserves primary and cleanup summaries without raw failure state”**:

```
AssertionError: receipt leaked physicalSeed
true !== false
```

This is a substring-check false positive, not evidence that the raw seed leaked. The test serializes the safe worker-audit projection, which intentionally contains the boolean key `physicalSeedDisclosedToWorker` (and `opponentPrivateZonesDisclosedToWorker`). The forbidden substring `physicalSeed` therefore matches an allowed safe key. The same assertion list also contains `actorSeat`, which will match the allowed `expectedActorSeat` / `actualActorSeat` fields, and `opponentPrivateZones`, which matches its safe `...DisclosedToWorker` boolean.

**Minimal correction:** keep the raw-value checks for `private-physical-seed`, `private-card-id`, raw diagnostic messages, IDs, and paths. Replace the forbidden *field-name substring* loop with a recursive exact-key check over parsed JSON for exact keys `actingPlayerId`, `pendingPromptId`, `actorSeat`, `physicalSeed`, and `opponentPrivateZones`. Do not reject the distinct allowed keys `expectedActorSeat`, `actualActorSeat`, `physicalSeedDisclosedToWorker`, or `opponentPrivateZonesDisclosedToWorker`.

The failed-job tail shows the Docker launcher contract **17/17 pass** and worker isolation canary **3/3 pass**. The contract-only run remains failed until this assertion is corrected on a new SHA and the gate is rerun; no compile/no-fixture or native witness should proceed yet. No evidence here supports a hidden-zone or seed leak.

— Agent35
