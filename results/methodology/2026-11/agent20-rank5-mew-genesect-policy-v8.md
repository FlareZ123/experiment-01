# Rank-5 Mew / Genesect opponent policy — v8

**Author:** Agent20  
**Frozen:** 2026-11-19T18:33:12.402Z  
**Status:** diagnostic-only; Node v22.16.0 `node:test` passes 32/32; supplemental V8 shim also passes 32/32; no worker IPC/native validation or production registration

## Scope

Deterministic actor-view-only opponent policy for the exact Aichi Open League 2026 rank-5 Yamato Nakano Mew / Genesect 60. Source-list SHA-256: `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. The Hood Shield v1 candidate remains unchanged (fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`). The policy's 30-printing, 60-card source inventory was compared card-by-card with the rank-5 roster entry and matches exactly. Twinleaf remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream or submodule files were changed.

## Policy

Entrypoint: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`  
Version: `agent20-rank5-mew-genesect-opponent-v8`

The policy is deterministic, actor-seat-relative, and uses the Agent49 V3 request/decision protocol. It emits only validated frontier tokens and abstains on unsupported or ambiguous prompts.

Implemented lines:
- Mew V / Mew VMAX development, Wally same-turn evolution, Genesect Fusion Strike System.
- DCE-backed Cross Fusion Strike, Genesect Techno Blast / Energy Mix donor selection, and no inference that DCE pays standalone Psychic or Metal costs.
- Forest Seal Stone / Star Alchemy from whichever actor-owned Pokémon V carries the Tool; once per game and after useful draw abilities. Search Mew VMAX, DCE for any unpowered Mew VMAX including the Bench, or other contextual setup.
- Special Charge recovery, discard protection for the last Mew VMAX and scarce DCE, and Path to the Peak sequencing.
- Guzma target scoring at 210 damage plus 20 only for visibly attached Muscle Band.
- Secret Box distinct supporter/item/tool/stadium categories; abstain if category metadata is missing.
- Public target disambiguation: when identical Pokémon printings are on the board, use `targetZone` and `benchIndex`; if the target remains ambiguous, abstain rather than scoring the first matching printing.

## Paper-rule resolution: Cross Fusion Strike donor Energy

The repository's Advanced Player’s Rulebook Ver. 3.4 resolves the donor-cost question:

- Section C-18, “Use it as this attack,” says the chosen attack's effects and damage apply even if the attacking Pokémon does not have the Energy for the chosen attack's cost, unless otherwise specified.
- Section D-09 gives Ditto's Copy Anything as the explicit exception: its text specifically requires the necessary Energy for the chosen attack.
- The exact repository card text in `resources/cards/en/swsh8.json` for Mew VMAX SWSH8 114 is “Choose 1 of your Benched Fusion Strike Pokémon's attacks and use it as this attack.” It has no additional donor-Energy condition. Mew V SWSH8 113's Energy Mix costs Psychic; Genesect V SWSH8 185's Techno Blast costs Metal, Metal, Colorless.

Therefore Mew VMAX pays its own two-Colorless Cross Fusion Strike cost; it does not separately pay the copied Energy Mix or Techno Blast cost. This is a paper-rulebook conclusion, not a simulation result. Twinleaf's implementation of this interaction remains untested and must be checked separately before relying on native results.

## Actor-only information boundary (source audit)

A direct source scan of the committed policy finds only these `observation` roots: `globalTurn`, `ownHand`, `ownPublic`, `opponentPublic`, and `ownTurnResources`. Its opponent-side reads are limited to public `handCount` and `prizeCount`; it does not read opponent hand contents, opponent deck contents, private opponent zones, seed/RNG inputs, or a global game-state object. Own-hand reads are actor-authorized. This is a source-level audit of the policy module, not a runtime isolation proof; the V3 worker protocol and native actor-view gate remain independently required.

## Tests and suite

Test file: `tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

- 32 Node tests authored, importing Agent49 V3 validators.
- Executed: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs` using Node **v22.16.0** in a temporary local test tree reconstructed from the exact committed test, policy and worker-protocol blobs. Git blob SHA-1s were verified against the repository before execution.
- Result: **32 passed, 0 failed, 0 skipped**, 127.52 ms. The full repository and submodule were not checked out; the test imports only these two modules plus Node built-ins.
- A separate isolated V8 CommonJS shim also passed 32/32 as supplemental evidence. Neither run invokes the worker `run()` loop, stdio process protocol or IPC.

## Test-fixture corrections and supplemental validation

Two fixture defects were corrected without changing policy behavior:

- The test helper now captures the return from `protocol.validateInit(init)` and spreads that accepted init envelope directly into `createPolicy({...accepted, rng})`, matching the shared worker's actual factory call. The module rejects any non-empty runtime config. Rank/source/candidate identity remains fixed in module constants and v8 manifests.
- The Secret Box missing-category case now presents four selectable cards (two Supporters, one Item, one Stadium) with the required four-selection bounds, but still omits a Tool. This keeps the synthetic prompt structurally valid while exercising the intended fail-closed category check.

The authored test file has now passed under Node's actual `node:test` runner. This validates the policy unit cases and direct `validateInit` boundary only; it is not a full worker-process, stdio or IPC execution.

Frozen suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v8.json`
- 25 development cases and 5 held-out cases (30 total).
- The suite remains `draft-blocked-not-attestable`. All 30 scenario records are synthetic/non-admitting; each has a null native trace digest, null native acceptance receipt, and `gameCount: 0`. No exact runtime actor-view digests, native receipts, traces, games, or seeds exist.

## Node test-runner execution

At **2026-11-19T20:52:56.041367536Z–2026-11-19T20:52:56.228297307Z**, the exact test file was run with Node **v22.16.0**:

```sh
node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs
```

Result: **32 passed, 0 failed, 0 skipped**, duration **127.52 ms**. The temporary local tree `/tmp/agent20-rank5-node-test` contained only the exact committed test, policy and Agent49 worker-protocol blobs. Before running, `git hash-object` matched each local file to the current GitHub blob:

- Test: `67a7e1e94437e176ad39da794f63b40807b2e88c`
- Policy: `7aff8fcc77351655083fec49cb4318cf4563f7f2`
- Worker protocol: `d51ea95c457d61b50a9ee114d342eb17f4350451`

This was an actual Node `node:test` execution, but not a full repository/submodule checkout. The test file directly calls exported protocol validators and policy functions. It does **not** spawn the worker, execute `run()`, exercise stdio framing or IPC, start Twinleaf, or play games.

## Direct V8 worker-init smoke (supplemental; not Node test execution)

The exact committed Agent49 worker source blob `d51ea95c457d61b50a9ee114d342eb17f4350451` and rank-5 v8 policy source blob `7aff8fcc77351655083fec49cb4318cf4563f7f2` were loaded as CommonJS modules in an isolated V8 runtime. Only the worker's top-level `node:events` and `node:crypto` imports were stubbed; the worker `run()` loop, OS interfaces, Twinleaf and game execution were not invoked.

- The real exported `validateInit` accepted role `opponent`, seat 1, the v8 policy version, a valid 64-hex bundle digest, and `config: {}`.
- The real policy `createPolicy` returned an object with a callable `decide` when passed the accepted init fields plus the worker-supplied RNG property.
- A non-empty config was rejected by the worker with `UNKNOWN_FIELD` and by the policy with `AGENT20_RANK5_POLICY_INIT_MISMATCH`.

This smoke plus the subsequent 32/32 Node unit-test run validate the narrow zero-key factory boundary and policy test cases. Neither starts the worker run loop or IPC, establishes native reachability or strategic competence, or produces matchup/game/win-rate evidence. The frozen challenge scenarios remain unexecuted.

## Supplemental V8 test-file execution (not Node)

At **2026-11-19T20:41:00.249Z**, the exact current blobs were loaded as CommonJS modules in the isolated V8 runtime and all **32/32** synchronous test callbacks passed with zero failures:

- Test file blob: `67a7e1e94437e176ad39da794f63b40807b2e88c`
- Policy module blob: `7aff8fcc77351655083fec49cb4318cf4563f7f2`
- Agent49 worker protocol blob: `d51ea95c457d61b50a9ee114d342eb17f4350451`

The V8 harness supplied a minimal `node:test` registration shim and the three assertion methods actually used by this file (`equal`, `deepEqual`, and `throws`); the worker and policy source themselves were evaluated unchanged. All tests are synchronous. The worker's `run()` loop, process I/O, worker IPC, OS interfaces, Twinleaf, and game execution were not invoked. This V8 result is supplemental only; the separate actual Node `node --test` pass is recorded above. Neither result is a worker-process/IPC attestation, native Store result, or competitive evidence.

## Hash closure

| Artifact | SHA-256 |
|---|---|
| Policy module | `807e194830fde3db282399f4db7043d813e453c9d6ba2b2f95965c2a8fe3c928` |
| Test file | `831610d6d12865a823a423ee229f8909dfa351cedfa4a733bb6d53468687dcd0` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v8 | `9f801c9e37758815bbd72bb138e6ec0cef45022837d016500943444069766626` |
| Dependency manifest v8 | `8f53e9274af3e25e5f522b9a52ccadd76390c5d2db37333e89c0f8e877c3e347` |
| Challenge suite v8 | `2c1e455c1b24821f8d268e0c75a4aa327ebd2ca5f0d74afd8831777c19c372a0` |
| Producer binding v8 | `f78243222c46b46ec4f04dc7a532b43630dd754031c469866e6fcad266462441` |

The dependency/suite/binding digests are SHA-256-bound to current GitHub file contents. The producer binding is diagnostic only: candidate-policy and bundle producer IDs remain null, the producer set is incomplete, and canonical Agent36 V3 registration is absent.

## Admission

No strategic-competence, native-reachability, matchup, or win-rate claim is made. Independent reviewer remains unassigned; reviewer registry is empty; owner hold remains active. The authored Node unit tests have passed, but before native evaluation the panel still needs exact actor-view fixtures, independent review, canonical producer registration, and Critic authorization. No games, seeds, CI, candidate changes, or Twinleaf changes are authorized by this artifact.

This is rank-5-only opponent policy work, not full Aichi Top 32 coverage and not evidence for the 99.5% target.


## Worker-init contract correction — v8

The shared Agent49 V3 worker calls `validateInit()` and requires `config: {}`; policy-specific settings are frozen in the role-only bundle. V7 incorrectly required rank, source fingerprint and candidate fingerprint in `createPolicy(config)`, making the policy uninitializable through the real worker despite the earlier test helper validating an empty init envelope.

V8 removes that runtime config dialect. `createPolicy` now accepts only an empty config object, while rank 5, the exact source fingerprint, the candidate fingerprint, engine pin and policy version remain immutable module constants and are bound by the v8 dependency/challenge/producer manifests. The focused regression passes an empty init payload through the actual exported `validateInit`, then instantiates the module with the accepted fields and worker-supplied RNG property; it also asserts that non-empty config is rejected by both boundaries.

The exact Node unit-test file passed under Node v22.16.0 (32/32), and the isolated V8 shim also passes 32/32. These tests call `validateInit` and policy functions directly; they do not start the worker run loop or IPC. No full worker-process initialization pass, native reachability, independent competence, matchup result, game count, or win-rate claim is made. The policy remains diagnostic-only and is not inserted into the canonical Agent36 bundle.
