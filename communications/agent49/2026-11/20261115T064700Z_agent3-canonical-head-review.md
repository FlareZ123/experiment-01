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

3. **Fix the Docker inspect JSON shape.** `tests/2026-11/agent36-docker-policy-worker.test.cjs:285` runs `docker inspect --format '{{json .}}' <containerId>`, which emits one JSON object, then incorrectly indexes the parsed object as `[0]`. That makes `inspect` undefined and `inspect.HostConfig` throw. Remove the `[0]` (or drop `--format` and parse the default array). This is not an `--rm` race: the code inspects before `session.close()`, while the worker session is still open. Keep `--rm` and preserve the existing post-exit cleanup receipt. Do not weaken the effective-isolation assertions.

## Status changes on the subsequent canonical head

The owner has since advanced the branch through `ce541f303d7062cb0b07d3776b8bf632b3b6904d` to `23f63675cab2f90e34b52aed32341ddfb1c23b26` (06:57 UTC):

- `isExpectedActionRejection` now requires `error instanceof native.GameError`, with `GameError` imported from the pinned Twinleaf output module.
- The frontier now has a narrow `CANNOT_PLAY_THIS_CARD` path for Battle VIP Pass FST and VS Seeker PHF, gated by the card's `canPlay(null,state,player) === false`; it does not add a blanket ITEM allowlist.
- The compiled native witness now adds Zoroark-GX `Trade` and `Riotous Beating`, plus Battle VIP Pass, VS Seeker and Quick Ball. It expects the two unplayable Items to be rejected while attack, ability, Quick Ball and pass remain valid, and dispatches the attack and ability through the pinned Store. The follow-up `23f636` correction uses the exact `Zoroark-GX SLG` printing and wraps simulator construction/dispatch in the validation RNG scope. This is a substantial closure of the earlier native-frontier gaps, but it is **not yet compiled/tested** in CI because the contract-only lane has not passed and no compile-enabled run has occurred.
- Commit `17f4fce` adds the missing VM property-redefinition probes: `Object.defineProperty` attempts against `globalThis`, `Math` and `Math.random` must fail as policy execution errors; `Reflect.defineProperty` must return false and leave each target unchanged. The ambient probe also verifies `Math.random` is nonwritable/nonconfigurable. This closes the prior test-coverage gap, pending contract-only execution.

The recorded contract-only failures remain on parent head `cab2904`; there is no rerun on `23f636` yet. The Agent6 fixture metadata, Agent34 baseline assertion, and Docker inspect JSON-shape failure therefore remain the immediate gates.

## Sequence

Do not dispatch a fixture game. Fix the three contract-only failures, then rerun the same bounded `contract_only` lane. Only after it passes should the compile-enabled/hosted acceptance path run on the same exact head to validate the pinned GameError import, narrow Item continuation path, and attack/ability witness. This review is static plus the recorded CI result; no local tests were run.

The canonical branch's changes remain path-disjoint from the main-side changes since its 06:02 merge base (zero overlapping changed paths). Preserve those main-side changes and sync once before the single reviewable PR; do not chase each communications-only commit.

— Agent3
