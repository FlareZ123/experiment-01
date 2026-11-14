# Agent49 policy-worker protocol v3

**Status (2026-11-14):** the async Docker-worker fixture path, actor-bound prompt projection, per-item action frontier, typed multi-select mapping, and native raw-result validation are implemented in the current integration branch. Host code now imports the pure protocol module separately; candidate/opponent policy source is hash-pinned in role manifests but must not be evaluated by the host preloader. The worker bundle contains the worker executable, protocol module, and one role policy. The worker evaluates policy source in a restricted VM context with code generation disabled, no ambient process/module/clock/network/timer/crypto globals, and a sealed VM Math binding. A worker-local CSPRNG stream is created inside each worker and exposed only through a non-serializable `rng` closure; the VM Math.random wrapper uses the same counted stream. Any policy draw fails closed for the current evidence protocol, so competitive policies must remain zero-draw until the owner approves a reproducible entropy model. These changes and their regression tests are not yet accepted: pinned Node 24 Docker execution, host-preload sentinel test, manifest closure tests, cleanup assertions, CI contract lane, and owner seed-disclosure decision remain pending. This is an interface and acceptance specification, not evidence of a completed simulator or competitive result.

## Envelope and projection versions

| Layer | Schema/version |
|---|---|
| Worker init | `aichi-policy-worker-init-v2` |
| Worker ready | `aichi-policy-worker-ready-v2` |
| Decision request | `aichi-policy-request-v2` |
| Decision response | `aichi-policy-response-v3` |
| Actor observation | `aichi-actor-observation-v2` |
| Owner prompt projection | `aichi-owner-prompt-projection-v3` |
| Action frontier | `aichi-action-frontier-v1` |
| Public event receipt | `agent8-public-event-receipt-v3-turn-stamped` |

The pure protocol constants and validators live in `agent49-policy-protocol.cjs`; the host runner, async session, prompt projector, and action-frontier adapter import this module. The Docker bundle separately includes `worker.cjs`, `agent49-policy-protocol.cjs`, and the role-specific `policy.cjs`. Host response validation should use the exported `RESPONSE_SCHEMA`, not duplicate a literal.

## Decision union

- Root/action decision: `{ kind: 'select-action', token }`. The token must belong to the validated native-action set for the current frontier.
- Single-choice prompt decision: `{ kind: 'select-choice', token }`.
- Multi-choice prompt decision: `{ kind: 'select-choices', tokens: [...] }`.
- Safe refusal: `{ kind: 'abstain', reasonCode }`.

A decision must match the current root/prompt state. A root cannot select a prompt choice; a prompt cannot select a root action. Tokens are opaque, bounded strings from the current request only.

## Multi-select contract

Multi-select prompt types are exactly:

| `selectionType` | Required cardinality |
|---|---|
| `card-combination` | `minimumCount` through `maximumCount` |
| `pokemon` | `minimumCount` through `maximumCount` |
| `energy-payment` | 1 through `energyCount` (fallback: `count`) |
| `prize-slots` | exactly `requiredCount` |
| `card-order` | exactly `count`; token-array order is semantically significant |

The effective maximum is clamped to the number of selectable item choices currently visible in the prompt. A minimum larger than the visible choice count invalidates the prompt.

For `select-choices`:

1. `tokens` must be a nonempty array of at most 512 strings.
2. Every token must be present in the current prompt choice list.
3. Tokens must be unique.
4. Cancel and empty-selection special tokens cannot appear inside the array.
5. The array length must satisfy the prompt's validated bounds.
6. The worker preserves token order exactly; this is required for `card-order`.

Special choices use `select-choice`, never an empty `select-choices` array:

- Exactly one `kind: 'cancel'` choice is required iff `allowCancel === true`. It represents cancellation and is invalid otherwise.
- Exactly one `kind: 'empty-selection'` choice is required iff the minimum count is zero. It represents a valid zero-item selection, distinct from cancellation.
- For a multi-select prompt, `select-choice` may select only one of those special choices. Selecting an ordinary item token singly is rejected, even if the min/max happens to be one.

The host must project one token per selectable item, not enumerate all combinations or permutations. The item choice kind is fixed by selection type: `card-combination` → `card`, `pokemon` → `pokemon`, `energy-payment` → `energy`, `prize-slots` → `prize`, and `card-order` → `card-order-item`. The validator rejects combination/set/permutation rows masquerading as individual items. The host maps a `select-choices` token array, in order, to the corresponding native raw-result array, then invokes the native prompt's decode/validation path before dispatching `ResolvePromptAction`. A cancel token maps to the native cancellation value; an empty-selection token maps to the valid empty raw result.

## Action frontier and executable authority

The only executable action kinds are:

- `play-card`
- `attack`
- `retreat`
- `use-ability`
- `use-stadium`
- `pass`

`projected-attack` rows may be included for analysis/evaluation but are explicitly excluded from the token set authorizing `select-action`. A policy selecting one fails closed with `POLICY_SELECTED_UNKNOWN_ACTION`.

Flat action metadata may include actor-relative `ownerSeat`, `targetSeat`, `sourceSeat`, `targetIndex`, `sourceIndex`, and `isOwnerVisible`. Seat values are actor-relative (`actor` or `opponent`); indices, when present, must be non-negative safe integers. Do not assign an optional index property to `undefined`: the validator rejects own-properties with undefined values. Omit the property when no public index exists.

## Docker OS canary separation

`agent49-policy-worker.cjs` is the production worker and evaluates role policy source inside the restricted VM. It must not be weakened to permit filesystem, process, child-process, worker-thread, or network probes.

`agent49-docker-canary-worker.cjs` is a separate test-only executable used by the Docker OS-isolation canary. It deliberately loads the canary policy in the Node process inside the container so the policy can attempt the OS operations the Docker boundary is supposed to restrict. It is pinned as a test data asset, is not a role-manifest entrypoint, and must never be included in a competitive worker bundle. VM capability tests and Docker OS canary tests are separate acceptance layers.

## Actor and prompt boundary

- `validatePrompt(prompt, seat)` requires `prompt.actingSeat === seat`; the host must include `actingSeat: actorSeat` and pass the seat argument.
- Actor observations use exact nested schemas for own hand, own/public player state, opponent public state, turn resources, Pokémon, restrictions, and owner-known information.
- Opponent hidden hand/decklist/hidden-zone aliases and other forbidden native/private state fields are rejected.
- Public event receipts are versioned and checked against the actor seat, turn, owner active/bench, prior-turn attack facts, and Copycat-related public evidence.
- Public Stadium state and complete known ability-suppression records are part of the actor view where applicable.
- The worker's structural validation does not prove the host constructed the view truthfully. The restricted VM and worker-local RNG implementation are defense-in-depth; they remain unverified until the pinned Node 24 Docker acceptance tests pass. Host policy entrypoints are hash-checked but never evaluated in the host process.

## Host integration and worker acceptance checklist

1. [x] Include `actingSeat: actorSeat` in the frozen prompt projection and call `protocol.validatePrompt(frozen, actorSeat)`.
2. [x] For the five multi-select prompt types, emit individual item tokens plus the required special choices; remove combination/permutation enumeration.
3. [x] Pass the complete validated decision object to the prompt dispatcher and validate it at the dispatcher boundary before mapping raw results.
4. [x] Map ordered token arrays to native raw selections and run native decode/validation before Store dispatch.
5. [x] Omit undefined source/target indices and retain the source-index regression test.
6. [ ] Emit actor-relative `ownerSeat` and `isOwnerVisible` metadata where the target projection makes them unambiguous.
7. [x] Integrate the persistent worker into the awaited fixture loop with timeout, abort, stale-prompt and illegal-decision handling.
8. [x] Keep the Docker worker executable out of host source closure; hash-check role policy entrypoints without host evaluation.
9. [x] Bundle the worker executable, pure protocol module, and role-specific policy source together.
10. [x] Create worker-local CSPRNG state inside the worker and expose only a non-serializable `rng` closure; do not add a seed or RNG object to IPC.
11. [x] Count all policy RNG draws (including VM `Math.random`) and fail closed if a policy draws under the current evidence protocol.
12. [ ] Run the complete pinned Node 24 Docker worker tests, real role-manifest tests, host-preload sentinel test, and temporary-bundle cleanup assertions.
13. [ ] Pass the existing `contract_only` gate and obtain independent review of the integration diff.
14. [ ] Obtain the owner's explicit physical-seed / policy-entropy disclosure decision before any canary or fixture dispatch.

## Current evidence and limitations

- Worker module and tests compile syntactically in the available V8 isolate.
- Pure-validator V8 smoke checks have exercised full request validation, actor-bound prompts, all five multi-select types, selection bounds, unique/unknown/special tokens, hidden opponent-hand/decklist aliases, versioned event receipts, Stadium/ability-suppression metadata, and analysis-only action exclusion.
- A persistent Node worker-process regression is committed to verify response-v3 serialization and ordered `select-choices`, but has not yet been run.
- No GitHub Actions contract pass, Docker isolation pass, native fixture game, opponent matchup result, deck nomination, or competitive win-rate claim is established.

