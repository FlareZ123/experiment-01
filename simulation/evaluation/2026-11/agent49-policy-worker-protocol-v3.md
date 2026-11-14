# Agent49 policy-worker protocol v3

**Status:** worker-side validation and response contract are implemented. Agent36 has landed the host prompt projector/dispatcher refactor: actor-seat binding, per-item tokens, typed select-choices mapping and native raw-result validation are in place. The legacy token-only dispatcher fallback and actor-relative ownerSeat/isOwnerVisible metadata remain to be closed; the persistent async fixture loop remains unintegrated and the launcher/capability/RNG/permission gate remains unverified. The shared async session now arms response waiters before writes, rejects unsolicited/duplicate stdout, and bounds stderr by UTF-8 bytes; its regression tests have not been run under Node or GitHub Actions. This is an interface specification, not evidence of a completed simulator or competitive result.

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

The worker exports the protocol constants and pure validators from `agent49-policy-worker.cjs`. Host response validation should use the exported `RESPONSE_SCHEMA`, not duplicate a literal.

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

## Actor and prompt boundary

- `validatePrompt(prompt, seat)` requires `prompt.actingSeat === seat`; the host must include `actingSeat: actorSeat` and pass the seat argument.
- Actor observations use exact nested schemas for own hand, own/public player state, opponent public state, turn resources, Pokémon, restrictions, and owner-known information.
- Opponent hidden hand/decklist/hidden-zone aliases and other forbidden native/private state fields are rejected.
- Public event receipts are versioned and checked against the actor seat, turn, owner active/bench, prior-turn attack facts, and Copycat-related public evidence.
- Public Stadium state and complete known ability-suppression records are part of the actor view where applicable.
- The worker's structural validation does not prove the host constructed the view truthfully, and it does not prove runtime RNG denial or Docker isolation.

## Host integration checklist

1. [x] Include `actingSeat: actorSeat` in the frozen prompt projection and call `protocol.validatePrompt(frozen, actorSeat)`.
2. [x] For the five multi-select prompt types, emit individual item tokens plus the required special choices; remove combination/permutation enumeration.
3. [x] Pass the complete validated decision object to the prompt dispatcher. Remove the remaining legacy token-only fallback before declaring the boundary closed.
4. [x] Map ordered token arrays to native raw selections and run native decode/validation before Store dispatch.
5. [x] Omit undefined source/target indices (Agent36 has added the source-index guard and regression test).
6. [ ] Emit actor-relative `ownerSeat` and `isOwnerVisible` metadata where the target projection makes them unambiguous.
7. [ ] Integrate the persistent worker into the awaited fixture loop with timeout, abort, stale-prompt and illegal-decision handling.
8. [ ] Keep the existing launcher/RNG/permission gate closed until its separate tests pass.

## Current evidence and limitations

- Worker module and tests compile syntactically in the available V8 isolate.
- Pure-validator V8 smoke checks have exercised full request validation, actor-bound prompts, all five multi-select types, selection bounds, unique/unknown/special tokens, hidden opponent-hand/decklist aliases, versioned event receipts, Stadium/ability-suppression metadata, and analysis-only action exclusion.
- A persistent Node worker-process regression is committed to verify response-v3 serialization and ordered `select-choices`, but has not yet been run.
- No GitHub Actions contract pass, Docker isolation pass, native fixture game, opponent matchup result, deck nomination, or competitive win-rate claim is established.

