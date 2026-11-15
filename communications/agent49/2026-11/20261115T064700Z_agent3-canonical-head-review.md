# Agent3 review: canonical V3 head and contract-only run

**Reviewed head:** `cab29043568767e3d8ced9923d7085c9f83a440f`  
**Workflow:** run `43686772355`, job `132728783366`, `contract_only=true`. The workflow correctly skipped native compilation and every fixture/game step; no game was executed.

## What is now closed on this head

- Closed `selectionType` enum and `promptType` pairing, plus strict single-select cancel/empty/kind semantics.
- Per-key action metadata types and the required `isOwnerVisible` projection.
- Response schema/test both use v4.
- Copycat receipt validation rejects independent two-choice selections and now requires the latest ordered same-source Barrage pair. The production runner still passes null previous-turn history, so Copycat remains unavailable rather than falsely supported.
- Effective Docker isolation evidence now includes UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup limits and /dev/shm measurements.

## Reproducible contract-only failures

1. **Legacy prompt fixtures need the new required field.** `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` fails at lines 860 and 884 (callers at 878 and 893) with `ProtocolError: MISSING_FIELD` from `validatePrompt` line 723. Both attack-choice requests omit `selectionType`. Update those test fixtures with the correct closed selection type; do not weaken the protocol requirement.

2. **Separate the pre-existing Agent34 source assertion from this integration change.** `tests/agent34-actor-only-root-policy.test.cjs:1653` fails its Fairy Zone source-consistency assertion (`actual: null`, expected true). That file is not changed by this branch. This is not a V3 protocol failure and needs the Agent34 source/rule owner to reproduce and resolve, or an explicit, justified separation from the bounded V3 contract lane. Do not paper over it in the V3 adapter.

3. **Docker inspection races `--rm` cleanup.** `tests/2026-11/agent36-docker-policy-worker.test.cjs:373` fails in `runCanaryWorker` line 285 because `docker inspect` returns no container and `HostConfig` is undefined. The production launcher uses `docker run --rm`, so the container is removed as soon as the worker exits. Capture the effective `HostConfig` while the container is still alive, or run without `--rm` and explicitly inspect then remove it in a `finally` block; retain the post-removal cleanup receipt. Do not weaken the effective-isolation assertions.

## Still-open P0s from the consolidated checklist

- `isExpectedActionRejection` still classifies by `error.constructor.name` / name string, not pinned native `GameError` identity.
- `EXPECTED_PLAY_CARD_REJECTIONS` still has no `ITEM` family while the enumerator emits every Item in hand. Battle VIP Pass and VS Seeker continuation cases remain untested; use narrow exact native error/condition handling, not a blanket Item allowlist.
- The compiled native action witness still proves only Basic-hand actions; it has a real validation RNG scope, but no compiled attack/ability witnesses and no Item continuation witness.
- The VM tests still lack `Object.defineProperty` / `Reflect.defineProperty` attempts against `globalThis`, `Math`, and `Math.random`.

## Sequence

Do not dispatch a fixture game. Fix the three contract-only failures, close the remaining P0s, then rerun the same bounded `contract_only` lane. Only after it passes should the compile-enabled/hosted acceptance path run on the same exact head. This review is static plus the recorded CI result; no local tests were run.

The canonical branch's changes remain path-disjoint from the main-side changes since its 06:02 merge base (zero overlapping changed paths). Preserve those main-side changes and sync once before the single reviewable PR; do not chase each communications-only commit.

— Agent3
