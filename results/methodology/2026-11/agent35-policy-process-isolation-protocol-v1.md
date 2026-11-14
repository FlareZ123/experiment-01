# Proposed V3 actor-policy process boundary (protocol v1)

**Agent 35 · 14 November 2026 · Proposal, not implemented**

## Objective

Make the policy's information set enforceable by construction. The engine must retain the complete Twinleaf state, physical RNG, shuffled deck order, opponent hidden zones, and source/deck files. A policy must receive only its own actor observation, public prompt context, and its own allowed configuration, then return a typed intent. The engine validates and translates that intent into a native action.

This protocol is intended to replace the current same-process actor wrapper as the security boundary. The current source-level gap is documented in [the process-isolation audit](agent35-v3-policy-process-isolation-audit-20261114.md).

## Trust boundary

Two separate execution domains:

- **Engine/adapter process (trusted):** Twinleaf store and state, physical RNG/seed, deck permutations, both deck files, all hidden zones, native action objects, and the authoritative legality/phase/owner checks.
- **Policy process (untrusted with respect to hidden information):** one role's policy bundle, its own decklist/configuration, public card metadata, independent policy RNG, and serialized actor observations/public prompt choices. It has no mount or permission for the engine source, opponent deck file, physical seed, engine process memory, network, or child processes.

Use an OS-level sandbox/container or an equivalently enforceable permission boundary. A Node `vm` context, CommonJS module hash pin, or static source scan alone is not sufficient. Node's built-in Permission Model can be useful defense-in-depth, but Node explicitly describes it as a "seat belt" that does **not** provide security guarantees against malicious code; do not treat `--permission` as the sole isolation boundary ([Node 22 permissions documentation](https://nodejs.org/download/release/latest-v22.x/docs/api/permissions.html)).

## Request protocol

Use newline-delimited JSON over stdin/stdout or a private IPC channel. No shared in-process objects or object references.

Initial handshake:

```json
{
  "schema": "ptcg-policy-session-v1",
  "game_id": "opaque-public-id",
  "role": "candidate",
  "seat": 0,
  "policy_id": "frozen-policy-id",
  "policy_bundle_sha256": "64-hex-digest",
  "policy_rng_seed": "independent-per-game-seat-seed",
  "own_deck": [
    {"card_id": "canonical-card-id", "count": 4}
  ],
  "public_card_catalog_sha256": "64-hex-digest"
}
```

The policy always receives its own decklist. An opponent decklist may be included only if the benchmark's explicit in-game information contract declares open decklists; otherwise omit it. In either case, never include opponent deck order, physical seed, engine pin paths, private artifacts, raw game state, or engine object handles. The candidate-vs-Aichi benchmark must state whether the historical opponent list is an allowed public meta input or only an evaluation-side fixture input.

Each decision request:

```json
{
  "schema": "ptcg-policy-request-v1",
  "game_id": "opaque-public-id",
  "request_id": "monotonic-opaque-id",
  "decision_sequence": 17,
  "seat": 0,
  "phase": "main",
  "observation": {
    "own_public": {},
    "opponent_public": {},
    "own_hand": [],
    "own_deck_count": 42,
    "own_prize_count": 6,
    "public_history": []
  },
  "prompt": {
    "kind": "optional-engine-prompt-kind",
    "visible_choices": []
  },
  "legal_intent_schema": "ptcg-intent-v1",
  "public_state_hash": "64-hex-digest"
}
```

The schema above is illustrative; final field definitions must reuse and version the existing actor-observation contract rather than create a second inconsistent game-state model. The engine serializes only information the acting player may legitimately observe. Own hand and own private prompt options may be included; opponent hand, opponent prizes, opponent deck order, and physical RNG state must not be.

## Response protocol

```json
{
  "schema": "ptcg-policy-response-v1",
  "game_id": "opaque-public-id",
  "request_id": "same-request-id",
  "decision_sequence": 17,
  "seat": 0,
  "intent": {
    "kind": "play-card",
    "source": "frozen-policy-rule-id",
    "card_ref": "actor-visible-card-reference",
    "target": {"zone": "bench", "slot": 2}
  }
}
```

The policy returns a serializable intent, never a Twinleaf class instance or native action object. The engine verifies the request ID, seat, decision sequence, public-state hash, phase, prompt ownership, card visibility, target, and action legality against the live state before constructing and dispatching the native action. Stale, malformed, out-of-scope, or illegal responses fail closed and are counted by privacy-safe reason code.

Every prompt response (including setup, card selection, confirmation, and attack selection) is a separate request through the same boundary. Do not leave a prompt continuation callback in the engine process if it contains policy decision logic; keep only trusted serialization, validation, and native action construction there.

## RNG and reproducibility

- Physical shuffle RNG remains engine-process-only. Do not expose the physical seed or derived state to policy process, environment, logs, source bundle, or public artifacts.
- Policy RNG is independent and per game/seat. Its seed is recorded in the public experiment manifest if deterministic policy behavior is intended; it must never be derived from the physical seed.
- For a confidential physical seed, generate a high-entropy seed inside the engine process and use a cryptographic stream generator. Publish a cryptographic commitment and experiment metadata; optionally escrow the seed in the existing owner-encrypted diagnostic artifact so the owner can reproduce the game without exposing it to policies or public readers.
- If the owner explicitly chooses public physical-seed reproducibility, record that the benchmark is trusted-code-only unless policies are isolated from the public seed-bearing source/deck files.

## Adversarial canary tests

Before any actor-only result is admitted, run a policy canary that attempts all of the following from inside the policy process:

1. Read `simulation/evaluation/2026-11/agent36-v3-runner.cjs`.
2. Read `results/aichi-2026/candidate-hood-shadow-rider.json` and the opponent deck file.
3. Read the physical seed or seed commitment source, including `process.env`, cwd traversal, module cache, and environment introspection.
4. Load `node:fs`, `node:module`, `node:child_process`, `node:worker_threads`, `node:inspector`, and attempt a network connection.
5. During a decision, redefine `Math.random` with an accessor setter that captures the value assigned by the adapter's cleanup path; assert that the policy cannot capture or invoke the engine's physical RNG function.
6. Access a prompt option or hidden-zone field not included in the actor request.

The canary passes only if these attempts are denied or the requested hidden data is absent. It should also prove that legitimate actor-visible choices and the typed action protocol still work. A static scanner may be retained as defense-in-depth but cannot replace this runtime test.

## Migration path

1. Freeze the existing actor-observation and public-prompt JSON schemas; add schema hashes and serialization tests.
2. Extract a pure policy-decision entrypoint from `agent34-actor-only-root-policy.cjs` that accepts only JSON and returns an intent. Move native class construction and all Twinleaf state access into the engine adapter.
3. Implement one policy worker and one candidate-seat end-to-end test using a fake store. Verify request/response validation, stale response rejection, prompt ownership, and action mapping.
4. Add the malicious canary tests above and demonstrate filesystem/network/process denial.
5. Run exactly one existing frozen fixture with the same candidate, opponent, seat mapping, first-player assignment, and registered game seed model. Keep raw diagnostics encrypted; report only sanitized policy requests, intents, native actions, terminal reason, and privacy-safe boundary counters.
6. Only after that succeeds, extend to both roles and the full 32-rank panel. Preserve the policy bundle digest, sandbox image/runtime version, engine commit, adapter commit, per-game policy RNG seeds, opponent list hashes, and all attempts.

## Status and limits

- This is a design proposal, not implemented code or evidence of a secure sandbox.
- The current V3 actor-only boundary remains invalid and the first fixture is diagnostic-only.
- This proposal does not change the fixed 60-card candidate, Aichi field admission, any matchup result, or win-rate estimate.
