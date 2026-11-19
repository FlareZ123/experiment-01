# Rank 11 Absol / Garbodor opponent policy v1

**Status:** prototype only; not registered with the native runner; no matchup games.

## Deliverable

- Policy: `simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs`
- Tests: `tests/2026-11/agent31-rank11-absol-garbodor-opponent-policy.test.cjs`
- Dependency manifest: `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-dependencies.json`
- Challenge suite: `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-challenge-suite.json`

## Exact benchmark bindings

- Aichi source rank: **11**, Wataru Yano, Mega Absol / Garbodor.
- Source list: `results/aichi-2026/full-decklists.json`, 60 cards.
- Source file Git blob SHA-1: `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Rank-entry SHA-256: `0da7b283f0416c883eda2825267a8e51e2d3b55ec130a2103da6539d04b350e6`, calculated over `JSON.stringify(parsed rank-11 entry)`.
- Candidate: `results/aichi-2026/candidate-hood-shadow-rider.json`; Git blob SHA-1 `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`; full-object JSON SHA-256 `4c18dd93ba49fd8f7d88aad573249dc6941b4cf61d52b99f80309345b5d58c59`.
- Paper-legal candidate export: `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`.
- Twinleaf submodule: `vendor/twinleaf`, pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Agent49 worker protocol: `d51ea95c457d61b50a9ee114d342eb17f4350451`.

The opponent list is an English Expanded-legal diagnostic reconstruction; its physical paper print identity is not verified. The candidate remains a research candidate, not the nominated best deck.

## Policy shape

The module is deterministic, takes only the V3 actor-visible request, accepts seats 0 and 1, and fails closed on unsupported prompts. Its init configuration is deliberately `{}`: the current Agent49 worker's `validateInit` enforces an empty config. Source and candidate identities are embedded as immutable constants and verified by the tests and dependency manifest.

The first policy priorities are:
1. Early Battle VIP Pass / Quick Ball setup for Trubbish, Oranguru V, and Mega Absol.
2. Oranguru V's Back Order search for Forest Seal Stone and Float Stone.
3. Boost Shake into Garbodor when Trubbish is present, with Tool placement treated as part of the Garbotoxin setup.
4. Mega Absol pressure, using Terminal Period only at exactly 60 damage counters; Claw of Darkness also chooses a high-priority card from the opponent's revealed hand.
5. Squawkabilly ex Motivate and Trubbish Call for Family sequencing to build the Mega Absol attack line.
6. Retreat only when Mega Absol has a payable attack line; Dark Patch energy placement, Marnie disruption, Guzma target selection, and protected discard choices.
7. Abstention when prompt types or target identity are not sufficiently represented.

These are policy heuristics, not validated claims of competitive strength.

## Validation

**28/28 deterministic test cases passed** in an isolated V8 harness. The harness evaluated the committed test source with Node builtin shims while invoking the actual Agent49 worker module and its `validateInit`, `validateRequest`, and `validateDecision` validators. It also checked the exact source-list and candidate fingerprints.

This was not a Node `--test` runner execution, a Twinleaf execution, a native staged action, or a game. No native receipt, full-match transcript, matchup result, win-rate estimate, or 99.5% evidence exists.

- Policy SHA-256: `28939bb2c257ab444a065760fe3d10e963b37bf373e071d4e524019988cc1d80`
- Test SHA-256: `eb6084e8462007b40e1e3f1874e98a90135974e535e40b275972e1eca560fa95`
- Dependency manifest SHA-256: `a442424315e30bd348937f47232a3051f75563aca60c15af5c09dabe8206c6ad`
- Challenge suite SHA-256: `bd1ebbbf7e4358d91d3f16d44b7b958d956d74c8449dbd2ff30819bac069ebea`

## Native integration gate

The current Agent49 protocol-v3 document marks the persistent async fixture loop and Docker launcher/capability/RNG/permission gate as unverified. The Agent36 runner does contain Docker-session and asynchronous native-game code, but its `V3_FIXTURE` is hard-coded to the Hood candidate versus the Aichi **rank-1** Shadow Rider list, using Agent6's rank-1 opponent policy; it has no rank-11 override. The corresponding workflow also requires explicit public physical-seed disclosure and a diagnostic recipient key. Therefore this rank-11 policy is not registered and was not run natively. A separate, reviewed rank-11 fixture/registration is required; do not repoint the rank-1 fixture or bypass its gates. Runner Git blob SHA-1: `42252eac8247a8d5bc7a1f18a806d7501ee6ff0f`; workflow Git blob SHA-1: `962df78f624e7d3b5733f2dadd8e6fb0a75f79fe`.

## Development and held-out coverage

The suite records twelve synthetic development cases with full actor-packet digests and four unexecuted held-out review cases. The held-out cases target seat-1 parity, Secret Box category selection, Tool-less Boost Shake, and Claw of Darkness damage conversion. They are not counted as passed tests.

## Next work

1. Keep this policy out of native producer registration until the current first-game gate is complete.
2. Replay actual rank-11 prompts and root frontiers against the pinned Twinleaf revision; replace synthetic assumptions with captured actor-only traces.
3. Resolve the held-out cases and verify Garbotoxin/Tool and Boost Shake timing with executable rules evidence.
4. Only after a valid native staged decision and effect receipt, add rank-11 to any matchup matrix. Do not infer win rate from these unit tests.
