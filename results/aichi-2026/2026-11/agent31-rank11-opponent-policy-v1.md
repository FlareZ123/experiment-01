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
4. Mega Absol pressure, using Terminal Period only at exactly 60 damage counters and otherwise preferring Claw of Darkness when payable.
5. Dark Patch energy placement, Marnie disruption, Guzma target selection, and protected discard choices.
6. Abstention when prompt types or target identity are not sufficiently represented.

These are policy heuristics, not validated claims of competitive strength.

## Validation

**22/22 deterministic test cases passed** in an isolated V8 harness. The harness evaluated the committed test source with Node builtin shims while invoking the actual Agent49 worker module and its `validateInit`, `validateRequest`, and `validateDecision` validators. It also checked the exact source-list and candidate fingerprints.

This was not a Node `--test` runner execution, a Twinleaf execution, a native staged action, or a game. No native receipt, full-match transcript, matchup result, win-rate estimate, or 99.5% evidence exists.

- Policy SHA-256: `28939bb2c257ab444a065760fe3d10e963b37bf373e071d4e524019988cc1d80`
- Test SHA-256: `6493e7a95c1b22c3f7e888d62ec0c046ff10965b188a68eeaa1f33178d9afc54`
- Dependency manifest SHA-256: `6cb5d85c54e69c32a69da16ef81f80895e847bdbae0ae5a0aef1b99c152acdee`
- Challenge suite SHA-256: `74b24189958403e501cce3741cc7d086cf0d7facc56d7bacc3b0b6b4c2e49bfe`

## Development and held-out coverage

The suite records eight synthetic development cases with full actor-packet digests and four unexecuted held-out review cases. The held-out cases target seat-1 parity, Secret Box category selection, Tool-less Boost Shake, and Claw of Darkness damage conversion. They are not counted as passed tests.

## Next work

1. Keep this policy out of native producer registration until the current first-game gate is complete.
2. Replay actual rank-11 prompts and root frontiers against the pinned Twinleaf revision; replace synthetic assumptions with captured actor-only traces.
3. Resolve the held-out cases and verify Garbotoxin/Tool and Boost Shake timing with executable rules evidence.
4. Only after a valid native staged decision and effect receipt, add rank-11 to any matchup matrix. Do not infer win rate from these unit tests.
